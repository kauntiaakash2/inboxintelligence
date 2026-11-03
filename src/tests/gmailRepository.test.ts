import { describe, expect, it, vi } from 'vitest'
import {
  GmailEmailRepository,
  abortableDelay,
} from '../repositories/gmailEmailRepository'
import { normalizeGmailMetadata } from '../repositories/gmailMetadata'
import { GmailError, safeGmailError } from '../services/gmailErrors'
import { gmailMetadata, jsonResponse } from './googleFixtures'
import { loadInbox } from '../services/loadInbox'
import { MemoryInstrumentation, calculateMetrics } from '../services/metrics'
function setup(fetcher: typeof fetch) {
  const controller = new AbortController()
  const unauthorized = vi.fn()
  const progress = vi.fn()
  const sleep = vi.fn(async () => {})
  const repo = new GmailEmailRepository({
    token: () => 'test-only-token',
    unauthorized,
    signal: controller.signal,
    fetch: fetcher,
    sleep,
    progress,
  })
  return { repo, controller, unauthorized, sleep, progress }
}
describe('read-only bounded metadata retrieval', () => {
  it('follows pages, deduplicates IDs, sorts metadata and permits only GET metadata', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          messages: [{ id: 'a' }, { id: 'b' }],
          nextPageToken: 'next',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'b' }, { id: 'c' }] }),
      )
      .mockImplementation(async (input) =>
        jsonResponse(
          gmailMetadata(
            new URL(String(input)).pathname.split('/').at(-1),
            String(input).includes('/c?') ? '1793606400000' : '1793520000000',
          ),
        ),
      )
    const { repo, progress } = setup(fetcher)
    const result = await repo.list()
    expect(result).toHaveLength(3)
    expect(result[0]?.id).toBe('c')
    expect(repo.coverage).toMatchObject({
      loaded: 3,
      discovered: 3,
      failed: 0,
      hasMore: false,
    })
    expect(progress).toHaveBeenLastCalledWith({
      phase: 'metadata',
      completed: 3,
      total: 3,
    })
    for (const [input, init] of fetcher.mock.calls) {
      const url = new URL(String(input))
      expect(url.origin).toBe('https://gmail.googleapis.com')
      expect(init).toMatchObject({
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
      })
      expect(init?.body).toBeUndefined()
      expect(url.search).not.toContain('test-only-token')
      if (url.pathname.endsWith('/messages'))
        expect(url.searchParams.get('includeSpamTrash')).toBe('false')
      else {
        expect(url.searchParams.get('format')).toBe('METADATA')
        expect(url.searchParams.getAll('metadataHeaders')).toEqual([
          'From',
          'Subject',
          'Date',
        ])
        expect(url.searchParams.get('fields')).not.toMatch(
          /body|snippet|attachment/,
        )
      }
    }
    expect(
      new URL(String(fetcher.mock.calls[1]?.[0])).searchParams.get('pageToken'),
    ).toBe('next')
    expect(result[0]).not.toHaveProperty('body')
    expect(result[0]?.snippet).toBe('')
  })
  it('stops at 100 IDs and marks additional coverage', async () => {
    const ids = Array.from({ length: 100 }, (_, i) => ({ id: `m${i}` }))
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = new URL(String(input))
      return url.pathname.endsWith('/messages')
        ? jsonResponse({ messages: ids, nextPageToken: 'more' })
        : jsonResponse(gmailMetadata(url.pathname.split('/').at(-1)))
    })
    const { repo } = setup(fetcher)
    expect(await repo.list()).toHaveLength(100)
    expect(repo.coverage.hasMore).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(101)
    expect(repo.diagnostics).toEqual({
      requestAttempts: 101,
      listAttempts: 1,
      metadataAttempts: 100,
      retries: 0,
    })
  })
  it('handles an empty mailbox without metadata requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}))
    const { repo } = setup(fetcher)
    expect(await repo.list()).toEqual([])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it.each([401, 403, 429, 500, 503])(
    'handles HTTP %s without exposing provider content',
    async (status) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse(
            { error: { message: 'private mailbox details' } },
            status,
          ),
        )
      const { repo, unauthorized, sleep } = setup(fetcher)
      await expect(repo.list()).rejects.toBeInstanceOf(GmailError)
      try {
        await repo.list()
      } catch (error) {
        expect(safeGmailError(error)).not.toContain('private')
      }
      expect(unauthorized).toHaveBeenCalledTimes(status === 401 ? 2 : 0)
      expect(sleep.mock.calls.length).toBe(
        status === 429 || status >= 500 ? 4 : 0,
      )
    },
  )
  it('honors Retry-After and succeeds after a transient failure', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 429, { 'Retry-After': '3' }))
      .mockResolvedValueOnce(jsonResponse({}))
    const { repo, sleep } = setup(fetcher)
    expect(await repo.list()).toEqual([])
    expect(repo.diagnostics).toEqual({
      requestAttempts: 2,
      listAttempts: 2,
      metadataAttempts: 0,
      retries: 1,
    })
    expect(sleep).toHaveBeenCalledWith(3000, expect.any(AbortSignal))
  })
  it('does not retry sooner than a long server-requested delay', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({}, 429, { 'Retry-After': '120' }))
    const { repo, sleep } = setup(fetcher)
    await expect(repo.list()).rejects.toMatchObject({ code: 'rate_limited' })
    expect(sleep).not.toHaveBeenCalled()
  })
  it('preserves successful metadata when an individual message fails', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'good' }, { id: 'bad' }] }),
      )
      .mockImplementation(async (input) =>
        jsonResponse(
          String(input).includes('/good?')
            ? gmailMetadata('good')
            : { id: 'bad', payload: 'malformed' },
        ),
      )
    const { repo } = setup(fetcher)
    expect(await repo.list()).toHaveLength(1)
    expect(repo.coverage.failed).toBe(1)
  })
  it('reports a total metadata failure and network/JSON failures safely', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ messages: [{ id: 'bad' }] }))
      .mockResolvedValue(jsonResponse({}))
    await expect(setup(fetcher).repo.list()).rejects.toMatchObject({
      code: 'malformed',
    })
    await expect(
      setup(
        vi.fn<typeof fetch>().mockRejectedValue(new Error('private')),
      ).repo.list(),
    ).rejects.toMatchObject({ code: 'network' })
    await expect(
      setup(
        vi.fn<typeof fetch>().mockResolvedValue(new Response('bad json')),
      ).repo.list(),
    ).rejects.toMatchObject({ code: 'malformed' })
  })
  it.each([
    null,
    { messages: 'invalid' },
    { messages: [{ id: '../escape' }] },
    { nextPageToken: 42 },
    { messages: [{}] },
  ])('rejects malformed discovery %j', async (page) => {
    await expect(
      setup(
        vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(page)),
      ).repo.list(),
    ).rejects.toMatchObject({ code: 'malformed' })
  })
  it('detects repeated pagination tokens', async () => {
    await expect(
      setup(
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(jsonResponse({ nextPageToken: 'repeated' })),
      ).repo.list(),
    ).rejects.toMatchObject({ code: 'malformed' })
  })
  it('never fetches with expired authorization and respects cancellation', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const controller = new AbortController()
    const repo = new GmailEmailRepository({
      token: () => {
        throw new Error('expired')
      },
      unauthorized: vi.fn(),
      signal: controller.signal,
      fetch: fetcher,
    })
    await expect(repo.list()).rejects.toMatchObject({ code: 'unauthorized' })
    expect(fetcher).not.toHaveBeenCalled()
    expect(repo.diagnostics.requestAttempts).toBe(0)
    controller.abort()
    await expect(repo.list()).rejects.toThrow()
  })
  it('tracks real metadata classification without simulating body requests', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ messages: [{ id: 'a' }] }))
      .mockResolvedValue(jsonResponse(gmailMetadata('a')))
    const { repo, controller } = setup(fetcher)
    const metrics = new MemoryInstrumentation()
    await loadInbox(repo, metrics, 'test-job', undefined, {
      source: 'real',
      signal: controller.signal,
    })
    expect(calculateMetrics(metrics.snapshot(), 'real')).toMatchObject({
      indexed: 1,
      metadataOnly: 1,
      bodyRequests: 0,
    })
    expect(calculateMetrics(metrics.snapshot()).indexed).toBe(0)
  })
})
describe('metadata normalization and safe boundaries', () => {
  it('maps the provider fields and normalizes sender identity', () => {
    expect(normalizeGmailMetadata(gmailMetadata(), 'message1')).toMatchObject({
      sender: {
        id: 'sender@example.test',
        name: 'Test Sender',
        address: 'sender@example.test',
      },
      subject: 'Interview invitation',
      unread: true,
    })
  })
  it('handles missing optional sender/subject without inventing a sender address', () => {
    const value = gmailMetadata()
    value.payload.headers = []
    value.labelIds = []
    expect(normalizeGmailMetadata(value, 'message1')).toMatchObject({
      subject: '(No subject)',
      sender: { name: 'Unknown sender', address: '' },
      unread: false,
    })
  })
  it.each([
    null,
    { ...gmailMetadata(), id: 'wrong' },
    { ...gmailMetadata(), internalDate: 'bad' },
    { ...gmailMetadata(), labelIds: [42] },
    { ...gmailMetadata(), payload: { headers: [{ name: 'From', value: 42 }] } },
    { ...gmailMetadata(), payload: { headers: 'bad' } },
  ])('rejects malformed metadata %j', (value) => {
    expect(() => normalizeGmailMetadata(value, 'message1')).toThrow(GmailError)
  })
  it('accepts legitimately omitted optional metadata fields', () => {
    expect(
      normalizeGmailMetadata(
        { id: 'minimal', internalDate: '1793520000000' },
        'minimal',
      ),
    ).toMatchObject({
      labels: [],
      unread: false,
      subject: '(No subject)',
      sender: { address: '' },
    })
  })
  it('never exposes unknown errors', () => {
    expect(safeGmailError(new Error('private'))).not.toContain('private')
  })
  it('supports cancelable delay', async () => {
    const controller = new AbortController()
    const waiting = abortableDelay(10000, controller.signal)
    controller.abort()
    await expect(waiting).rejects.toThrow()
    await abortableDelay(1, new AbortController().signal)
  })
})

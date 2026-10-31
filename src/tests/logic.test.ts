import { describe, expect, it } from 'vitest'
import { classify, rules } from '../features/classification/classify'
import { mockMessages } from '../data/mock/messages'
import {
  MockEmailRepository,
  validateMessages,
} from '../repositories/mockEmailRepository'
import { selectMessages } from '../features/inbox/selectMessages'
import { summarize } from '../features/analytics/summarize'
import { MemoryInstrumentation, calculateMetrics } from '../services/metrics'
import { loadInbox } from '../services/loadInbox'
import type { EmailMessage, MetricEvent } from '../domain/models'
const base = mockMessages[0]!
const fixture = (overrides: Partial<EmailMessage> = {}): EmailMessage => ({
  ...base,
  subject: 'An unfamiliar subject',
  sender: {
    id: 'unknown',
    name: 'Unknown',
    address: 'unknown@unknown.example',
  },
  labels: [],
  ...overrides,
})
describe('classification evidence', () => {
  it.each(rules.map((rule) => [rule.id, rule] as const))(
    'matches %s',
    (_id, rule) => {
      const result = classify(
        fixture({
          subject: rule.keywords[0] ?? 'Unfamiliar',
          labels: rule.label ? [rule.label] : [],
        }),
      )
      expect(result.category).toBe(rule.category)
      expect(result.ruleId).toBe(rule.id)
      expect(result.reason).toContain('Matched')
    },
  )
  it('handles unknown senders conservatively', () => {
    expect(classify(fixture())).toMatchObject({
      category: 'Uncategorized',
      confidence: 0,
      novel: true,
      priority: 'Medium',
      priorityScore: 50,
    })
  })
  it('matches sender domains exactly, not deceptive suffixes', () => {
    expect(
      classify(
        fixture({
          sender: { ...base.sender, address: 'person@campus.example' },
        }),
      ).category,
    ).toBe('Education')
    expect(
      classify(
        fixture({
          sender: {
            ...base.sender,
            address: 'person@campus.example.attacker.example',
          },
        }),
      ).novel,
    ).toBe(true)
  })
  it('keeps spam review ahead of security keywords', () => {
    expect(
      classify(fixture({ subject: 'Security alert', labels: ['SPAM'] }))
        .category,
    ).toBe('Spam review')
  })
  it('combines independent evidence and stays in bounds', () => {
    const one = classify(fixture({ subject: 'COURSE introduction' }))
    const two = classify(
      fixture({
        subject: 'Course introduction',
        sender: { ...base.sender, address: 'a@campus.example' },
      }),
    )
    expect(one.confidence).toBeCloseTo(0.75)
    expect(two.confidence).toBeCloseTo(0.85)
    expect(two.confidence).toBeGreaterThan(one.confidence)
    for (const message of mockMessages) {
      expect(classify(message).confidence).toBeGreaterThanOrEqual(0)
      expect(classify(message).confidence).toBeLessThanOrEqual(0.95)
    }
  })
})
const classified = mockMessages.map((message) => ({
  ...message,
  classification: classify(message),
}))
describe('inbox selectors and aggregation', () => {
  it('combines category, priority, and normalized search', () => {
    const result = selectMessages(
      classified,
      '  INTERVIEW ',
      'Jobs and internships',
      'High',
    )
    expect(result).toHaveLength(6)
    expect(selectMessages(classified, 'interview', 'Orders', 'All')).toEqual([])
  })
  it('searches names, addresses, and snippets', () => {
    expect(selectMessages(classified, 'Maya', 'All', 'All')).toHaveLength(6)
    expect(
      selectMessages(classified, 'learn@campus.example', 'All', 'All'),
    ).toHaveLength(6)
    expect(
      selectMessages(classified, 'secure dashboard', 'All', 'All'),
    ).toHaveLength(6)
  })
  it('handles empty collections and no results', () => {
    expect(selectMessages([], '', 'All', 'All')).toEqual([])
    expect(
      selectMessages(classified, 'no match anywhere', 'All', 'All'),
    ).toEqual([])
    expect(summarize([])).toMatchObject({
      total: 0,
      unread: 0,
      high: 0,
      unknown: 0,
      senders: [],
      days: [],
    })
  })
  it('counts the entire fixture without dropping unknown messages', () => {
    const stats = summarize(classified)
    expect(stats.total).toBe(96)
    expect(stats.unread).toBe(32)
    expect(stats.high).toBe(30)
    expect(stats.unknown).toBe(6)
    expect(stats.categories.reduce((sum, item) => sum + item.count, 0)).toBe(96)
    expect(stats.days).toHaveLength(24)
    expect(stats.senders).toHaveLength(16)
    expect(stats.priorities.reduce((sum, item) => sum + item.count, 0)).toBe(96)
  })
})
describe('repository boundary', () => {
  it.each([
    null,
    {},
    [{ ...base, receivedAt: 'bad' }],
    [{ ...base, sender: null }],
    [{ ...base, labels: [42] }],
    [{ ...base, body: 42 }],
    [base, base],
    [{ ...base, sender: { ...base.sender, address: 'invalid' } }],
  ])('rejects malformed input %j', (input) => {
    expect(() => validateMessages(input)).toThrow()
  })
  it('isolates returned messages from source mutation', async () => {
    const repo = new MockEmailRepository()
    const result = await repo.list()
    result[0]!.subject = 'changed'
    expect((await repo.list())[0]!.subject).toBe(base.subject)
  })
})
describe('privacy-safe instrumentation', () => {
  it('computes simulated results, separating real events', async () => {
    const tracker = new MemoryInstrumentation()
    const result = await loadInbox(
      new MockEmailRepository(),
      tracker,
      'test',
      (() => {
        let value = 0
        return () => (value += 10)
      })(),
    )
    expect(result).toHaveLength(96)
    expect(calculateMetrics(tracker.snapshot())).toMatchObject({
      indexed: 96,
      classified: 96,
      metadataOnly: 90,
      bodyRequests: 6,
      avoidance: 0.9375,
    })
    expect(calculateMetrics(tracker.snapshot(), 'real').indexed).toBe(0)
    expect(tracker.snapshot().at(-1)?.durationMs).toBe(10)
  })
  it('represents missing denominators without invented success', () => {
    expect(calculateMetrics([]).avoidance).toBeNull()
  })
  it('records failures without recording private errors', async () => {
    const tracker = new MemoryInstrumentation()
    await expect(
      loadInbox(
        {
          list: async () => {
            throw new Error('private')
          },
        },
        tracker,
        'fail',
      ),
    ).rejects.toThrow('private')
    expect(calculateMetrics(tracker.snapshot()).syncFailures).toBe(1)
    expect(JSON.stringify(tracker.snapshot())).not.toContain('private')
  })
  it('whitelists fields and protects event snapshots', () => {
    const tracker = new MemoryInstrumentation()
    const event = {
      name: 'category_corrected',
      timestamp: 1,
      source: 'synthetic',
      jobId: 'job',
      body: 'private',
    } as const
    tracker.track(event)
    const snapshot = tracker.snapshot()
    expect(snapshot[0]).not.toHaveProperty('body')
    ;(snapshot[0] as MetricEvent).jobId = 'changed'
    expect(tracker.snapshot()[0]?.jobId).toBe('job')
  })
  it('bounds memory consumption', () => {
    const tracker = new MemoryInstrumentation()
    for (let i = 0; i < 10001; i++)
      tracker.track({
        name: 'sync_started',
        timestamp: i,
        source: 'synthetic',
        jobId: 'job',
      })
    expect(tracker.snapshot()).toHaveLength(10000)
    expect(tracker.snapshot()[0]?.timestamp).toBe(1)
  })
})

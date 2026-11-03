import { expect, type Page } from '@playwright/test'
export async function mockGoogle(
  page: Page,
  outcome:
    'success' | 'denied' | 'missing' | 'cancelled' | 'unauthorized' = 'success',
) {
  const requests: URL[] = []
  const writes: string[] = []
  await page.route('https://**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.href === 'https://accounts.google.com/gsi/client') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window.google={accounts:{oauth2:{initTokenClient(config){return {requestAccessToken(){${outcome === 'denied' ? "config.callback({error:'access_denied',error_description:'private error'});" : outcome === 'cancelled' ? "config.error_callback({type:'popup_closed'});" : `config.callback({access_token:'browser-test-token',token_type:'Bearer',expires_in:3600,scope:${JSON.stringify(outcome === 'missing' ? 'other' : 'https://www.googleapis.com/auth/gmail.readonly')}});`}}}},hasGrantedAllScopes(response,scope){return response.scope===scope},revoke(token,done){window.__testRevoked=true;done({successful:true})}}}}`,
      })
      return
    }
    if (url.origin === 'https://gmail.googleapis.com') {
      requests.push(url)
      if (request.method() !== 'GET') {
        writes.push(request.method())
        await route.abort()
        return
      }
      if (outcome === 'unauthorized') {
        await route.fulfill({
          status: 401,
          json: { error: { message: 'private error' } },
        })
        return
      }
      if (url.pathname.endsWith('/messages')) {
        await route.fulfill({
          json: url.searchParams.has('pageToken')
            ? { messages: [{ id: 'broken' }] }
            : {
                messages: [{ id: 'recent' }, { id: 'older' }],
                nextPageToken: 'next',
              },
        })
        return
      }
      expect(url.searchParams.get('format')).toBe('METADATA')
      expect(url.searchParams.get('fields')).not.toMatch(
        /body|snippet|attachment/,
      )
      const id = url.pathname.split('/').at(-1)
      await route.fulfill({
        json:
          id === 'broken'
            ? { id }
            : {
                id,
                internalDate:
                  id === 'recent' ? '1793606400000' : '1793520000000',
                labelIds: ['INBOX', 'UNREAD'],
                payload: {
                  headers: [
                    {
                      name: 'From',
                      value: 'Synthetic Browser Sender <sender@example.test>',
                    },
                    {
                      name: 'Subject',
                      value:
                        id === 'recent'
                          ? 'Interview invitation'
                          : 'Course update',
                    },
                  ],
                },
              },
      })
      return
    }
    await route.abort()
  })
  return { requests, writes }
}

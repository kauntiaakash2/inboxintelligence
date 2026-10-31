import type { EmailMessage } from '../../domain/models'
const seeds = [
  [
    'Maya Chen',
    'maya@friends.example',
    'Dinner this weekend?',
    'A little time away from our screens. Are you free on Saturday?',
    'INBOX',
  ],
  [
    'Orbit Careers',
    'careers@orbit.example',
    'Your interview with the product team',
    'We enjoyed your application. Let’s find a time to talk next week.',
    'IMPORTANT',
  ],
  [
    'Campus Learning',
    'learn@campus.example',
    'Your next course starts Monday',
    'Your learning space is ready. Here is everything you need to get started.',
    'INBOX',
  ],
  [
    'North Bank',
    'statements@bank.example',
    'Your October statement is ready',
    'Your monthly account summary is available in your secure dashboard.',
    'INBOX',
  ],
  [
    'Account Security',
    'alerts@account.example',
    'Security alert: new sign-in',
    'A new device signed in. Review your recent account activity.',
    'IMPORTANT',
  ],
  [
    'Field Supply',
    'orders@field.example',
    'Your order is on its way',
    'Good things are coming. Your parcel has left our studio.',
    'INBOX',
  ],
  [
    'Studio Goods',
    'hello@studio.example',
    'A thoughtful offer for your workspace',
    'Our autumn collection brings a fresh perspective to everyday essentials.',
    'CATEGORY_PROMOTIONS',
  ],
  [
    'The Sunday Edit',
    'editor@sunday.example',
    'Weekly edition: a slower internet',
    'Five ideas worth your attention, collected by our editorial team.',
    'INBOX',
  ],
  [
    'Design Community',
    'events@design.example',
    'RSVP: conversations in design',
    'Join a small gathering of curious people building thoughtful products.',
    'INBOX',
  ],
  [
    'Prize Desk',
    'notice@prizes.example',
    'You have been selected',
    'An unsolicited message set aside for manual review.',
    'SPAM',
  ],
  [
    'New Contact',
    'hello@unfamiliar.example',
    'A small introduction',
    'Hello from a new sender. There is no matching classification rule yet.',
    'INBOX',
  ],
  [
    'Arjun Rao',
    'arjun@friends.example',
    'Time to catch up',
    'Sharing a few photos from our trip and an idea for the next one.',
    'INBOX',
  ],
  [
    'Launchpad Talent',
    'team@launchpad.example',
    'Internship application update',
    'Your application has moved to the next stage. Please review the details.',
    'IMPORTANT',
  ],
  [
    'Open Learning',
    'class@campus.example',
    'Assignment feedback is available',
    'Your mentor left some useful notes on your latest submission.',
    'INBOX',
  ],
  [
    'Build Together',
    'team@build.example',
    'Project deadline: Friday',
    'A reminder to send your project proposal before the end of the week.',
    'IMPORTANT',
  ],
  [
    'Byte Journal',
    'read@bytes.example',
    'Engineering digest: local-first software',
    'This week we explore the trade-offs behind browser storage and synchronization.',
    'INBOX',
  ],
] as const
export const mockMessages: EmailMessage[] = Array.from(
  { length: 96 },
  (_, index) => {
    const seed = seeds[index % seeds.length]!
    const [name, address, subject, snippet, label] = seed
    return {
      id: `demo-${index + 1}`,
      sender: { id: address, name, address },
      subject,
      snippet,
      receivedAt: new Date(
        Date.UTC(2026, 9, 31 - Math.floor(index / 4), 14 - (index % 4)),
      ).toISOString(),
      labels: [label, ...(index % 3 === 0 ? ['UNREAD'] : [])],
      unread: index % 3 === 0,
      body: `${snippet}\n\nThis is a synthetic demonstration message. It contains no real account data.\n\nThanks,\n${name}`,
    }
  },
)

import type {
  ClassificationResult,
  ClassificationRule,
  EmailMessage,
} from '../../domain/models'
export const rules: readonly ClassificationRule[] = [
  {
    id: 'label-spam',
    category: 'Spam review',
    keywords: [],
    label: 'SPAM',
    priority: 'Low',
  },
  {
    id: 'security-alert',
    category: 'Security',
    keywords: ['security alert', 'sign-in', 'password reset'],
    priority: 'High',
  },
  {
    id: 'career-opportunity',
    category: 'Jobs and internships',
    keywords: ['interview', 'internship', 'application update'],
    priority: 'High',
  },
  {
    id: 'deadline-event',
    category: 'Events and deadlines',
    keywords: ['deadline', 'rsvp', 'conference'],
    priority: 'High',
  },
  {
    id: 'finance-statement',
    category: 'Finance',
    keywords: ['statement', 'invoice', 'payment'],
    priority: 'Medium',
  },
  {
    id: 'order-update',
    category: 'Orders',
    keywords: ['order', 'delivery', 'shipped'],
    priority: 'Medium',
  },
  {
    id: 'education-course',
    category: 'Education',
    keywords: ['course', 'assignment', 'lecture'],
    senderDomain: 'campus.example',
    priority: 'Medium',
  },
  {
    id: 'promotion-offer',
    category: 'Promotions',
    keywords: ['sale', 'discount', 'offer'],
    label: 'CATEGORY_PROMOTIONS',
    priority: 'Low',
  },
  {
    id: 'newsletter-digest',
    category: 'Newsletters',
    keywords: ['digest', 'newsletter', 'weekly edition'],
    priority: 'Low',
  },
  {
    id: 'personal-conversation',
    category: 'Personal',
    keywords: ['weekend', 'catch up', 'dinner'],
    senderDomain: 'friends.example',
    priority: 'Medium',
  },
]
// First matching rule wins. Confidence describes matched evidence, not calibrated probability.
export function classify(message: EmailMessage): ClassificationResult {
  const subject = message.subject.toLocaleLowerCase('en-US')
  const domain = message.sender.address.split('@')[1]?.toLowerCase()
  for (const rule of rules) {
    const evidence: string[] = []
    if (rule.label && message.labels.includes(rule.label))
      evidence.push(`label ${rule.label}`)
    if (rule.senderDomain && domain === rule.senderDomain)
      evidence.push(`sender domain ${domain}`)
    const keyword = rule.keywords.find((word) => subject.includes(word))
    if (keyword) evidence.push(`subject contains “${keyword}”`)
    if (evidence.length)
      return {
        category: rule.category,
        confidence: Math.min(0.95, 0.65 + evidence.length * 0.1),
        reason: `Matched ${evidence.join(' and ')}.`,
        ruleId: rule.id,
        priority: rule.priority,
        priorityScore:
          rule.priority === 'High' ? 90 : rule.priority === 'Medium' ? 55 : 20,
        novel: false,
      }
  }
  return {
    category: 'Uncategorized',
    confidence: 0,
    reason:
      'No known sender, label, or subject rule matched. Review this unfamiliar message.',
    priority: 'Medium',
    priorityScore: 50,
    novel: true,
  }
}

import { useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Eye,
  Fingerprint,
  Layers3,
  Mail,
  Menu,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { ProductPreview } from './ProductPreview'
import privacyNotice from '../../../docs/security/PRIVACY.md?url'
import './landing.css'
const navigation = [
  { name: 'Features', id: 'features' },
  { name: 'How it works', id: 'how-it-works' },
  { name: 'Privacy', id: 'privacy' },
  { name: 'FAQ', id: 'faq' },
]
const features = [
  {
    icon: Layers3,
    title: 'Categories with context',
    description:
      'Sender patterns, subject keywords and existing labels bring structure to your messages. Deterministic rules, not a black box.',
    status: 'Available',
  },
  {
    icon: Eye,
    title: 'Priorities you can question',
    description:
      'Inspect the matched rule, reason and heuristic confidence behind a category. Important should also be understandable.',
    status: 'Available',
  },
  {
    icon: BarChart3,
    title: 'See the recurring patterns',
    description:
      'Explore category distribution, frequent senders and message trends across the messages you have loaded.',
    status: 'Available',
  },
  {
    icon: SlidersHorizontal,
    title: 'A workspace that fits your day',
    description:
      'Declare your goals, review suggested categories and adjust the display. Setup is optional, and every message stays searchable.',
    status: 'Available',
  },
  {
    icon: Mail,
    title: 'A window into Gmail',
    description:
      'Explicit read-only authorization loads up to the newest 100 messages as metadata. Spam and Trash are excluded.',
    status: 'Bounded sample',
  },
  {
    icon: ScanLine,
    title: 'Less fetching. More intention.',
    description:
      'Adaptive retrieval depth and historical synchronization are on the roadmap. Full bodies are not fetched in the current integration.',
    status: 'Planned',
  },
]
const steps = [
  [
    'Connect on your terms',
    'Explore the demo first, or explicitly authorize Gmail with read-only permission.',
  ],
  [
    'Start with metadata',
    'Load a bounded sample of sender, subject, date and label information. No bodies or attachments.',
  ],
  [
    'Explore the bigger picture',
    'Search messages, inspect rule-based priorities and see recurring sender patterns.',
  ],
  [
    'Make the view your own',
    'Optionally choose goals and categories to emphasize, without changing what gets indexed.',
  ],
  [
    'Keep refining your approach',
    'Use visible patterns to guide your own organization. Correction learning and adaptive fetching are planned.',
  ],
]
const faqs = [
  [
    'What permission does Gmail need?',
    'Only gmail.readonly, granted through Google after an explicit action in the app. There is no send, archive, delete or relabel operation. Read-only scope can authorize broader reads than this app uses; the current adapter requests metadata only.',
  ],
  [
    'Where does my data go?',
    'Authorized requests go directly from your browser to Google. Access tokens, loaded email metadata and diagnostics stay in page memory. Only optional declared preferences persist in localStorage. Reload clears app authorization and mail; Disconnect clears live state and attempts Google revocation.',
  ],
  [
    'Which accounts are supported?',
    'The initial integration targets one Gmail account at a time. Google consent, test-user eligibility and the owner-managed OAuth configuration determine access. Other email providers, multi-account workspaces and SaaS sign-in are not implemented.',
  ],
  [
    'Is Inbox Intelligence free?',
    'This is a development prototype. No paid plan, payment flow or commercial pricing has been launched. You can explore the synthetic demo without connecting an account.',
  ],
  [
    'Does this organize my entire mailbox automatically?',
    'No. Live mode loads up to the newest 100 selected messages, excluding Spam and Trash, and displays partial coverage and failures. Classification uses deterministic rules and can be wrong. Historical sync, durable caching, user corrections and adaptive processing remain planned.',
  ],
  [
    'Do I need to complete personalized setup?',
    'No. You may skip every question, turn off all suggested categories, revisit setup or clear preferences in Settings. Choices affect presentation, not Gmail labels, permissions or message discovery.',
  ],
]
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="landing-page">
      <a className="skip-link" href="#public-content">
        Skip to content
      </a>
      <header className="landing-header">
        <a
          className="landing-wordmark"
          href="/"
          aria-label="Inbox Intelligence home"
        >
          <span className="brand-mark">
            <Mail size={21} />
          </span>
          inbox<span>intelligence</span>
        </a>
        <button
          className="mobile-menu-button button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          id="public-navigation"
          aria-label="Public navigation"
          className={menuOpen ? 'is-open' : ''}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setMenuOpen(false)
              document
                .querySelector<HTMLButtonElement>('.mobile-menu-button')
                ?.focus()
            }
          }}
        >
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </nav>
        <a className="button setup-primary landing-open" href="/app">
          Open app <ArrowUpRight size={16} />
        </a>
      </header>
      <main id="public-content" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="hero-title">
          <span className="hero-pill">
            <span aria-hidden="true" /> A little more clarity. A lot less noise.
          </span>
          <h1 id="hero-title">
            Understand your inbox.
            <br />
            <span>Focus on what matters.</span>
          </h1>
          <p>
            Turn a cluttered Gmail inbox into a clear picture of important
            messages, recurring patterns and meaningful priorities.
          </p>
          <div className="hero-actions">
            <a className="button setup-primary" href="/app">
              Explore the demo <ArrowRight size={18} />
            </a>
            <a className="button" href="#how-it-works">
              See how it works <ArrowDown size={17} />
            </a>
          </div>
          <p className="hero-footnote">
            <ShieldCheck size={15} /> Read-only Gmail access{' '}
            <span aria-hidden="true">·</span> No external AI{' '}
            <span aria-hidden="true">·</span> Optional setup
          </p>
        </section>
        <div className="preview-stage" id="product-preview">
          <ProductPreview />
        </div>
        <div className="principles-strip">
          <span>
            <Fingerprint size={18} /> Privacy-conscious by design
          </span>
          <span>
            <Eye size={18} /> Reasons behind the rules
          </span>
          <span>
            <SlidersHorizontal size={18} /> Your preferences, your view
          </span>
        </div>
        <section
          className="landing-problem landing-section"
          aria-labelledby="problem-title"
        >
          <div>
            <span className="section-kicker">FROM OVERLOAD TO OVERVIEW</span>
            <h2 id="problem-title">
              Your inbox has a lot to say.
              <br />
              <span>Find the signal.</span>
            </h2>
          </div>
          <div>
            <p>
              Opportunities arrive beside promotions. Deadlines disappear
              between updates. A growing inbox asks you to make the same
              decisions, again and again.
            </p>
            <p>
              Inbox Intelligence gives you another perspective: patterns you can
              explore, priorities you can inspect and a view you can shape.
            </p>
            <a className="inline-link" href="#features">
              Meet your clearer workspace <ArrowRight size={17} />
            </a>
          </div>
        </section>
        <section
          className="landing-section"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                BUILT FOR A LITTLE MORE CLARITY
              </span>
              <h2 id="features-title">
                Everything in perspective.
                <br />
                <span>Nothing hidden behind a score.</span>
              </h2>
            </div>
            <p>
              A focused set of tools for understanding your inbox. Here’s what
              works today, and what comes next.
            </p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description, status }) => (
              <article className="feature-card" key={title}>
                <div className="feature-top">
                  <span className="feature-icon">
                    <Icon size={22} />
                  </span>
                  <span
                    className={`feature-status ${status === 'Planned' ? 'is-planned' : ''}`}
                  >
                    {status}
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="landing-section how-section"
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">A SIMPLE WAY IN</span>
              <h2 id="how-title">
                Understand first.
                <br />
                <span>Then find your focus.</span>
              </h2>
            </div>
            <a className="inline-link" href="/app">
              Start with synthetic data <ArrowUpRight size={17} />
            </a>
          </div>
          <ol className="steps-list">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <span className="step-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="landing-section privacy-section"
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div className="privacy-visual" aria-hidden="true">
            <span className="privacy-orbit">
              <ShieldCheck size={70} />
            </span>
            <span className="privacy-label">READ ONLY / METADATA FIRST</span>
          </div>
          <div>
            <span className="section-kicker">YOUR INBOX. YOUR SPACE.</span>
            <h2 id="privacy-title">
              Useful insights.
              <br />
              <span>Considered boundaries.</span>
            </h2>
            <p>
              Explore freely in mock mode. Connect Gmail only when you choose.
              This public preview never reads from a connected mailbox.
            </p>
            <ul className="privacy-points">
              <li>
                <Check size={18} /> Tokens and loaded email stay in page memory.
              </li>
              <li>
                <Check size={18} /> Only declared preferences are saved locally.
              </li>
              <li>
                <Check size={18} /> No bodies, attachments or remote email
                images.
              </li>
              <li>
                <Check size={18} /> No external AI or analytics service.
              </li>
            </ul>
            <p className="privacy-caveat">
              Metadata is still sensitive. Browser storage is not encryption,
              and same-origin scripts or device access remain risks. Full
              caching and historical sync are not implemented.
            </p>
            <a className="inline-link" href={privacyNotice}>
              Read the development privacy notice <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="landing-section faq-section"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div>
            <span className="section-kicker">A FEW THINGS TO KNOW</span>
            <h2 id="faq-title">
              Good questions.
              <br />
              <span>Clear answers.</span>
            </h2>
            <p>An early product, with honest limits.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="landing-cta" aria-labelledby="cta-title">
          <Sparkles size={28} />
          <h2 id="cta-title">
            A clearer inbox starts
            <br />
            with a different perspective.
          </h2>
          <p>
            Explore 96 synthetic messages. Connect Gmail only if you choose.
          </p>
          <a className="button setup-primary" href="/app">
            Find your focus <ArrowRight size={18} />
          </a>
          <small>No signup form. No setup required.</small>
        </section>
      </main>
      <footer className="landing-footer">
        <div>
          <a className="landing-wordmark" href="/">
            <Mail size={22} /> inbox<span>intelligence</span>
          </a>
          <p>Understand. Classify. Prioritize. Optimize. Measure.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#privacy">Privacy approach</a>
          <a href={privacyNotice}>Development privacy notice</a>
          <a href="/app/settings">App settings</a>
        </nav>
        <p className="footer-status">
          Development prototype. Pricing and finalized legal terms have not been
          launched.
        </p>
      </footer>
    </div>
  )
}

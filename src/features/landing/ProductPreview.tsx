import {
  ArrowUpRight,
  BarChart3,
  Inbox,
  LayoutDashboard,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { mockMessages } from '../../data/mock/messages'
import { classify } from '../classification/classify'
import { summarize } from '../analytics/summarize'
// Public preview accepts no props or mailbox/session state: only bundled synthetic fixtures.
const preview = mockMessages.map((message) => ({
  ...message,
  classification: classify(message),
}))
const stats = summarize(preview)
export function ProductPreview() {
  return (
    <figure className="product-preview" aria-label="Synthetic product preview">
      <div className="preview-window-bar">
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Inbox Intelligence / Overview</span>
        <span className="preview-source">Synthetic preview</span>
      </div>
      <div className="preview-workspace">
        <aside
          className="preview-sidebar"
          aria-label="Illustrated workspace navigation"
        >
          <Mail size={25} />
          <span>
            <LayoutDashboard size={16} /> Overview
          </span>
          <span>
            <Inbox size={16} /> Inbox explorer
          </span>
          <span>
            <BarChart3 size={16} /> Analytics
          </span>
          <div>
            <ShieldCheck size={16} /> Read only.
            <br />
            Always your choice.
          </div>
        </aside>
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <p>YOUR INBOX, IN PERSPECTIVE</p>
              <h2>Less noise. More perspective.</h2>
            </div>
            <a href="/app" aria-label="Explore the synthetic dashboard">
              <ArrowUpRight size={22} />
            </a>
          </div>
          <div className="preview-stats">
            {[
              { label: 'Messages', value: stats.total },
              { label: 'Unread', value: stats.unread },
              { label: 'High priority', value: stats.high },
            ].map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>Synthetic mailbox</small>
              </div>
            ))}
          </div>
          <div className="preview-panels">
            <div>
              <h3>A place for everything</h3>
              <p>Messages by category · synthetic data</p>
              <div className="preview-category-list">
                {stats.categories.slice(0, 5).map((category, index) => (
                  <div key={category.name}>
                    <span>{category.name}</span>
                    <span className="preview-bar">
                      <i
                        style={{
                          width: `${(category.count / stats.total) * 100 * 5}%`,
                          background: `var(--chart-${index})`,
                        }}
                      />
                    </span>
                    <strong>{category.count}</strong>
                  </div>
                ))}
              </div>
              <a className="preview-link" href="/app/analytics">
                Explore all 11 categories <ArrowUpRight size={14} />
              </a>
            </div>
            <div>
              <h3>Why this category?</h3>
              <p>Visible rules. Clear reasons.</p>
              <span className="preview-rule">RULE-BASED CLASSIFICATION</span>
              <strong className="preview-example">Jobs and internships</strong>
              <p>
                A sender pattern and subject keyword can explain a match.
                Confidence is a heuristic, not a probability.
              </p>
              <a className="preview-link" href="/app/inbox">
                See the explanations <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        Original product illustration using the app’s real classification and
        aggregation functions with 96 synthetic messages. No connected mailbox
        data.
      </figcaption>
    </figure>
  )
}

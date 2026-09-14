// ==================== Multiply or Die — Top sections ====================
const { useState, useEffect, useRef } = React;

// ---------- Top bar ----------
function TopBar() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">×</span>
          <span>Multiply or Die</span>
        </a>
        <nav className="topbar-links">
          <a href="#book">The Book</a>
          <a href="#multiply">Multiply Forward</a>
          <a href="#author">Ashley</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a href="#order" className="topbar-cta">Get the book →</a>
      </div>
    </header>);

}

// ---------- Hero ----------
function Hero({ headline, layout }) {
  return (
    <section className="hero hero-cinematic" id="top">
      <div className="shell">
        <div className="hero-stack">
          <div className="book-stage hero-book" id="book">
            <img src="assets/book-cover.jpg" alt="Multiply or Die — by Ashley Evans" className="hero-book-img" />
          </div>
          <div className="hero-badge">
            <span className="dot"></span>
            <span>New from Ashley Evans · Foreword by Russell Evans</span>
          </div>
          <h1 className="hero-headline">
            If your church isn't multiplying,<br/>
            <span className="em">it's already dying.</span>
          </h1>
          <p className="hero-sub">
            Get the book free. Pay what you want. Every $20 puts this book and a coach in the hands of a pastor who will change a church, a church that will change a city, a city that will change a nation.
          </p>
          <div className="hero-cta-row">
            <a href="#order" className="btn btn-primary btn-arrow">Get my free copy</a>
            <a href="#multiply" className="btn btn-ghost">How it works</a>
          </div>
          <div className="hero-price-tag">
            <span className="price-label">Free + shipping</span>
            <span className="price-num">$9.95 US</span>
          </div>
          <p className="hero-microcopy">
            <strong>Just cover shipping ($9.95–$12.95 US, hardback).</strong> Anything above that puts this book — and a coach — in the hands of a pastor who will change his church, his city, his nation. 30-day money-back guarantee.
          </p>
          <div className="trust-strip">
            <div>
              <div className="counter" data-counter="4218">4,218</div>
              <span className="counter-label">Copies multiplied forward</span>
            </div>
            <div className="endorsers">
              Endorsed by <em>Carey Nieuwhof</em> · <em>Dave Ferguson</em> · <em>Sam Chand</em>
            </div>
          </div>
        </div>
      </div>
    </section>);
}

// ---------- Problem section ----------
function Problem() {
  const stats = [
    { num: "65", unit: "%", headline: "of US churches are plateaued or declining.", body: "Three out of every five congregations have not added a single new disciple in the last twelve months. The slow death is quiet — until it isn't.", source: "Lifeway Research · 2024" },
    { num: "4,500", headline: "churches close their doors every year in the United States.", body: "For every church that opens, more than two close. Multiplication isn't a strategy choice anymore. It's the only math that survives the next decade.", source: "Exponential Network · 2025" },
    { num: "38", unit: "%", headline: "of senior pastors have considered quitting in the last year.", body: "Burnout is the symptom. Subtraction-thinking — adding programs to a single building — is the disease. Multiplication is the cure neither seminary nor coaching has taught.", source: "Barna Group · 2024" }];
  return (
    <section className="problem">
      <div className="shell">
        <span className="eyebrow">The math is the message</span>
        <h2 style={{ marginTop: 24 }}>
          Addition is exhausting. <span className="em">Multiplication is the only path that doesn't bury the leader who built it.</span>
        </h2>
        <p className="problem-lede">
          Pastors are not failing because they aren't working hard enough. They are failing because they are running an arithmetic strategy in a season that demands geometric thinking.
        </p>
        <div className="stat-grid">
          {stats.map((s, i) => <div key={i} className="stat-card">
            <div className="stat-num">{s.num}{s.unit && <span className="unit">{s.unit}</span>}</div>
            <div className="stat-headline">{s.headline}</div>
            <p className="stat-body">{s.body}</p>
            <div className="stat-source">Source · {s.source}</div>
          </div>
          )}
        </div>
      </div>
    </section>);
}

// ---------- Inside the book ----------
function Inside() {
  const chapters = [
    { n: "01", title: "The Hidden Law", promise: "Why every healthy organism — biological, spiritual, organizational — multiplies, and why most churches stopped." },
    { n: "02", title: "The Lie of Bigger", promise: "How chasing attendance numbers became the most expensive distraction of the modern pastorate." },
    { n: "03", title: "The Multiplication Mindset", promise: "Five mental shifts every senior pastor must make before structure can change." },
    { n: "04", title: "Leaders Who Reproduce", promise: "The discipleship architecture that produces leaders who plant leaders who plant leaders." },
    { n: "05", title: "The Sending Engine", promise: "How to build a church that exports more than it imports — without losing its core." },
    { n: "06", title: "Money That Multiplies", promise: "Stewardship without scarcity. A generosity model that funds the next church before yours has finished growing." },
    { n: "07", title: "Or Die Trying", promise: "What happens to leaders, families, and movements who refuse the law of multiplication. And the hopeful path forward." }];
  return (
    <section className="inside">
      <div className="shell">
        <div className="inside-head">
          <div>
            <span className="eyebrow">Inside the book</span>
            <h2 style={{ marginTop: 24 }}>Seven chapters. One law. A framework you can preach on Sunday and build on Monday.</h2>
          </div>
          <p>
            Each chapter ends with a Multiplication Audit — a short diagnostic you can run with your eldership before the next page turns. No filler. No throat-clearing. Built for pastors who read between meetings.
          </p>
        </div>
        <div className="inside-grid">
          <div className="toc">
            {chapters.map((c) => <div key={c.n} className="toc-row">
              <div className="toc-num">CH · {c.n}</div>
              <div>
                <div className="toc-title">{c.title}</div>
                <p className="toc-promise">{c.promise}</p>
              </div>
            </div>
            )}
          </div>
          <div className="spreads">
            <div className="spreads-label">Inside spread · Chapter 03</div>
            <div className="spread">
              <div className="spread-page">
                <div className="chap">Chapter 03 · Multiplication Mindset</div>
                <div className="h">The Five Shifts</div>
                <div className="spread-line m"></div>
                <div className="spread-line s"></div>
                <div className="spread-line m"></div>
                <div className="spread-line m"></div>
                <div className="spread-line s"></div>
                <div className="spread-line xs"></div>
                <div className="spread-pgnum l">42</div>
              </div>
              <div className="spread-page">
                <div className="spread-line m"></div>
                <div className="spread-line m"></div>
                <div className="spread-line s"></div>
                <div className="spread-line m"></div>
                <div className="spread-line m"></div>
                <div className="spread-line xs"></div>
                <div className="spread-line m"></div>
                <div className="spread-line s"></div>
                <div className="spread-pgnum r">43</div>
              </div>
            </div>
            <p className="pull-quote">
              "If your church can't survive your absence, you haven't built a church. You've built a stage."
            </p>
            <div className="pull-quote-cite">— Chapter 04, p. 89</div>
          </div>
        </div>
      </div>
    </section>);
}

// ---------- Multiply It Forward ----------
function Multiply() {
  return (
    <section className="multiply" id="multiply">
      <div className="shell">
        <div className="multiply-head">
          <span className="eyebrow">The mechanic</span>
          <h2 style={{ marginTop: 24 }}>One book. <span className="em">Three roles in the same act.</span></h2>
          <p>
            We give you the book. You give what you can. Together we send a copy — and a coach — to a pastor who could never afford either.
          </p>
        </div>
        <div className="three-col">
          <div className="col-card">
            <div className="col-icon">i</div>
            <div className="col-num">01 — Receive</div>
            <h3 className="col-title">Get the book free.</h3>
            <p className="col-body">
              Hardback edition, shipped to your door. You only cover US shipping. No tripwires, no upsell carousels, no auto-billed subscriptions.
            </p>
            <a href="#order" className="col-link">Claim your copy →</a>
          </div>
          <div className="col-card">
            <div className="col-icon">×</div>
            <div className="col-num">02 — Multiply</div>
            <h3 className="col-title">Pay what you want.</h3>
            <p className="col-body">
              Every $20 above shipping puts this book and a four-video masterclass in the hands of a pastor in Indonesia, Latin America, or Sub-Saharan Africa. One pastor. One church. One city. One nation. Receipts emailed automatically.
            </p>
            <a href="#order" className="col-link">See the slider →</a>
          </div>
          <div className="col-card">
            <div className="col-icon">∴</div>
            <div className="col-num">03 — Equip your team</div>
            <h3 className="col-title">Order in bulk.</h3>
            <p className="col-body">
              Eldership, staff, launch team, planting cohort. Boxes of 5, 10, or 20 hardbacks at deep discount — and every bulk order multiplies forward at the same rate.
            </p>
            <a href="#bulk" className="col-link">See bulk pricing →</a>
          </div>
        </div>
        <div className="live-counter">
          <div className="live-counter-cell">
            <div className="n" data-counter="4218">4,218</div>
            <div className="l">Copies multiplied forward</div>
          </div>
          <div className="live-counter-cell">
            <div className="n" data-counter="84360" data-prefix="$">$84,360</div>
            <div className="l">Invested in pastors · churches · cities · nations</div>
          </div>
        </div>
      </div>
    </section>);
}

// ---------- Author ----------
function Author() {
  return (
    <section className="author" id="author">
      <div className="shell">
        <span className="eyebrow">The author</span>
        <div className="author-grid" style={{ marginTop: 36 }}>
          <div className="author-photo-wrap">
            <img src="images/ashley-headshot.jpg" alt="Ashley Evans, founder of Futures Church Global" />
            <div className="author-photo-meta">
              <strong>Ashley Evans</strong>
              <span>Melbourne · Atlanta · Jakarta</span>
            </div>
          </div>
          <div className="author-bio">
            <h2>A pastor who has spent two decades doing what this book asks of you. <span className="em">Quietly. At scale.</span></h2>
            <p>
              Ashley Evans is the founder of <strong>Futures Church Global</strong>, a multi-country network of 20,000+ active members spanning the United States, Australia, Indonesia, and Spanish-speaking territories. He has planted, replanted, sent, and coached on four continents — and still preaches every Sunday.
            </p>
            <p className="muted">
              Through FCG's coaching arm he personally mentors the superintendent of <strong>JGSA, a 2,500-church Indonesian denomination</strong>. The royalties from <em>Multiply or Die</em>, and the donations attached to it, fund the same Multiplication Masterclass that JGSA pastors are walking through right now. This isn't a marketing story. It's the book describing the engine that funds itself.
            </p>
            <div className="org-logos">
              <div className="org-logos-label">Coached, partnered, or planted with</div>
              <div className="org-logo">Futures Church</div>
              <div className="org-logo">JGSA Indonesia</div>
              <div className="org-logo">NewThing</div>
              <div className="org-logo">Exponential</div>
              <div className="org-logo">Planetshakers</div>
              <div className="org-logo">ARC Churches</div>
              <div className="org-logo">Hillsong Network</div>
              <div className="org-logo">Catalyst</div>
            </div>
          </div>
        </div>
      </div>
    </section>);
}

// ---------- Endorsements ----------
function Endorsements() {
  const e = [
    { initials: "CN", name: "Carey Nieuwhof", role: "Carey Nieuwhof Leadership Podcast", quote: "Ashley has written the book the senior-pastor conversation has been circling for ten years. The math is simple. The implications are not.", feat: true },
    { initials: "DF", name: "Dave Ferguson", role: "Community Christian · NewThing · author of Hero Maker", quote: "If you only read one church-leadership book this year, make it this one. The mechanic at the back is genuinely new." },
    { initials: "SC", name: "Sam Chand", role: "Leadership Consultant · author of Bigger, Faster Leadership", quote: "Ashley does what most authors won't. He shows the engine, and then he turns it on in front of you." },
    { initials: "FB", name: "Frank Bealer", role: "Executive Pastor · The Phase Family Center", quote: "Practical, theological, and unflinching. It will cost you assumptions, not just time." },
    { initials: "AM", name: "Arif Multi", role: "Superintendent · JGSA Indonesia (2,500 churches)", quote: "Ashley has been quietly funding what the West is finally writing books about. We are the proof of his thesis." }];
  return (
    <section className="endorse">
      <div className="shell">
        <div className="endorse-head">
          <span className="eyebrow">Endorsements</span>
          <h2 style={{ marginTop: 24 }}>Read by the leaders <span className="em">most pastors already trust.</span></h2>
          <p>These leaders read the manuscript. Here's what they said.</p>
        </div>
        <div className="endorse-grid">
          {e.map((x, i) => <div key={i} className={`endorse-card${x.feat ? ' feat' : ''}`}>
            <div className="endorse-photo">
              {x.initials}
            </div>
            <p className="endorse-quote">"{x.quote}"</p>
            <div className="endorse-name">{x.name}</div>
            <div className="endorse-role">{x.role}</div>
          </div>
          )}
        </div>
      </div>
    </section>);
}

Object.assign(window, { TopBar, Hero, Problem, Inside, Multiply, Author, Endorsements });

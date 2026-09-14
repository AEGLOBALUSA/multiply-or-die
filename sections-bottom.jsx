// ==================== Multiply or Die — Bottom sections ====================
const { useState: useStateB, useEffect: useEffectB, useRef: useRefB } = React;

// ---------- VSL ----------
function VSL() {
  const [playing, setPlaying] = useStateB(false);
  const [progress, setProgress] = useStateB(0);
  useEffectB(() => {
    if (!playing) return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = ((Date.now() - start) / 90000) * 100;
      if (p >= 100) { setProgress(100); clearInterval(id); } else setProgress(p);
    }, 250);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <section className="vsl">
      <div className="shell">
        <div className="vsl-head">
          <span className="eyebrow">90 seconds with Ashley</span>
          <h2 style={{ marginTop: 24 }}>90 seconds. The reason this book costs nothing — and what it actually costs.</h2>
          <p>Camera-on, no slides. Ashley speaks directly to the pastor who's about to decide.</p>
        </div>
        <div className={`vsl-player${playing ? ' playing' : ''}`} onClick={() => !playing && setPlaying(true)}>
          <div className="vsl-duration">01:28</div>
          {!playing && (
            <button className="vsl-play" aria-label="Play video">
              <svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>
            </button>
          )}
          <div className="vsl-progress"><div className="vsl-progress-fill" style={{ width: `${progress}%` }}></div></div>
        </div>
      </div>
    </section>
  );
}

// ---------- Order Block ----------
function OrderBlock({ defaultDonation }) {
  const [donation, setDonation] = useStateB(defaultDonation);
  const [bump, setBump] = useStateB(false);
  const [email, setEmail] = useStateB("");
  const [submitted, setSubmitted] = useStateB(false);
  const [customMode, setCustomMode] = useStateB(false);
  const shipping = 9.95;
  const workbook = 17;
  const total = (shipping + Number(donation) + (bump ? workbook : 0)).toFixed(2);
  const pastorsSponsored = Math.floor(donation / 20);
  const anchorMicrocopy = () => {
    if (donation === 0) return { num: "0", text: "You receive. That's enough.", small: "No guilt. We mean it." };
    if (donation < 20) return { num: "—", text: "Helping cover costs. Thank you.", small: "Every dollar above shipping reaches a pastor." };
    if (donation < 100) return { num: pastorsSponsored.toString(), text: `${pastorsSponsored} pastor${pastorsSponsored !== 1 ? 's' : ''}. ${pastorsSponsored} church${pastorsSponsored !== 1 ? 'es' : ''}. ${pastorsSponsored} city${pastorsSponsored !== 1 ? 'ies' : ''}. ${pastorsSponsored !== 1 ? 'Nations shift.' : 'A nation shifts.'}`, small: "Real names. Real cohorts. A quarterly report comes back to you." };
    if (donation < 400) return { num: pastorsSponsored.toString(), text: `${pastorsSponsored} pastors. ${pastorsSponsored} churches. ${pastorsSponsored} cities. The ripple from here is impossible to calculate.`, small: "You will receive a quarterly report on every pastor you funded." };
    return { num: pastorsSponsored.toString(), text: `${pastorsSponsored} pastors. ${pastorsSponsored} churches. ${pastorsSponsored} cities. A region shifts.`, small: "You will receive a quarterly report on every pastor you funded." };
  };
  const impact = anchorMicrocopy();
  const anchors = [0, 20, 60, 120];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) setSubmitted(true);
  };
  if (submitted) {
    return (
      <section className="order" id="order">
        <div className="shell">
          <div className="order-card">
            <div className="order-success">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>Step 1 of 2 complete</span>
              <h3 style={{ marginTop: 16 }}>Your copy is on its way. <span className="em">And so is a pastor's.</span></h3>
              <p>Check {email} for the shipping confirmation and your first Multiplication Masterclass video. We'll send the next three over the next four days.</p>
              <button className="btn btn-ghost" style={{ marginTop: 28 }} onClick={() => setSubmitted(false)}>Edit my order</button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="order" id="order">
      <div className="shell">
        <div className="order-head">
          <span className="eyebrow">Your copy. Your call. Your multiplication.</span>
          <h2>The book is free. <span className="em">What you give multiplies.</span></h2>
          <p>One card. No tricks. Every dollar above shipping goes to a pastor who will change a church, a church that will change a city, a city that will change a nation.</p>
        </div>
        <form className="order-card" onSubmit={handleSubmit}>
          <div className="order-card-head">
            <div>
              <div className="label">Hardback · 248 pages · ISBN 978-1-63858-447-2</div>
              <div className="order-title">Multiply or Die <br/><span style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: 18 }}>by Ashley Evans</span></div>
            </div>
            <div className="order-price">
              <span className="strike">$28</span>FREE <span className="ship">+ $9.95–$12.95 US shipping</span>
            </div>
          </div>
          <div className="pwyc">
            <div className="pwyc-row">
              <div className="pwyc-label">What you give — pastor · church · city · nation</div>
              <div className="pwyc-amount"><span className="currency">$</span>{donation}</div>
            </div>
            <div className="pwyc-slider-wrap">
              <input type="range" min="0" max="500" step="5" value={donation}
                onChange={(e) => { setDonation(Number(e.target.value)); setCustomMode(false); }}
                className="pwyc-slider" />
              <div className="pwyc-anchors">
                {anchors.map((a) => (
                  <button type="button" key={a} className={`${donation === a ? 'active' : ''}${a === 0 ? ' anchor-zero' : ''}`}
                    onClick={() => { setDonation(a); setCustomMode(false); }}>
                    {a === 0 ? 'Just shipping' : `$${a}`}
                  </button>
                ))}
                <button type="button" className={customMode ? 'active' : ''} onClick={() => setCustomMode(true)}>Custom</button>
              </div>
            </div>
            {customMode && (
              <div className="pwyc-custom">
                <span>Custom amount</span>
                <span>$</span>
                <input type="number" min="0" value={donation}
                  onChange={(e) => setDonation(Math.max(0, Number(e.target.value) || 0))}
                  autoFocus />
              </div>
            )}
            <div className="pwyc-impact">
              <div className="num">{impact.num}</div>
              <div className="text">
                {impact.text}
                <small>{impact.small}</small>
              </div>
            </div>
          </div>
          <div className="order-summary">
            <div className="order-line"><span>Hardback (free)</span><span className="v">$0.00</span></div>
            <div className="order-line"><span>US shipping</span><span className="v">${shipping.toFixed(2)}</span></div>
            {donation > 0 && (
              <div className="order-line donate"><span>Pastor · church · city · nation</span><span className="v">+ ${Number(donation).toFixed(2)}</span></div>
            )}
            {bump && <div className="order-line"><span>Multiplication Workbook</span><span className="v">+ ${workbook.toFixed(2)}</span></div>}
            <div className="order-line total"><span>Total today</span><span className="v">${total}</span></div>
          </div>
          <div className="order-form">
            <div className={`order-bump${bump ? ' checked' : ''}`} onClick={() => setBump(!bump)}>
              <div className="order-bump-check">
                <svg viewBox="0 0 12 12"><path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              <div className="order-bump-text">
                <strong>Add the Multiplication Workbook — $17.</strong>
                <small>Companion to the book. 100% of the $17 also goes to a pastor who will change a church, a city, a nation.</small>
              </div>
            </div>
            <div className="input-row" style={{ marginTop: 14 }}>
              <input type="email" placeholder="Your email — confirms shipping + masterclass access"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Claim my free copy →</button>
            </div>
            <p className="privacy-line">Used for order confirmation and the masterclass only. We never sell or share your email.</p>
            <div className="order-meta-row">
              <span className="badge"><svg viewBox="0 0 16 16"><path d="M8 1l6 3v4c0 4-3 6-6 7-3-1-6-3-6-7V4l6-3z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg> 30-day money-back guarantee</span>
              <span className="badge">FCG is a registered 501(c)(3) · receipt emailed automatically</span>
            </div>
            <p className="bulk-link">Need books for the whole staff or eldership? <a href="#bulk">See bulk pricing for 5, 10, 20+ →</a></p>
          </div>
        </form>
      </div>
    </section>
  );
}

// ---------- Bonus ----------
function Bonus() {
  return (
    <section className="bonus">
      <div className="shell">
        <span className="eyebrow" style={{ color: 'var(--silver)' }}>Bonus access · included free with every order</span>
        <h2 style={{ color: 'var(--cream)', marginTop: 24, maxWidth: 880 }}>The four videos pastors say made the book click. <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Free with every order.</span></h2>
      </div>
      <div className="shell" style={{ marginTop: 56 }}>
        <div className="bonus-grid">
          <div className="bonus-card">
            <div className="bonus-tag">Bonus 01</div>
            <div className="bonus-title">The Multiplication Masterclass</div>
            <p className="bonus-body">
              Four short videos delivered free over four days. Ashley walks through the framework with whiteboard breakdowns and the field stories the book footnotes. Pastors say this is what made the book "click on Tuesday morning."
            </p>
            <a href="#order" className="bonus-link">Included automatically →</a>
          </div>
          <div className="bonus-card">
            <div className="bonus-tag">Bonus 02</div>
            <div className="bonus-title">Gen Z book bundle — under-29s & emerging leaders</div>
            <p className="bonus-body">
              Are you 29 or under, or do you have young leaders on your team? Add the companion Gen Z bundle free at checkout. Built for the leaders who'll inherit the multiplication.
            </p>
            <a href="#genz" className="bonus-link">See Gen Z bundle →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- FAQ ----------
function FAQ() {
  const [open, setOpen] = useStateB(0);
  const items = [
    { q: "Who is this book for — and not for?", a: "Senior pastors and executive pastors leading churches of 500–5,000+ who feel the ceiling of an addition-only model. It's not a small-church planting primer — for that, we recommend Exponential's free starter kit." },
    { q: "How does shipping work?", a: "We ship hardbacks in 5–7 business days within the US. $9.95 to most zip codes; $12.95 to AK/HI. Tracking is sent to the email on your order." },
    { q: "How does the Multiplication Masterclass work?", a: "Four pre-recorded videos, 12–18 minutes each, delivered to your inbox over four days. No live calls. Watch on your schedule. Workbook PDF included." },
    { q: "Why pay anything if it's free?", a: "Because every $20 you give above shipping sends one Indonesian, Spanish-speaking, or Sub-Saharan pastor through the same masterclass — at $0 cost to them. The free book is the entry. The donation is the multiplication." },
    { q: "Where do my donation dollars actually go?", a: "100% of donation dollars route to FCG's Sponsored Pastor Fund. Production, shipping, and platform costs are absorbed by FCG operating budget. We publish quarterly reports." },
    { q: "Can I see proof of the sponsored pastors?", a: "Yes. Every donor over $20 receives a quarterly impact report with named cohort summaries (Indonesia, LATAM, Sub-Saharan Africa). Names redacted only where local context requires it." },
    { q: "Is the donation tax-deductible?", a: "FCG is a registered US 501(c)(3). Donations are tax-deductible to the full extent allowed by law. Receipt is emailed automatically and archived in your account." },
    { q: "What's your refund policy?", a: "30-day money-back guarantee on the full order, including shipping and donation. No questions asked. Email steward@fcg.global." },
    { q: "Is this for small churches?", a: "The principles apply, but the case studies are written for the 500+ context. Pastors leading under 500 may find more leverage in our forthcoming companion volume — happy to send a sample chapter on request." },
    { q: "I'm under 29 — what's the Gen Z bundle?", a: "A separate companion landing page launches alongside this one. Same multiplication thesis, written specifically for leaders 29 and under. Add free at checkout or visit /genz when live." },
    { q: "Can I order this for my whole eldership?", a: "Yes. Bulk packs of 5, 10, 20, and 50 hardbacks ship at deep discount, and bulk orders multiply forward at the same per-copy rate. Quote desk replies in 24h." },
    { q: "Is there a digital edition?", a: "Hardback first. The Kindle and audio editions ship in Q3. Pre-order list opens to existing readers two weeks before public release." },
  ];
  return (
    <section className="faq" id="faq">
      <div className="shell">
        <div className="faq-grid">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 style={{ marginTop: 24 }}>Questions <span className="em">most pastors ask first.</span></h2>
            <p>Anything missing, email steward@fcg.global. Real human reply within one business day.</p>
          </div>
          <div className="faq-list">
            {items.map((it, i) => (
              <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
                <button type="button" className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{it.q}</span>
                  <span className="faq-q-icon">+</span>
                </button>
                <div className="faq-a"><p style={{ paddingTop: 4 }}>{it.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Final CTA + Footer ----------
function FinalCTA() {
  return (
    <section className="final">
      <div className="shell">
        <span className="eyebrow" style={{ color: 'color-mix(in srgb, var(--cream) 60%, transparent)' }}>Last call — for now</span>
        <h2 style={{ marginTop: 24 }}>If your church isn't multiplying, <span className="em">it's already dying.</span></h2>
        <p>The pastor in Indonesia doesn't know your name. He's waiting for the book you're about to claim.</p>
        <a href="#order" className="btn btn-primary btn-arrow">Get my free copy</a>
        <div className="final-counter">
          <div><span className="n">4,218</span>copies multiplied</div>
          <div><span className="n">$84,360</span>invested in pastors</div>
          <div><span className="n">211</span>pastors sponsored</div>
          <div><span className="n">14</span>countries reached</div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-inner">
          <div>
            <h4>Multiply or Die</h4>
            <a href="#order">Get the book</a>
            <a href="#bulk">Bulk pricing</a>
            <a href="#genz">Gen Z bundle</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Futures Church Global</h4>
            <a href="#">About FCG</a>
            <a href="#">Sponsored Pastor Fund</a>
            <a href="#">Quarterly reports</a>
            <a href="#">Contact stewardship</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
            <a href="#">501(c)(3) status</a>
            <a href="#">Refund policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Futures Church Global · multiplyordie.com</span>
          <span>Made with conviction · Atlanta · Melbourne · Jakarta</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { VSL, OrderBlock, Bonus, FAQ, FinalCTA, Footer });

// ==================== Multiply or Die — App ====================
const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "navy",
  "headline": "If your church isn't multiplying,|it's already dying.",
  "heroLayout": "asymmetric",
  "donationDefault": 40
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Apply palette via body data attribute
  useE(() => {
    document.body.dataset.palette = tweaks.palette;
  }, [tweaks.palette]);

  // Animated counters (count-up on intersection)
  useE(() => {
    const els = document.querySelectorAll('[data-counter]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        const target = parseInt(el.dataset.counter, 10);
        const prefix = el.dataset.prefix || '';
        const dur = 1400;
        const start = Date.now();
        const tick = () => {
          const t = Math.min(1, (Date.now() - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = Math.floor(target * eased);
          el.textContent = prefix + v.toLocaleString('en-US');
          if (t < 1) requestAnimationFrame(tick);
        };
        tick();
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <window.TopBar />
      <window.Hero headline={tweaks.headline} layout={tweaks.heroLayout} />
      <window.Problem />
      <window.Author />
      <window.Endorsements />
      <window.Inside />
      <window.Multiply />
      <window.VSL />
      <window.Bonus />
      <window.OrderBlock defaultDonation={tweaks.donationDefault} />
      <window.FAQ />
      <window.FinalCTA />
      <window.Footer />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Palette" subtitle="Pulled from cover artwork. Try them.">
          <window.TweakColor
            value={tweaks.palette}
            onChange={(v) => setTweak('palette', v)}
            options={[
              { value: 'navy', palette: ['#1a2547', '#a8472a', '#f3ebd7'] },
              { value: 'forest', palette: ['#1f3d2e', '#a8842c', '#f3ebd7'] },
              { value: 'oxblood', palette: ['#2a1810', '#9a3a1f', '#efe7d4'] },
              { value: 'ink', palette: ['#1a1a1a', '#7a6240', '#fafaf3'] },
            ]}
          />
        </window.TweakSection>

        <window.TweakSection title="Hero headline" subtitle="Use | to break the line. Bold for stakes.">
          <window.TweakText
            value={tweaks.headline}
            onChange={(v) => setTweak('headline', v)}
            multiline
          />
        </window.TweakSection>

        <window.TweakSection title="Hero layout">
          <window.TweakRadio
            value={tweaks.heroLayout}
            onChange={(v) => setTweak('heroLayout', v)}
            options={[
              { value: 'asymmetric', label: 'Asymmetric' },
              { value: 'centered', label: 'Centered' },
            ]}
          />
        </window.TweakSection>

        <window.TweakSection title="Order — slider default" subtitle="Psychological anchor at page load.">
          <window.TweakRadio
            value={tweaks.donationDefault}
            onChange={(v) => setTweak('donationDefault', Number(v))}
            options={[
              { value: 0, label: '$0' },
              { value: 25, label: '$25' },
              { value: 50, label: '$50' },
            ]}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

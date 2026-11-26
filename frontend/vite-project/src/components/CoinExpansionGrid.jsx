import { useEffect, useId, useRef, useState } from 'react';
import './CoinExpansionGrid.css';

export default function CoinExpansionGrid({ items, interactive = true, backLabel = '← All coins', onSelectionChange, showDetailsHeading = true }) {
  const groupName = useId();
  const gridRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [returning, setReturning] = useState(false);
  const lastIndex = items.length - 1;
  const tracks = (normal, expanded) => items.map((_, index) => index === selectedIndex ? expanded : normal).join(' ');
  const returnOrder = items.map((_, index) => index)
    .filter((index) => index !== selectedIndex)
    .sort((a, b) => Math.abs(a - selectedIndex) - Math.abs(b - selectedIndex) || a - b);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const grid = gridRef.current;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('coin-expansion--visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.25 });

    grid.querySelectorAll('.coin-expansion').forEach((cause) => observer.observe(cause));
    grid.classList.add('coin-expansion-grid--animated');
    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      className="coin-expansion-grid"
      data-returning={returning || undefined}
      style={{
        '--coin-count': Math.max(1, items.length),
        '--closed-columns': items.map(() => 'var(--coin-column)').join(' '),
        '--open-columns': tracks('var(--coin-column)', '100%'),
        '--closed-rows': items.map(() => 'minmax(0, 1fr)').join(' '),
        '--open-rows': tracks('minmax(0, 0fr)', 'minmax(0, 1fr)'),
        '--selected-index': selectedIndex ?? 0,
      }}
      ref={gridRef}
      onAnimationEnd={(event) => {
        if (event.animationName !== 'social-coin-return') return;
        const lastCoin = event.currentTarget.children[returnOrder.at(-1)];
        if (event.target === lastCoin) setReturning(false);
      }}
    >
      {items.map(({ id, name, displayName = name, subtitle, artwork, details }, index) => {
        const middle = index > 0 && index < lastIndex;
        const side = index > lastIndex / 2 ? 'right' : 'left';
        const coin = (
          <>
            <span className="coin-expansion-coin" aria-hidden="true">{artwork}</span>
            <span className="coin-expansion-name">{displayName}</span>
          </>
        );

        if (!interactive) {
          return <div key={id} className="coin-expansion">{coin}</div>;
        }

        return (
          <details
            key={id}
            className="coin-expansion"
            name={groupName}
            data-side={side}
            data-middle={middle || undefined}
            data-return-card={returning && index !== selectedIndex || undefined}
            style={{
              '--return-offset': index < selectedIndex ? '-42px' : '42px',
              '--exit-offset': index < selectedIndex ? '-100vw' : '100vw',
              '--return-delay': `calc(var(--expansion-return-delay, 280ms) + ${260 * returnOrder.indexOf(index)}ms)`,
            }}
          >
            <summary className="coin-expansion-summary" onClick={(event) => {
              const closing = event.currentTarget.parentElement.open;
              setSelectedIndex(index);
              setReturning(lastIndex > 0 && closing);
              onSelectionChange?.(closing ? null : id);
            }}>
              <span className="coin-expansion-back">{backLabel}</span>
              {coin}
              <span className="coin-expansion-purpose">{subtitle}</span>
            </summary>
            <div className="coin-expansion-description">
              {showDetailsHeading && (
                <>
                  <h3>{name}</h3>
                  <p className="coin-expansion-purpose">{subtitle}</p>
                </>
              )}
              {details}
            </div>
          </details>
        );
      })}
    </div>
  );
}

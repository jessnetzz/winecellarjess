import { useEffect } from 'react';
import BottleImage from './BottleImage';
import { Wine } from '../types/wine';

interface BottleDropCelebrationProps {
  wine: Wine;
  onDone: () => void;
}

export default function BottleDropCelebration({ wine, onDone }: BottleDropCelebrationProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1500);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="cellar-drop-overlay" aria-live="polite" aria-atomic="true">
      <div className="cellar-drop-card">
        <div className="cellar-drop-sparkles" aria-hidden="true">
          <span>✦</span>
          <span>☾</span>
          <span>✧</span>
        </div>
        <div className="cellar-drop-bottle">
          <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
        </div>
        <div className="cellar-drop-copy">
          <p className="section-kicker">Added to cellar</p>
          <p className="mt-1 truncate font-serif text-lg font-bold text-ink">
            {wine.vintage} {wine.name}
          </p>
          <p className="truncate text-xs font-semibold text-smoke">{wine.producer}</p>
        </div>
      </div>
    </div>
  );
}

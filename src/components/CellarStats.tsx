import { Wine } from '../types/wine';
import { getCellarStats } from '../utils/cellarStats';

interface CellarStatsProps {
  wines: Wine[];
}

const toneClasses = {
  plum: 'border-plum/20 bg-plum/10',
  gold: 'border-gold/30 bg-gold/15',
  moss: 'border-moss/20 bg-moss/10',
  lavender: 'border-lavender/30 bg-lavender/15',
};

export default function CellarStats({ wines }: CellarStatsProps) {
  const stats = getCellarStats(wines);

  if (!stats.length) return null;

  return (
    <section className="min-w-0 max-w-full" aria-labelledby="cellar-stats-heading">
      <p id="cellar-stats-heading" className="section-kicker">
        Your Cellar at a Glance
      </p>
      <div className="cellar-stats-scroll mt-3">
        {stats.map((stat) => (
          <article key={stat.id} className={`cellar-stat-card ${toneClasses[stat.tone]}`}>
            <span className="shrink-0 text-base" aria-hidden="true">{stat.icon}</span>
            <p className="min-w-0 whitespace-normal break-words">{stat.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

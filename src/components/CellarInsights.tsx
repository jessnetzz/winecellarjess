import Icon from './Icon';
import { Wine } from '../types/wine';
import { getCellarInsights } from '../utils/cellarInsights';

interface CellarInsightsProps {
  wines: Wine[];
}

const toneClasses = {
  plum: 'border-plum/15 bg-gradient-to-br from-porcelain via-[#FBF5F6] to-[#F8F0F4] text-plum',
  gold: 'border-gold/20 bg-gradient-to-br from-porcelain via-[#FCF7EB] to-[#F8F0DE] text-[#8A6727]',
  moss: 'border-moss/15 bg-gradient-to-br from-porcelain via-[#F4F6F0] to-[#EEF3EA] text-moss',
  lavender: 'border-lavender/20 bg-gradient-to-br from-porcelain via-[#F7F2FA] to-[#F4EEF8] text-plum',
} as const;

export default function CellarInsights({ wines }: CellarInsightsProps) {
  const insights = getCellarInsights(wines);

  if (!insights.length) return null;

  return (
    <section className="panel overflow-hidden">
      <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/70">Cellar insights</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">Little whispers from the cellar</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className={`interactive-surface rounded-lg border p-3.5 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-subtle ${toneClasses[insight.tone]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-current/70">{insight.label}</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/75 text-current shadow-sm">
                <Icon name={insight.icon} className="h-3.5 w-3.5" />
              </span>
            </div>
            <h3 className="mt-2.5 font-serif text-[1.04rem] leading-5 text-ink sm:text-[1.12rem]">{insight.headline}</h3>
            <p className="mt-1.5 text-[12px] leading-4.5 text-smoke">{insight.supportingLine}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

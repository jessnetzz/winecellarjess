import { FormEvent, useState } from 'react';
import { TastingLogEntry, Wine } from '../types/wine';
import { createId } from '../utils/id';
import { formatRating } from '../utils/formatters';

interface TastingJournalProps {
  wine: Wine;
  onAddTastingEntry: (wine: Wine, entry: TastingLogEntry) => void | Promise<void>;
}

const blankEntry = {
  tastingDate: new Date().toISOString().slice(0, 10),
  notes: '',
  rating: '',
  decanted: false,
  pairings: '',
  occasion: '',
};

export default function TastingJournal({ wine, onAddTastingEntry }: TastingJournalProps) {
  const [entry, setEntry] = useState(blankEntry);

  const addEntry = (event: FormEvent) => {
    event.preventDefault();

    if (!entry.tastingDate || !entry.notes.trim()) return;

    const tastingEntry: TastingLogEntry = {
      id: createId('taste'),
      tastingDate: entry.tastingDate,
      notes: entry.notes.trim(),
      rating: entry.rating ? Number(entry.rating) : undefined,
      decanted: entry.decanted,
      pairings: entry.pairings.trim(),
      occasion: entry.occasion.trim(),
    };

    void onAddTastingEntry(wine, tastingEntry);
    setEntry(blankEntry);
  };

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Tasting journal</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">How is it evolving?</h3>
        </div>
        <p className="text-sm text-smoke">{wine.tastingLog.length} logged tasting{wine.tastingLog.length === 1 ? '' : 's'}</p>
      </div>

      <form className="interactive-surface mt-5 rounded-lg border border-ink/10 bg-porcelain p-4 shadow-sm hover:border-gold/25 hover:shadow-subtle sm:p-5" onSubmit={addEntry}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="field-label">Date</span>
            <input
              className="field mt-2"
              type="date"
              value={entry.tastingDate}
              onChange={(event) => setEntry({ ...entry, tastingDate: event.target.value })}
            />
          </label>
          <label>
            <span className="field-label">Rating</span>
            <input
              className="field mt-2"
              type="number"
              min="50"
              max="100"
              placeholder="94"
              value={entry.rating}
              onChange={(event) => setEntry({ ...entry, rating: event.target.value })}
            />
          </label>
          <label>
            <span className="field-label">Occasion</span>
            <input
              className="field mt-2"
              placeholder="Dinner with friends"
              value={entry.occasion}
              onChange={(event) => setEntry({ ...entry, occasion: event.target.value })}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="field-label">Notes</span>
          <textarea
            className="field mt-2 min-h-24"
            placeholder="Aromas, texture, structure, bottle condition, how it changed..."
            value={entry.notes}
            onChange={(event) => setEntry({ ...entry, notes: event.target.value })}
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Pairings</span>
          <input
            className="field mt-2"
            placeholder="Duck confit, Comte, grilled salmon..."
            value={entry.pairings}
            onChange={(event) => setEntry({ ...entry, pairings: event.target.value })}
          />
        </label>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex min-h-11 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 text-sm font-semibold text-ink shadow-sm sm:border-0 sm:bg-transparent sm:px-0 sm:shadow-none">
            <input
              className="h-5 w-5 accent-vine"
              type="checkbox"
              checked={entry.decanted}
              onChange={(event) => setEntry({ ...entry, decanted: event.target.checked })}
            />
            Decanted
          </label>
          <button className="premium-button" type="submit">
            Add tasting note
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-4">
        {wine.tastingLog.length ? (
          wine.tastingLog.map((log) => (
            <article key={log.id} className="tasting-note-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-ink">{log.tastingDate}</p>
                  <p className="text-sm text-smoke">{log.occasion || 'Casual tasting'} · {log.decanted ? 'Decanted' : 'Not decanted'}</p>
                </div>
                <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-[#7B5A22]">{formatRating(log.rating)}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink">{log.notes}</p>
              {log.pairings ? <p className="mt-3 text-sm font-semibold text-moss">With {log.pairings}</p> : null}
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-ink/15 bg-porcelain p-5 text-sm leading-6 text-smoke">
            No tastings logged yet. Add a note when you open a bottle to track how it evolves over time.
          </div>
        )}
      </div>
    </section>
  );
}

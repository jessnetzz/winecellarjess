import Icon from './Icon';

type AuthEntry = 'sign-in' | 'sign-up';

interface LandingPageProps {
  onAuthEntry: (mode: AuthEntry) => void;
}

const imageSources = {
  hero: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2400&q=82',
  table: 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?auto=format&fit=crop&w=1800&q=82',
  cellar: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&w=1600&q=82',
  pour: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=82',
};

const productNotes = [
  'Drink windows that feel useful, not fussy.',
  'Tasting notes for the bottles you want to remember.',
  'AI suggestions you can edit before anything becomes canon.',
  'A nightly pick shaped by your cellar, your taste, and the weather.',
];

export default function LandingPage({ onAuthEntry }: LandingPageProps) {
  return (
    <div className="app-shell overflow-hidden bg-ink text-porcelain">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a className="group flex items-center gap-3 text-porcelain" href="#top" aria-label="Okay, Just a Bottle home">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 shadow-subtle backdrop-blur transition duration-300 group-hover:bg-white/20">
              <Icon name="glass" className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-serif text-xl font-bold leading-none">Okay, Just a Bottle</span>
              <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.28em] text-porcelain/60 sm:block">
                Personal cellar, good nights
              </span>
            </span>
          </a>

          <nav className="flex items-center gap-2" aria-label="Public navigation">
            <button className="ghost-button text-porcelain hover:bg-white/15 hover:text-white" type="button" onClick={() => onAuthEntry('sign-in')}>
              Log in
            </button>
            <button className="premium-button bg-porcelain text-plum hover:bg-white hover:text-pinot" type="button" onClick={() => onAuthEntry('sign-up')}>
              Sign up
            </button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="relative flex min-h-[92svh] items-end overflow-hidden pb-14 pt-32 text-porcelain sm:pb-20 lg:min-h-screen">
          <img
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.82]"
            src={imageSources.hero}
            alt="A warmly lit wine cellar with bottles resting on dark shelves"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_12%,rgba(185,142,69,0.26),transparent_28%),linear-gradient(115deg,rgba(37,31,33,0.94),rgba(90,31,49,0.76)_46%,rgba(37,31,33,0.5))]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" />
          <div className="pointer-events-none absolute left-8 top-32 hidden text-lg text-gold/70 sm:block" aria-hidden="true">✦</div>
          <div className="pointer-events-none absolute right-10 top-44 hidden text-sm text-porcelain/60 lg:block" aria-hidden="true">☾</div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-gold/90">A private cellar for people who mean well at wine shops</p>
              <h1 className="mt-5 max-w-5xl font-liam text-[4.1rem] font-normal leading-[0.84] text-white sm:text-[7.2rem] lg:text-[9.8rem]">
                For the bottle you should probably open tonight.
              </h1>
              <div className="mt-7 grid gap-6 border-t border-white/20 pt-6 md:grid-cols-[minmax(0,34rem)_auto] md:items-end">
                <p className="max-w-2xl text-base leading-7 text-porcelain/80 sm:text-lg sm:leading-8">
                  Track your collection, remember what you loved, and let the cellar quietly tell you when something is ready.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                  <button className="premium-button min-h-12 bg-porcelain px-6 text-plum hover:bg-white hover:text-pinot" type="button" onClick={() => onAuthEntry('sign-up')}>
                    Sign up
                  </button>
                  <button className="secondary-button min-h-12 border-white/30 bg-white/10 px-6 text-porcelain backdrop-blur hover:bg-white hover:text-plum" type="button" onClick={() => onAuthEntry('sign-in')}>
                    Log in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ink px-4 py-8 sm:px-6 lg:px-8" aria-label="Brand refrain">
          <div className="mx-auto flex max-w-7xl overflow-hidden border-y border-white/10 py-4">
            <p className="min-w-max animate-[marquee_28s_linear_infinite] pr-10 font-serif text-2xl italic text-porcelain/80 sm:text-4xl">
              good bottles · good moods · forgotten favorites · dinner party notes · one more bottle · drink windows ·
            </p>
            <p className="min-w-max animate-[marquee_28s_linear_infinite] pr-10 font-serif text-2xl italic text-porcelain/80 sm:text-4xl" aria-hidden="true">
              good bottles · good moods · forgotten favorites · dinner party notes · one more bottle · drink windows ·
            </p>
          </div>
        </section>

        <section className="bg-paper px-4 py-16 text-ink sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.48fr)] lg:items-end">
            <div className="min-w-0">
              <p className="section-kicker">What it keeps</p>
              <h2 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.95] sm:text-7xl">
                A little memory palace for good bottles and better nights.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-smoke">
                Okay, Just a Bottle is not here to make wine feel like homework. It keeps the practical things close:
                what you have, where it lives, when to open it, and why you liked it last time.
              </p>
            </div>

            <div className="relative min-h-[23rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-cellar">
              <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.table} alt="Wine glasses on a warmly lit dinner table" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/58 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 max-w-xs font-serif text-2xl font-bold leading-tight text-white">
                For dinner parties, rainy Tuesdays, and the ones you forgot were tucked away.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper px-4 pb-16 text-ink sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.58fr_minmax(0,1fr)] lg:items-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative min-h-[22rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-subtle sm:min-h-[30rem]">
                <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.cellar} alt="Rows of wine bottles in a cellar" />
              </div>
              <div className="relative mt-10 min-h-[18rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-subtle sm:min-h-[24rem]">
                <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.pour} alt="Red wine being poured into a glass" />
              </div>
            </div>

            <div className="min-w-0 lg:pl-10">
              <p className="section-kicker">The useful part, quietly</p>
              <div className="mt-5 space-y-5">
                {productNotes.map((note, index) => (
                  <div key={note} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-ink/10 pt-5">
                    <span className="font-serif text-2xl font-bold text-plum">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-xl font-semibold leading-snug text-ink sm:text-2xl">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tonights-bottle" className="relative overflow-hidden bg-vine px-4 py-16 text-porcelain sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(185,162,197,0.22),transparent_28%),radial-gradient(circle_at_12%_76%,rgba(185,142,69,0.18),transparent_26%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold/90">Tonight’s Bottle</p>
              <h2 className="mt-4 max-w-4xl font-liam text-[3.5rem] font-normal leading-[0.9] text-white sm:text-7xl lg:text-8xl">
                Let tonight choose itself.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-porcelain/80 sm:text-lg sm:leading-8">
                The app weighs what is ready, what you have loved, and what the evening feels like. It is a nudge,
                not a commandment. The bottle still gets to be yours.
              </p>
            </div>

            <aside className="rounded-lg border border-white/15 bg-porcelain p-5 text-ink shadow-cellar">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Tonight’s Bottle</p>
                  <h3 className="mt-2 font-serif text-3xl font-bold leading-tight">2021 Sonoma Coast Pinot Noir</h3>
                  <p className="mt-2 text-sm font-semibold text-smoke">A rainy-night bottle · 56°F</p>
                </div>
                <span className="rounded-lg bg-gold/15 px-3 py-2 text-lg" aria-hidden="true">☾</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">Peak window</span>
                <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-bold text-smoke">Sonoma, CA</span>
              </div>
              <p className="mt-4 text-sm leading-6">
                Cool and rainy tonight — this Pinot Noir feels like a lovely, quiet companion. Open it with dinner and let the evening do the rest.
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-ink px-4 py-16 text-porcelain sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold/90">Come over</p>
              <h2 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.98] sm:text-7xl">
                Start a cellar that feels alive.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-porcelain/70">
                Good bottles, good notes, good nights. Nothing too precious. Just enough ritual to make opening one feel special.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button className="premium-button min-h-12 bg-porcelain px-6 text-plum hover:bg-white hover:text-pinot" type="button" onClick={() => onAuthEntry('sign-up')}>
                Sign up
              </button>
              <button className="secondary-button min-h-12 border-white/30 bg-white/10 px-6 text-porcelain backdrop-blur hover:bg-white hover:text-plum" type="button" onClick={() => onAuthEntry('sign-in')}>
                Log in
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-ink px-4 py-8 text-porcelain/70 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-xl font-bold text-porcelain">Okay, Just a Bottle</p>
          <p>Built for good bottles, good moods, and knowing when to open something special.</p>
          <button className="ghost-button w-fit text-porcelain hover:bg-white/15 hover:text-white" type="button" onClick={() => onAuthEntry('sign-in')}>
            Log in
          </button>
        </div>
      </footer>
    </div>
  );
}

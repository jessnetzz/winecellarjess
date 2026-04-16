import Icon, { IconName } from './Icon';

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

const previewNotes = [
  'Drink windows that feel useful, not dramatic.',
  'Tasting notes for the bottles that were sneakily great.',
  'A bottle nudge for rainy nights, dinner parties, and low-effort heroics.',
];

const featureCards: Array<{
  icon: IconName;
  kicker: string;
  title: string;
  body: string;
}> = [
  {
    icon: 'collection',
    kicker: 'The collection',
    title: 'Keep the practical things where you can find them.',
    body: 'Bottle counts, regions, storage spots, and the little details that tend to disappear after one very good glass.',
  },
  {
    icon: 'sparkle',
    kicker: 'The memory',
    title: 'Remember what actually charmed you.',
    body: 'Tasting notes, pairings, and quick impressions so a lovely bottle does not vanish into vague dinner-party mythology.',
  },
  {
    icon: 'glass',
    kicker: 'The nudge',
    title: 'Know what to open without spiraling.',
    body: 'A calm recommendation shaped by your cellar, the weather, and the exact kind of night you seem to be having.',
  },
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
        <section className="relative overflow-hidden pb-14 pt-32 text-porcelain sm:pb-20 lg:pb-24">
          <img
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-[0.78]"
            src={imageSources.hero}
            alt="A warmly lit wine cellar with bottles resting on dark shelves"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(185,142,69,0.2),transparent_24%),linear-gradient(115deg,rgba(37,31,33,0.95),rgba(74,34,53,0.8)_44%,rgba(37,31,33,0.62))]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="min-w-0 lg:flex lg:justify-center lg:pt-0 xl:-translate-y-4">
                <div className="max-w-5xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-gold/90">
                  A private cellar for good bottles and low-stakes rituals
                </p>
                <h1 className="mt-5 max-w-5xl font-liam text-[3.8rem] font-normal leading-[0.88] text-white sm:text-[5.8rem] lg:text-[7.4rem]">
                  For the bottle you keep meaning to open.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-porcelain/80 sm:text-lg sm:leading-8">
                  Track what you bought, where you tucked it, and why it was lovely, with just enough structure to feel
                  useful and not nearly enough to feel like homework.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button className="premium-button min-h-12 bg-porcelain px-6 text-plum hover:bg-white hover:text-pinot" type="button" onClick={() => onAuthEntry('sign-up')}>
                    Start your cellar
                  </button>
                  <button className="secondary-button min-h-12 border-white/30 bg-white/10 px-6 text-porcelain backdrop-blur hover:bg-white hover:text-plum" type="button" onClick={() => onAuthEntry('sign-in')}>
                    I already have one
                  </button>
                </div>
                </div>
              </div>

              <aside className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-cellar backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/85">A quick look</p>
                    <h2 className="mt-3 font-liam text-[2rem] font-normal leading-none text-white sm:text-[2.25rem]">
                      The useful bits, minus the wine homework.
                    </h2>
                  </div>
                  <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-porcelain/75">
                    Private
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {previewNotes.map((note) => (
                    <div key={note} className="rounded-lg border border-white/12 bg-white/10 px-4 py-3">
                      <p className="text-sm font-semibold leading-6 text-white/90">{note}</p>
                    </div>
                  ))}
                </div>

              </aside>
            </div>
          </div>
        </section>

        <section className="bg-paper px-4 py-16 text-ink sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.6fr)] lg:items-start">
            <div className="min-w-0">
              <p className="section-kicker">What it is good at</p>
              <h2 className="mt-4 max-w-4xl font-liam text-[2.9rem] font-normal leading-[0.94] text-ink sm:text-[4.5rem]">
                More like a very organized wine memory.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-smoke">
                Okay, Just a Bottle is for people who want the useful parts of a cellar app without becoming a person who
                says things like portfolio allocation about Chardonnay.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureCards.map((card) => (
                  <article key={card.title} className="rounded-lg border border-[#E7DCCB] bg-porcelain/92 p-5 shadow-subtle">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-plum/8 text-plum">
                      <Icon name={card.icon} className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.26em] text-plum/80">{card.kicker}</p>
                    <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-ink">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-smoke">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#E7DCCB] bg-porcelain/85 p-5 shadow-cellar">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative min-h-[12rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-subtle">
                  <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.table} alt="Wine glasses on a warmly lit dinner table" />
                </div>
                <div className="relative min-h-[12rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-subtle">
                  <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.pour} alt="Red wine being poured into a glass" />
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-[#E7DCCB] bg-white/85 p-4">
                <p className="section-kicker">For the nights that need help choosing</p>
                <p className="mt-3 font-serif text-2xl font-bold leading-tight text-ink">
                  Dinner parties, rainy Tuesdays, and the bottle you forgot you were saving for something.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="tonights-bottle" className="relative overflow-hidden bg-vine px-4 py-16 text-porcelain sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(185,162,197,0.22),transparent_28%),radial-gradient(circle_at_12%_76%,rgba(185,142,69,0.18),transparent_26%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold/90">Tonight’s bottle</p>
              <h2 className="mt-4 max-w-4xl font-liam text-[3.2rem] font-normal leading-[0.92] text-white sm:text-[5.4rem] lg:text-[6.5rem]">
                Let the cellar be a tiny bit opinionated.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-porcelain/80 sm:text-lg sm:leading-8">
                It weighs the weather, the vibe, and the bottles you already have on hand. Not a chatbot trying to hold
                court. Just a tasteful nudge in the right direction.
              </p>
            </div>

            <aside className="rounded-lg border border-white/15 bg-porcelain p-5 text-ink shadow-cellar">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Tonight’s bottle</p>
                  <h3 className="mt-2 font-serif text-3xl font-bold leading-tight">2021 Sonoma Coast Pinot Noir</h3>
                  <p className="mt-2 text-sm font-semibold text-smoke">Rainy-night pick · 56°F</p>
                </div>
                <span className="rounded-lg bg-gold/15 px-3 py-2 text-lg" aria-hidden="true">☾</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">Drinking beautifully</span>
                <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-bold text-smoke">Sonoma, CA</span>
              </div>
              <p className="mt-4 text-sm leading-6">
                Cool and rainy tonight, so this Pinot Noir feels like a soft landing: gentle structure, lovely fruit,
                and just enough mood to make dinner feel more intentional than it was.
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-paper px-4 py-16 text-ink sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.8fr)] lg:items-center">
            <div className="relative min-h-[24rem] overflow-hidden rounded-lg border border-[#E7DCCB] shadow-cellar">
              <img className="absolute inset-0 h-full w-full object-cover" src={imageSources.cellar} alt="Rows of wine bottles in a cellar" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 max-w-sm font-serif text-2xl font-bold leading-tight text-white">
                Built for the collector who wants better memory, not more admin.
              </p>
            </div>

            <div>
              <p className="section-kicker">Ready when you are</p>
              <h2 className="mt-4 max-w-3xl font-liam text-[2.8rem] font-normal leading-[0.95] text-ink sm:text-[4.6rem]">
                Start a cellar that feels alive.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-smoke">
                Good bottles, good notes, good nights. Nothing too precious. Just enough ritual to make opening one feel
                special, and just enough structure to remember why it was.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="premium-button min-h-12 px-6" type="button" onClick={() => onAuthEntry('sign-up')}>
                  Sign up
                </button>
                <button className="secondary-button min-h-12 px-6" type="button" onClick={() => onAuthEntry('sign-in')}>
                  Log in
                </button>
              </div>
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

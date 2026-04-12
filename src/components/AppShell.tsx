import { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import Icon, { IconName } from './Icon';

interface AppShellProps {
  children: ReactNode;
  user: User;
  query: string;
  viewMode: 'cards' | 'table';
  isBusy: boolean;
  onQueryChange: (query: string) => void;
  onCreateWine: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
  onToggleView: () => void;
}

const navItems: Array<{ label: string; href: string; icon: IconName }> = [
  { label: 'Dashboard', href: '#dashboard', icon: 'dashboard' },
  { label: 'Collection', href: '#collection', icon: 'collection' },
  { label: 'Analytics', href: '#analytics', icon: 'analytics' },
  { label: 'Storage', href: '#storage', icon: 'cellar' },
  { label: 'Settings', href: '#settings', icon: 'settings' },
];

function Sidebar({ onCreateWine }: Pick<AppShellProps, 'onCreateWine'>) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[#E7DCCB] bg-porcelain/90 px-4 py-5 backdrop-blur xl:sticky xl:top-0 xl:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-plum text-white shadow-subtle">
          <Icon name="glass" className="h-6 w-6" />
        </div>
        <div>
          <p className="font-serif text-2xl font-bold leading-none text-ink">Cellar</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-smoke">Private collection</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1 border-y border-[#E7DCCB] py-4" aria-label="Primary navigation">
        {navItems.map((item, index) => (
          <a key={item.href} className={`nav-item ${index === 0 ? 'nav-item-active' : ''}`} href={item.href}>
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </a>
        ))}
        <button className="nav-item w-full text-left" type="button" onClick={onCreateWine}>
          <Icon name="plus" className="h-5 w-5" />
          Add Wine
        </button>
      </nav>

      <div className="sidebar-note interactive-surface mt-10 rounded-lg border border-plum/15 bg-white/75 p-4 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-white hover:shadow-subtle">
        <p className="section-kicker">Drink windows</p>
        <p className="mt-2 text-sm leading-6 text-smoke">
          Use the dashboard and badges to spot bottles that are at peak, ready now, or slipping past their ideal year.
        </p>
      </div>
    </aside>
  );
}

function TopNav({
  user,
  query,
  viewMode,
  isBusy,
  onQueryChange,
  onCreateWine,
  onRefresh,
  onSignOut,
  onToggleView,
}: Omit<AppShellProps, 'children'>) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E7DCCB] bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="xl:hidden">
            <p className="section-kicker">Private cellar</p>
            <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-ink">Wine Cellar</h1>
          </div>

          <label className="relative max-w-2xl flex-1">
            <span className="sr-only">Search cellar</span>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-smoke" />
            <input
              className="field h-11 bg-white/95 pl-11"
              type="search"
              placeholder="Search wine, producer, region, grape, notes..."
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button className="secondary-button" type="button" onClick={onToggleView}>
              {viewMode === 'cards' ? 'Table view' : 'Gallery view'}
            </button>
            <button className="secondary-button" type="button" onClick={onRefresh} disabled={isBusy}>
              Refresh
            </button>
            <button className="premium-button" type="button" onClick={onCreateWine} disabled={isBusy}>
              <Icon name="plus" className="h-4 w-4" />
              Add wine
            </button>
            <div className="interactive-surface flex items-center gap-2 rounded-lg border border-plum/15 bg-white/85 px-3 py-2 shadow-sm hover:border-lavender/35 hover:bg-white hover:shadow-subtle">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-lavender/20 text-plum">
                <Icon name="user" className="h-4 w-4" />
              </span>
              <span className="max-w-[170px] truncate text-sm font-semibold text-ink">{user.email}</span>
            </div>
            <button className="ghost-button" type="button" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.href} className="nav-item shrink-0 bg-white/70" href={item.href}>
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function AppShell(props: AppShellProps) {
  return (
    <div className="app-shell flex">
      <Sidebar onCreateWine={props.onCreateWine} />
      <div className="min-w-0 flex-1">
        <TopNav {...props} />
        {props.children}
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import Icon, { IconName } from './Icon';
import { getUserCellarLabel } from '../utils/userDisplayName';

interface AppShellProps {
  children: ReactNode;
  user: User;
  onCreateWine: () => void;
  onSignOut: () => void;
  basePath?: string;
  profilePath?: string;
}

const navItems: Array<{ label: string; href: string; icon: IconName }> = [
  { label: 'Dashboard', href: '#dashboard', icon: 'dashboard' },
  { label: 'Collection', href: '#collection', icon: 'collection' },
  { label: 'Analytics', href: '#analytics', icon: 'analytics' },
  { label: 'Storage', href: '#storage', icon: 'cellar' },
  { label: 'Settings', href: '#settings', icon: 'settings' },
];

const mobileNavItems: Array<{ label: string; href?: string; icon: IconName; action?: 'create' }> = [
  { label: 'Home', href: '#dashboard', icon: 'dashboard' },
  { label: 'Collection', href: '#collection', icon: 'collection' },
  { label: 'Add', icon: 'plus', action: 'create' },
  { label: 'Drink Now', href: '#drink-now', icon: 'glass' },
  { label: 'Settings', href: '#settings', icon: 'user' },
];

function Sidebar({ onCreateWine, basePath = '/app' }: Pick<AppShellProps, 'onCreateWine' | 'basePath'>) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[#E7DCCB] bg-porcelain/90 px-4 py-5 backdrop-blur lg:sticky lg:top-0 lg:block">
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
          <a key={item.href} className={`nav-item ${index === 0 ? 'nav-item-active' : ''}`} href={`${basePath}${item.href}`}>
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
  onSignOut,
  profilePath = '/account',
}: Omit<AppShellProps, 'children'>) {
  const cellarLabel = getUserCellarLabel(user);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7DCCB] bg-paper/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <p className="section-kicker max-w-[220px] truncate">{cellarLabel}</p>
            <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-ink">Wine Cellar</h1>
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            <a
              className="interactive-surface hidden items-center gap-2 rounded-lg border border-plum/15 bg-white/85 px-3 py-2 shadow-sm hover:border-lavender/35 hover:bg-white hover:shadow-subtle sm:flex"
              href={profilePath}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-lavender/20 text-plum">
                <Icon name="user" className="h-4 w-4" />
              </span>
              <span className="max-w-[170px] truncate text-sm font-semibold text-ink">{user.email}</span>
            </a>
            <button className="ghost-button" type="button" onClick={onSignOut}>
              Sign out
            </button>
          </div>
      </div>
    </header>
  );
}

function BottomNav({ onCreateWine, basePath = '/app', profilePath = '/account' }: Pick<AppShellProps, 'onCreateWine' | 'basePath' | 'profilePath'>) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-lg border border-[#E7DCCB] bg-porcelain/95 px-2 py-2 shadow-cellar backdrop-blur-xl lg:hidden" aria-label="Mobile primary navigation">
      <div className="grid grid-cols-5 items-center gap-1">
        {mobileNavItems.map((item) => {
          const baseClass =
            item.action === 'create'
              ? 'mobile-nav-item mobile-nav-add'
              : 'mobile-nav-item';
          const content = (
            <>
              <Icon name={item.icon} className="h-5 w-5" />
              <span>{item.label}</span>
            </>
          );

          return item.action === 'create' ? (
            <button key={item.label} className={baseClass} type="button" onClick={onCreateWine}>
              {content}
            </button>
          ) : (
            <a key={item.href} className={baseClass} href={item.label === 'Settings' ? profilePath : `${basePath}${item.href}`}>
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppShell(props: AppShellProps) {
  return (
    <div className="app-shell flex">
      <Sidebar onCreateWine={props.onCreateWine} basePath={props.basePath} />
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <TopNav {...props} />
        {props.children}
      </div>
      <BottomNav onCreateWine={props.onCreateWine} basePath={props.basePath} profilePath={props.profilePath} />
    </div>
  );
}

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Avatar, Button } from '@/components/ui';
import {
  IconAccounts,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconProfile,
  IconTransactions,
} from './icons';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/accounts', label: 'Accounts', Icon: IconAccounts },
  { to: '/transactions', label: 'Transactions', Icon: IconTransactions },
  { to: '/profile', label: 'Profile', Icon: IconProfile },
];

/**
 * The persistent layout for authenticated pages: a fixed sidebar on desktop that
 * becomes a toggleable drawer on mobile. Uses semantic landmarks (nav/main/header)
 */
export function AppNav() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="block fixed inset-0 bg-[rgba(14,42,43,0.4)] z-[48]"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      <nav
        className={[
          'fixed inset-y-0 left-0 w-[264px] bg-sidebar text-sidebar-text flex flex-col py-6 px-4 z-[50]',
          'max-[860px]:shadow-lg max-[860px]:transition-transform max-[860px]:duration-[220ms] max-[860px]:ease-[cubic-bezier(0.22,1,0.36,1)]',
          drawerOpen ? 'max-[860px]:translate-x-0' : 'max-[860px]:-translate-x-full',
        ].join(' ')}
        aria-label="Primary"
      >
        <div className="font-display text-xl text-white pt-2 px-3 pb-8 tracking-[-0.01em]">
          ✦ Eagle Bank
        </div>

        <ul role="list" className="flex flex-col gap-1 flex-1">
          {NAV.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 p-3 rounded-md font-medium text-sidebar-text transition-[background-color] duration-[120ms] ease-[var(--ease-out)] hover:bg-sidebar-hover hover:text-sidebar-text-active',
                    isActive
                      ? 'bg-sidebar-hover text-sidebar-text-active shadow-[inset_3px_0_0_var(--color-accent)]'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                onClick={() => setDrawerOpen(false)}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-t border-[rgba(255,255,255,0.08)] pt-3">
          <button
            type="button"
            className="flex items-center gap-3 w-full p-3 rounded-md text-sidebar-text font-medium hover:bg-sidebar-hover hover:text-white"
            onClick={() => void logout()}
          >
            <IconLogout />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      <div className="ml-[264px] min-h-screen flex flex-col max-[860px]:ml-0">
        <header className="sticky top-0 z-[49] h-[68px] flex items-center gap-3 px-8 bg-[var(--topbar-bg)] backdrop-blur-[8px] border-b border-border">
          <button
            type="button"
            className="hidden max-[860px]:inline-flex text-text"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <IconMenu />
          </button>
          <div className="hidden max-[860px]:inline-flex font-display text-lg">Eagle Bank</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-semibold text-sm max-[860px]:hidden">{user?.fullName}</span>
            <Avatar name={user?.fullName ?? ''} src={user?.avatarUrl} size={36} />
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 p-8 max-w-[1180px] w-full mx-auto outline-none max-[860px]:p-4"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Sign out button on side bar*/
export function SignOutButton() {
  const { logout } = useAuth();
  return (
    <Button variant="ghost" onClick={() => void logout()}>
      Sign out
    </Button>
  );
}

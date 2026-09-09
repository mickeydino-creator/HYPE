import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const items = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/discover', label: 'Discover', icon: DiscoverIcon },
  { to: '/create', label: 'Create', icon: PlusIcon },
  { to: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass-strong flex items-center justify-between rounded-[1.75rem] px-2 py-2 shadow-glass">
          {items.map(({ to, label, icon: Icon }) => {
            const isCreate = to === '/create';
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={() =>
                  clsx(
                    'tap-scale flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-colors',
                    isCreate && 'relative -mt-5'
                  )
                }
              >
                {({ isActive }) =>
                  isCreate ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/10">
                      <Icon active={isActive} />
                    </div>
                  ) : (
                    <>
                      <Icon active={isActive} />
                      <span className={clsx('text-[10px] font-medium', isActive ? 'text-white' : 'text-white/40')}>
                        {label}
                      </span>
                    </>
                  )
                }
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function iconColor(active?: boolean) {
  return active ? '#fff' : 'rgba(255,255,255,0.4)';
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
        stroke={iconColor(active)}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiscoverIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PortfolioIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5m6 14V9m6 10V13" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

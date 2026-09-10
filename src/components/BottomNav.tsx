import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import GlassSurface from './GlassSurface';

const items = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/discover', label: 'Discover', icon: DiscoverIcon },
  { to: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="relative">
          <GlassSurface
            width="100%"
            height={68}
            borderRadius={28}
            backgroundOpacity={0.7}
            blur={8}
            displace={2}
            distortionScale={-140}
            className="w-full border border-base-border shadow-nav"
          >
            <div className="flex w-full items-center justify-between px-2">
              {items.slice(0, 2).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className="tap-scale flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2"
                >
                  {({ isActive }) => (
                    <>
                      <Icon active={isActive} />
                      <span className={clsx('text-[10px] font-semibold', isActive ? 'text-ink-900' : 'text-ink-400')}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              <span className="w-12 shrink-0" aria-hidden="true" />

              {items.slice(2).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className="tap-scale flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2"
                >
                  {({ isActive }) => (
                    <>
                      <Icon active={isActive} />
                      <span className={clsx('text-[10px] font-semibold', isActive ? 'text-ink-900' : 'text-ink-400')}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </GlassSurface>

          <NavLink
            to="/create"
            className="tap-scale absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-glow"
          >
            <PlusIcon />
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function iconStroke(active?: boolean) {
  return active ? 'stroke-ink-900' : 'stroke-ink-400';
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={iconStroke(active)}>
      <path
        d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiscoverIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={iconStroke(active)}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function PortfolioIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={iconStroke(active)}>
      <path d="M4 19V5m6 14V9m6 10V13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={iconStroke(active)}>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

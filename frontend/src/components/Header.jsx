import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { useNotifications } from '../hooks/useNotifications';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const GLOBAL_STYLES = `
  @keyframes badgePop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.4); opacity: 1; }
    80%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes badgeBump {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.55); }
    70%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes notifSlideDown {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes notifItemIn {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes headerReveal {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bellRing {
    0%,100% { transform: rotate(0); }
    15%     { transform: rotate(18deg); }
    30%     { transform: rotate(-14deg); }
    45%     { transform: rotate(10deg); }
    60%     { transform: rotate(-6deg); }
    75%     { transform: rotate(3deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1); opacity: .6; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes notifPanelSlide {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes notifRowIn {
    from { opacity: 0; transform: translateX(10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .nav-link-animated { position: relative; text-decoration: none; }
  .nav-link-animated::after {
    content: ''; position: absolute; bottom: -2px; left: 0;
    width: 0; height: 1.5px; background: #b07d62;
    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .nav-link-animated:hover::after, .nav-link-animated.active::after { width: 100%; }
  .icon-btn { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), color 0.2s; }
  .icon-btn:hover { transform: translateY(-1px); }
  .icon-btn:active { transform: scale(0.9); }
  .bell-btn:hover .bell-icon { animation: bellRing 0.6s ease forwards; }
`;

function Badge({ count, small }) {
  const [bump, setBump] = useState(false);
  const [appeared, setAppeared] = useState(false);
  useEffect(() => {
    if (!count || count < 1) return;
    if (!appeared) { setAppeared(true); return; }
    setBump(true);
    const t = setTimeout(() => setBump(false), 420);
    return () => clearTimeout(t);
  }, [count]);
  if (!count || count < 1) return null;
  const size = small ? 15 : 17;
  const fontSize = small ? 9 : 10;
  return (
    <span style={{
      position: 'absolute', top: small ? '-5px' : '-6px', right: small ? '-6px' : '-7px',
      minWidth: `${size}px`, height: `${size}px`, borderRadius: '999px',
      background: '#b07d62', color: '#fff', fontSize: `${fontSize}px`, fontWeight: '700',
      lineHeight: `${size}px`, textAlign: 'center', padding: '0 4px', pointerEvents: 'none',
      boxShadow: '0 1px 6px rgba(176,125,98,.45)',
      animation: bump ? 'badgeBump 0.38s cubic-bezier(.36,1.56,.64,1) both'
        : !appeared ? 'badgePop 0.4s cubic-bezier(.36,1.56,.64,1) both' : 'none',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

const TYPE_ICON = { order: '📦', promotion: '🎁', newsletter: '📰', delivery: '🛵', complaint: '💬' };
const TYPE_COLOR = { order: '#e8f4fd', promotion: '#fdf3e8', newsletter: '#f0fdf4', delivery: '#fdf0f8', complaint: '#fdf5e8' };

function NotificationDropdown({ notifications, unreadCount, markRead, markAllRead, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 14px)', right: '-8px', width: '340px',
      background: '#fff', borderRadius: '18px', border: '1px solid rgba(176,125,98,.15)',
      boxShadow: '0 12px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)',
      zIndex: 300, animation: 'notifSlideDown 0.28s cubic-bezier(0.22,1,0.36,1) both',
      fontFamily: "'Georgia', serif", overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-6px', right: '18px', width: '12px', height: '12px',
        background: '#fff', border: '1px solid rgba(176,125,98,.15)',
        borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)',
      }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 18px 12px', borderBottom: '1px solid #f5ede6',
        background: 'linear-gradient(to bottom, #fffaf7, #fff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ background: '#b07d62', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: '700', padding: '1px 7px', lineHeight: '16px' }}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '11px', color: '#b07d62', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: "'Georgia', serif", padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#faf0e8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >Mark all read</button>
        )}
      </div>
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</div>
            <p style={{ color: '#bbb', fontSize: '13px', margin: 0 }}>No notifications yet.</p>
          </div>
        ) : notifications.map((n, i) => (
          <div key={n.id} onClick={() => markRead(n.id)} style={{
            display: 'flex', gap: '12px', padding: '12px 18px', cursor: 'pointer',
            background: n.is_read ? 'transparent' : '#faf6f1',
            borderBottom: '1px solid #f5f0ea', transition: 'background 0.18s',
            animation: `notifItemIn 0.3s ${i * 0.04}s both`,
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5ede6'}
            onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : '#faf6f1'}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: TYPE_COLOR[n.type] ?? '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{TYPE_ICON[n.type] ?? '🔔'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12.5px', fontWeight: n.is_read ? '400' : '700', margin: 0, color: '#1a1a1a', lineHeight: 1.3 }}>{n.title}</p>
              <p style={{ fontSize: '11.5px', color: '#999', margin: '3px 0 0', lineHeight: 1.4 }}>{n.body}</p>
              <p style={{ fontSize: '10px', color: '#bbb', margin: '4px 0 0' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {!n.is_read && (
              <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0, marginTop: '8px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#b07d62', opacity: 0.4, animation: 'pulseRing 1.8s ease-out infinite' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b07d62', position: 'relative' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {notifications.length > 0 && (
        <div style={{ padding: '10px 18px', borderTop: '1px solid #f5ede6', textAlign: 'center', background: 'linear-gradient(to top, #fffaf7, #fff)' }}>
          <button onClick={onClose} style={{ fontSize: '11px', color: '#b07d62', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Georgia', serif", fontWeight: '600' }}>Close</button>
        </div>
      )}
    </div>
  );
}

function NotificationBell({ notifications, unreadCount, markRead, markAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler); // ✅ FIX: added touchstart for mobile
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={() => setOpen(v => !v)} title="Notifications" className="bell-btn icon-btn"
        style={{ background: open ? 'rgba(176,125,98,.1)' : 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '8px', color: 'inherit', transition: 'background 0.2s' }}
      >
        <span className="material-symbols-outlined bell-icon text-[22px]">{unreadCount > 0 ? 'notifications_active' : 'notifications'}</span>
        {unreadCount > 0 && <Badge count={unreadCount} />}
      </button>
      {open && <NotificationDropdown notifications={notifications} unreadCount={unreadCount} markRead={markRead} markAllRead={markAllRead} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ── Mobile drawer notification sub-panel ──────────────────────────────────────
function DrawerNotifPanel({ notifications, unreadCount, markRead, markAllRead, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20, background: '#faf7f4',
      display: 'flex', flexDirection: 'column',
      animation: 'notifPanelSlide 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 24px 16px', borderBottom: '1px solid rgba(176,125,98,.12)',
        background: 'linear-gradient(to bottom, #fffaf7, #faf7f4)',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', marginLeft: '-6px', borderRadius: '8px', color: '#b07d62', transition: 'background 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(176,125,98,.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.03em', flex: 1 }}>Notifications</span>
        {unreadCount > 0 && (
          <span style={{ background: '#b07d62', color: '#fff', borderRadius: '999px', fontSize: '10px', fontWeight: '700', padding: '2px 8px', lineHeight: '16px' }}>{unreadCount}</span>
        )}
      </div>

      {unreadCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px', borderBottom: '1px solid rgba(176,125,98,.07)', background: 'rgba(176,125,98,.02)' }}>
          <button onClick={markAllRead} style={{ fontSize: '11px', color: '#b07d62', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontFamily: "'Georgia', serif" }}>Mark all as read</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>🔔</div>
            <p style={{ color: '#bbb', fontSize: '13px', margin: 0, fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em' }}>You're all caught up.</p>
          </div>
        ) : notifications.map((n, i) => (
          <div key={n.id} onClick={() => markRead(n.id)} style={{
            display: 'flex', alignItems: 'flex-start', gap: '13px', padding: '14px 24px', cursor: 'pointer',
            borderBottom: '1px solid rgba(176,125,98,.07)',
            background: n.is_read ? 'transparent' : 'rgba(176,125,98,.04)',
            transition: 'background 0.18s', animation: `notifRowIn 0.28s ${i * 0.05}s both`,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(176,125,98,.09)'}
            onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(176,125,98,.04)'}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: TYPE_COLOR[n.type] ?? '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginTop: '1px' }}>{TYPE_ICON[n.type] ?? '🔔'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12.5px', fontWeight: n.is_read ? '400' : '700', margin: 0, color: '#1a1a1a', fontFamily: "'Georgia', serif", lineHeight: 1.35 }}>{n.title}</p>
              <p style={{ fontSize: '11.5px', color: '#999', margin: '3px 0 0', fontFamily: "'Georgia', serif", lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.body}</p>
              <p style={{ fontSize: '10px', color: '#c0b4aa', margin: '5px 0 0', fontFamily: "'Georgia', serif" }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {!n.is_read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#b07d62', flexShrink: 0, marginTop: '7px' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────────
export function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) { setUser(decoded); }
      else { localStorage.removeItem('token'); setUser(null); }
    } else { setUser(null); }
  }, [location.pathname]);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(!!user);

  // ✅ FIX 1: Close drawer + notif panel on every route change
  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) setNotifOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedCart = parseInt(sessionStorage.getItem('cartCount') || '0');
    const savedFav = parseInt(sessionStorage.getItem('favCount') || '0');
    if (savedCart > 0) setCartCount(savedCart);
    if (savedFav > 0) setFavCount(savedFav);
    const handler = (e) => {
      if (e.detail?.cart !== undefined) { setCartCount(e.detail.cart); sessionStorage.setItem('cartCount', e.detail.cart); }
      if (e.detail?.fav !== undefined) { setFavCount(e.detail.fav); sessionStorage.setItem('favCount', e.detail.fav); }
    };
    window.addEventListener('aroom:counts', handler);
    return () => window.removeEventListener('aroom:counts', handler);
  }, []);

  // ✅ FIX 2: iOS Safari scroll lock — saves scroll position before locking so page doesn't jump
  useEffect(() => {
    const chatbot = document.getElementById('roomie-widget') || document.querySelector('[class*="roomie"], [id*="roomie"]');
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      if (chatbot) chatbot.style.visibility = 'hidden';
    } else {
      const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);   // restore exact scroll position
      if (chatbot) chatbot.style.visibility = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout(); setUser(null); setCartCount(0); setFavCount(0);
    sessionStorage.removeItem('cartCount'); sessionStorage.removeItem('favCount');
    navigate('/');
  };

  const navLinks = [
    { to: '/furniture', label: 'Shop' },
    { to: '/aboutus', label: 'How It Works' },
    { to: '/journal', label: 'Journal' },
    { to: '/contactus', label: 'Contact' },
    { to: '/faq', label: 'FAQ' },
  ];

  const drawerIconLinks = [
    { to: '/search', label: 'Search', icon: <span className="material-symbols-outlined text-[18px]">search</span> },
    { to: '/favorite', label: 'Favourites', icon: <span className="material-symbols-outlined text-[18px]">favorite</span>, count: favCount },
    { to: '/cart', label: 'Cart', icon: <span className="material-symbols-outlined text-[18px]">shopping_bag</span>, count: cartCount },
  ];

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <header
        style={{ animation: mounted ? 'headerReveal 0.6s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}
        className={`fixed top-0 left-0 right-0 z-[201] transition-all duration-500 ${scrolled ? 'bg-white/92 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #b07d62, transparent)', opacity: scrolled ? 1 : 0, transition: 'opacity 0.4s' }} />

        <div className={`transition-all duration-500 ${scrolled ? 'py-3.5' : 'py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">

              <Link
                to="/"
                style={{
                  fontFamily: "'Cinzel Decorative', cursive",
                  transition: 'letter-spacing 0.3s, color 0.3s',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 10,
                }}
                className="text-2xl font-bold text-primary hover:text-accent2 transition-colors duration-300 select-none"
                onMouseEnter={e => e.currentTarget.style.letterSpacing = '0.04em'}
                onMouseLeave={e => e.currentTarget.style.letterSpacing = ''}
              >ARoom</Link>

              <nav className="hidden lg:flex items-center gap-10">
                {navLinks.map((link, i) => (
                  <Link key={link.to} to={link.to}
                    className={`nav-link-animated text-[0.8125rem] uppercase tracking-[0.1em] font-semibold transition-colors duration-300 ${location.pathname === link.to ? 'text-primary active' : 'text-muted hover:text-primary'}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >{link.label}</Link>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-5">
                <Link to="/search" title="Search" className={`icon-btn transition-colors duration-300 ${location.pathname === '/search' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">search</span>
                </Link>
                <Link to="/favorite" title="Favorites" style={{ position: 'relative', display: 'inline-flex' }} className={`icon-btn transition-colors duration-300 ${location.pathname === '/favorite' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">favorite</span>
                  <Badge count={favCount} />
                </Link>
                <Link to="/cart" title="Cart" style={{ position: 'relative', display: 'inline-flex' }} className={`icon-btn transition-colors duration-300 ${location.pathname === '/cart' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  <Badge count={cartCount} />
                </Link>
                {user && <NotificationBell notifications={notifications} unreadCount={unreadCount} markRead={markRead} markAllRead={markAllRead} />}
                {user ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-blush/60">
                    <Link to="/profile" className="text-[0.8125rem] font-medium text-primary hover:text-accent2 transition-colors duration-300"
                      onMouseEnter={e => e.currentTarget.style.letterSpacing = '0.02em'}
                      onMouseLeave={e => e.currentTarget.style.letterSpacing = ''}
                    >{user.sub || user.username || 'Profile'}</Link>
                    <button onClick={handleLogout} className="text-[0.8125rem] text-muted hover:text-primary transition-colors duration-300">Logout</button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-pill btn-pill-black text-[0.75rem] py-2.5 px-6 ml-4"
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >Sign in</Link>
                )}
              </div>

              <div className="flex lg:hidden items-center gap-3">
                {/* notification badge shortcut — taps open the drawer directly on the notif panel */}
                {user && (
                  <button
                    onClick={() => { setMenuOpen(true); setTimeout(() => setNotifOpen(true), 50); }}
                    title="Notifications"
                    style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '8px', color: 'inherit' }}
                    className="icon-btn text-muted hover:text-primary transition-colors duration-300"
                  >
                    <span className="material-symbols-outlined text-[20px]">{unreadCount > 0 ? 'notifications_active' : 'notifications'}</span>
                    <Badge count={unreadCount} small />
                  </button>
                )}
                <button
                  className="icon-btn text-primary hover:text-accent2 transition-colors duration-300"
                  onClick={() => setMenuOpen(v => !v)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ transition: 'transform 0.3s', transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    {menuOpen ? 'close' : 'menu'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div onClick={() => setMenuOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 199,
        background: 'rgba(30,22,18,.5)', backdropFilter: 'blur(4px)',
        transition: 'opacity .35s ease', opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
      }} />

      {/* ✅ FIX 3: Drawer — responsive width + overflow hidden (required for DrawerNotifPanel absolute positioning) */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(310px, 88vw)',   // ← responsive: never wider than 88% of the viewport
        zIndex: 200,
        transform: menuOpen ? 'translateX(0)' : 'translateX(105%)',
        transition: 'transform .42s cubic-bezier(.16,1,.3,1)',
        display: 'flex', flexDirection: 'column', background: '#faf7f4',
        boxShadow: menuOpen ? '-12px 0 60px rgba(0,0,0,.14)' : 'none',
        overflow: 'hidden',   // ← clips DrawerNotifPanel correctly
        // ✅ FIX 4: position is already 'fixed' so inset: 0 on child panel works automatically
      }} className="lg:hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: "'Cinzel Decorative', cursive", textDecoration: 'none' }}
            className="text-sm font-bold text-primary"
          >ARoom</Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* close handled by header hamburger toggle */}
          </div>
        </div>

        <div className="h-px bg-blush/40 mx-6" />

        {/* Quick icons */}
        <div className="flex items-center justify-around px-6 py-4">
          {drawerIconLinks.map(({ to, label, icon, count }, i) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${location.pathname === to ? 'text-accent2' : 'text-muted hover:text-primary'}`}
            >
              <span style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: '50%',
                background: location.pathname === to ? 'rgba(176,125,98,.12)' : 'rgba(0,0,0,.04)',
                transition: 'background 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {icon}
                <Badge count={count} small />
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[0.62rem] uppercase tracking-[0.12em]">{label}</span>
            </Link>
          ))}
        </div>

        <div className="h-px bg-blush/40 mx-6" />

        {/* Nav links */}
        <nav className="flex flex-col px-6 pt-2 flex-1 overflow-y-auto">
          {navLinks.map((link, i) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className={`font-serif text-[17px] tracking-wide py-3.5 flex items-center justify-between transition-colors duration-200 ${i < navLinks.length - 1 ? 'border-b border-blush/20' : ''} ${location.pathname === link.to ? 'text-accent2' : 'text-primary hover:text-accent2'}`}
            >
              {link.label}
              <span className="material-symbols-outlined text-[13px] opacity-30">arrow_forward_ios</span>
            </Link>
          ))}
          <div className="pt-5 mt-2 border-t border-blush/20">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-serif text-sm py-3 border-b border-blush/20 text-primary hover:text-accent2 transition-colors">
                  <span className="material-symbols-outlined text-[16px] opacity-50">person</span>
                  {user.sub || user.username || 'Profile'}
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-2 font-serif text-sm py-3 text-muted hover:text-primary transition-colors w-full text-left">
                  <span className="material-symbols-outlined text-[16px] opacity-50">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-pill btn-pill-black w-full text-center text-xs py-2.5 block">Sign in</Link>
            )}
          </div>
        </nav>

        {/* Socials */}
        <div className="px-6 py-5 border-t border-blush/30">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-muted mb-3">Follow us</p>
          <div className="flex items-center gap-4">
            {[
              { href: 'https://instagram.com', label: 'Instagram', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg> },
              { href: 'https://facebook.com', label: 'Facebook', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
              { href: 'https://twitter.com', label: 'X', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
              { href: 'https://pinterest.com', label: 'Pinterest', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.37 3.09-5.17 0-2.14-1.44-3.74-4.05-3.74-2.95 0-4.78 2.2-4.78 4.64 0 .84.25 1.44.64 1.89.18.21.2.29.14.54-.05.17-.15.59-.2.75-.07.25-.28.34-.51.25-1.39-.57-2.03-2.1-2.03-3.83 0-2.84 2.39-6.24 7.14-6.24 3.81 0 6.32 2.76 6.32 5.72 0 3.91-2.17 6.84-5.36 6.84-1.07 0-2.08-.58-2.43-1.23l-.68 2.61c-.25.95-.93 2.14-1.38 2.86.84.26 1.73.4 2.65.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg> },
            ].map(({ href, label, svg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="text-muted hover:text-primary transition-colors"
                style={{ transition: 'color 0.2s, transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >{svg}</a>
            ))}
          </div>
        </div>

        {/* Notification sub-panel — slides over the whole drawer */}
        {user && notifOpen && (
          <DrawerNotifPanel
            notifications={notifications}
            unreadCount={unreadCount}
            markRead={markRead}
            markAllRead={markAllRead}
            onClose={() => setNotifOpen(false)}
          />
        )}
      </div>
    </>
  );
}
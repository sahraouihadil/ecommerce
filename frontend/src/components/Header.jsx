import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ count }) {
  if (!count || count < 1) return null;
  return (
    <span style={{
      position: 'absolute',
      top: '-6px',
      right: '-7px',
      minWidth: '17px',
      height: '17px',
      borderRadius: '999px',
      background: '#b07d62',
      color: '#fff',
      fontSize: '10px',
      fontWeight: '700',
      lineHeight: '17px',
      textAlign: 'center',
      padding: '0 4px',
      pointerEvents: 'none',
      boxShadow: '0 1px 4px rgba(0,0,0,.18)',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Counts ────────────────────────────────────────────────────────────────
  // Le Header écoute un event global "aroom:counts".
  // Dans ton CartContext, ajoute cette ligne dans le useEffect qui modifie cartItems :
  //   window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { cart: cartItems.length } }))
  //
  // Dans ton FavoritesContext, pareil :
  //   window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { fav: favorites.length } }))
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.cart !== undefined) setCartCount(e.detail.cart);
      if (e.detail?.fav !== undefined) setFavCount(e.detail.fav);
    };
    window.addEventListener('aroom:counts', handler);
    return () => window.removeEventListener('aroom:counts', handler);
  }, []);

  // ── Body lock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const chatbot = document.getElementById('roomie-widget') ||
      document.querySelector('[class*="roomie"], [id*="roomie"]');
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      if (chatbot) chatbot.style.visibility = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (chatbot) chatbot.style.visibility = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { to: '/furniture', label: 'Shop' },
    { to: '/aboutus', label: 'How It Works' },
    { to: '/journal', label: 'Journal' },
    { to: '/contactus', label: 'Contact' },
  ];

  const drawerIconLinks = [
    { to: '/search', label: 'Search', icon: <span className="material-symbols-outlined text-[18px]">search</span> },
    { to: '/favorite', label: 'Favourites', icon: <span className="material-symbols-outlined text-[18px]">favorite</span>, count: favCount },
    { to: '/cart', label: 'Cart', icon: <span className="material-symbols-outlined text-[18px]">shopping_bag</span>, count: cartCount },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)]'
            : 'bg-transparent'
          }`}
      >
        <div className={`transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">

              {/* Logo */}
              <Link
                to="/"
                style={{ fontFamily: "'Cinzel Decorative', cursive" }}
                className="text-2xl font-bold text-primary hover:text-accent2 transition-colors duration-300 select-none"
              >
                ARoom
              </Link>

              {/* Center nav — desktop */}
              <nav className="hidden lg:flex items-center gap-10">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to}
                    className={`text-[0.8125rem] uppercase tracking-[0.1em] font-semibold transition-colors duration-300 ${location.pathname === link.to ? 'text-primary' : 'text-muted hover:text-primary'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right icons — desktop */}
              <div className="hidden lg:flex items-center gap-5">

                <Link to="/search" title="Search"
                  className={`transition-colors duration-300 ${location.pathname === '/search' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">search</span>
                </Link>

                {/* Favorites — desktop */}
                <Link to="/favorite" title="Favorites"
                  style={{ position: 'relative', display: 'inline-flex' }}
                  className={`transition-colors duration-300 ${location.pathname === '/favorite' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">favorite</span>
                  <Badge count={favCount} />
                </Link>

                {/* Cart — desktop */}
                <Link to="/cart" title="Cart"
                  style={{ position: 'relative', display: 'inline-flex' }}
                  className={`transition-colors duration-300 ${location.pathname === '/cart' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  <Badge count={cartCount} />
                </Link>

                {user ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-blush/60">
                    <Link to="/profile"
                      className="text-[0.8125rem] font-medium text-primary hover:text-accent2 transition-colors duration-300">
                      {user.sub || user.username || 'Profile'}
                    </Link>
                    <button onClick={handleLogout}
                      className="text-[0.8125rem] text-muted hover:text-primary transition-colors duration-300">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-pill btn-pill-black text-[0.75rem] py-2.5 px-6 ml-4">
                    Sign in
                  </Link>
                )}
              </div>

              {/* Mobile right */}
              <div className="flex lg:hidden items-center gap-4">

                {/* Favorites — mobile */}
                <Link to="/favorite" title="Favorites"
                  style={{ position: 'relative', display: 'inline-flex' }}
                  className="text-muted hover:text-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  <Badge count={favCount} />
                </Link>

                {/* Cart — mobile */}
                <Link to="/cart" title="Cart"
                  style={{ position: 'relative', display: 'inline-flex' }}
                  className="text-muted hover:text-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <Badge count={cartCount} />
                </Link>

                <button
                  className="text-primary hover:text-accent2 transition-colors duration-300"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <span className="material-symbols-outlined text-[22px]">menu</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer overlay ────────────────────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 199,
          background: 'rgba(30,22,18,.45)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity .35s ease',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      />

      {/* ── Mobile drawer panel ──────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '300px', zIndex: 200,
          transform: menuOpen ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
          display: 'flex', flexDirection: 'column',
          background: '#faf7f4',
          boxShadow: menuOpen ? '-8px 0 48px rgba(0,0,0,.12)' : 'none',
        }}
        className="lg:hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <span style={{ fontFamily: "'Cinzel Decorative', cursive" }} className="text-sm font-bold text-primary">
            ARoom
          </span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu"
            style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.05)', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined text-[17px] text-primary">close</span>
          </button>
        </div>

        <div className="h-px bg-blush/40 mx-6" />

        {/* Quick-access icons */}
        <div className="flex items-center justify-around px-6 py-4">
          {drawerIconLinks.map(({ to, label, icon, count }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${location.pathname === to ? 'text-accent2' : 'text-muted hover:text-primary'
                }`}
            >
              <span style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: '50%',
                background: location.pathname === to ? 'rgba(176,125,98,.12)' : 'rgba(0,0,0,.04)',
              }}>
                {icon}
                <Badge count={count} />
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-[0.62rem] uppercase tracking-[0.12em]">
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div className="h-px bg-blush/40 mx-6" />

        {/* Nav links */}
        <nav className="flex flex-col px-6 pt-4 flex-1">
          {navLinks.map((link, i) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className={`font-serif text-[17px] tracking-wide py-3.5 flex items-center justify-between transition-colors duration-200 ${i < navLinks.length - 1 ? 'border-b border-blush/20' : ''
                } ${location.pathname === link.to ? 'text-accent2' : 'text-primary hover:text-accent2'}`}
            >
              {link.label}
              <span className="material-symbols-outlined text-[13px] opacity-30">arrow_forward_ios</span>
            </Link>
          ))}

          <div className="pt-5 mt-2 border-t border-blush/20">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-serif text-sm py-3 border-b border-blush/20 text-primary hover:text-accent2 transition-colors">
                  <span className="material-symbols-outlined text-[16px] opacity-50">person</span>
                  {user.sub || user.username || 'Profile'}
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 font-serif text-sm py-3 text-muted hover:text-primary transition-colors w-full text-left">
                  <span className="material-symbols-outlined text-[16px] opacity-50">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="btn-pill btn-pill-black w-full text-center text-xs py-2.5 block">
                Sign in
              </Link>
            )}
          </div>
        </nav>

        {/* Socials */}
        <div className="px-6 py-5 border-t border-blush/30">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-muted mb-3">Follow us</p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="text-muted hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-muted hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.37 3.09-5.17 0-2.14-1.44-3.74-4.05-3.74-2.95 0-4.78 2.2-4.78 4.64 0 .84.25 1.44.64 1.89.18.21.2.29.14.54-.05.17-.15.59-.2.75-.07.25-.28.34-.51.25-1.39-.57-2.03-2.1-2.03-3.83 0-2.84 2.39-6.24 7.14-6.24 3.81 0 6.32 2.76 6.32 5.72 0 3.91-2.17 6.84-5.36 6.84-1.07 0-2.08-.58-2.43-1.23l-.68 2.61c-.25.95-.93 2.14-1.38 2.86.84.26 1.73.4 2.65.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
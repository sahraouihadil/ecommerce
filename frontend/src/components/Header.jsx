import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }

  const navLinks = [
    { to: '/furniture', label: 'Shop' },
    { to: '/aboutus', label: 'How It Works' },
    { to: '/contactus', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
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
                className="font-serif text-2xl font-bold text-primary hover:text-accent2 transition-colors duration-300 select-none"
              >
                ARoom
              </Link>

              {/* Center nav - desktop */}
              <nav className="hidden lg:flex items-center gap-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-[0.8125rem] uppercase tracking-[0.1em] font-semibold transition-colors duration-300 ${
                      location.pathname === link.to
                        ? 'text-primary'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right icons - desktop */}
              <div className="hidden lg:flex items-center gap-5">
                <Link
                  to="/favorite"
                  title="Favorites"
                  className="text-muted hover:text-primary transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-[22px]">favorite</span>
                </Link>

                <Link
                  to="/cart"
                  title="Cart"
                  className="text-muted hover:text-primary transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                </Link>

                {user ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-blush/60">
                    <Link
                      to="/profile"
                      className="text-[0.8125rem] font-medium text-primary hover:text-accent2 transition-colors duration-300"
                    >
                      {user.sub || user.username || 'Profile'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-[0.8125rem] text-muted hover:text-primary transition-colors duration-300"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn-pill btn-pill-black text-[0.75rem] py-2.5 px-6 ml-4"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* Mobile right side */}
              <div className="flex lg:hidden items-center gap-5">
                <Link
                  to="/favorite"
                  title="Favorites"
                  className="text-muted hover:text-primary transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-[22px]">favorite</span>
                </Link>
                <Link
                  to="/cart"
                  title="Cart"
                  className="text-muted hover:text-primary transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                </Link>

                <button
                  className="text-primary hover:text-accent2 transition-colors duration-300"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute inset-0 bg-cream flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <span className="font-serif text-2xl font-bold text-primary">
                ARoom
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-muted hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col justify-center px-6 gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`font-serif text-4xl font-bold transition-colors duration-300 ${
                    location.pathname === link.to
                      ? 'text-accent2'
                      : 'text-primary hover:text-accent2'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Footer auth */}
            <div className="p-6">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-primary hover:text-accent2 transition-colors"
                  >
                    {user.sub || user.username || 'Profile'}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="text-sm text-muted hover:text-primary transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-pill btn-pill-black w-full text-center"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Header.jsx - Site Navigation Header
 * =====================================
 * Displays the top navigation bar on all customer-facing pages.
 *
 * FEATURES:
 *   - Logo linking to home
 *   - Nav links: Collection, About, Contact
 *   - Cart and Favorites icons
 *   - If logged in: shows username + Profile link + Logout button
 *   - If NOT logged in: shows Login / Register links
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Decode JWT payload without a library (it's just base64)
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
  const navigate = useNavigate();
  const location = useLocation();

  // Re-check auth every time the route changes (e.g. after login)
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

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }

  const navLinks = [
    { to: '/furniture', label: 'Collection' },
    { to: '/aboutus',   label: 'About' },
    { to: '/contactus', label: 'Contact' },
  ];

  return (
    <header style={{
      backgroundColor: '#F5F0E8',
      borderBottom: '1px solid #E0D8CC',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '24px',
          fontWeight: '600',
          color: '#1C1C1A',
          textDecoration: 'none',
          letterSpacing: '0.05em',
        }}>
          ARoom
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: location.pathname === to ? '#8B6F47' : '#1C1C1A',
              textDecoration: 'none',
              fontWeight: location.pathname === to ? '600' : '400',
              transition: 'color 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Icons + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {/* Cart icon */}
          <Link to="/cart" title="Cart" style={{
            color: '#1C1C1A',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </Link>

          {/* Favorites icon */}
          <Link to="/favorite" title="Favorites" style={{
            color: '#1C1C1A',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </Link>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/profile" style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8B6F47',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                {user.sub || user.username || 'Profile'}
              </Link>
              <button onClick={handleLogout} style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#1C1C1A',
                background: 'none',
                border: '1px solid #1C1C1A',
                padding: '6px 14px',
                cursor: 'pointer',
              }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/login" style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#1C1C1A',
                textDecoration: 'none',
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#F5F0E8',
                backgroundColor: '#1C1C1A',
                padding: '8px 16px',
                textDecoration: 'none',
              }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

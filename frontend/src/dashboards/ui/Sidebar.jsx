import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { X } from "lucide-react";
import { logout } from "../../services/auth";

const ACCENT = "#4f8ef7";

export default function Sidebar({
  openBar,
  setOpenBar,
  links = [],
  title = "Dashboard",
  subtitle = "System Panel",
  role = "User"
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600) setOpenBar(true);
      else setOpenBar(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpenBar]);

  return (
    <>
      {openBar && (
        <aside
          style={{
            width: 240,
            minHeight: "100vh",
            backgroundColor: "white",
            borderRight: "1px solid #eef0f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 16px",
            position: "sticky",
            top: 0,
            boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
          }}
          className="fixed top-0 left-0 h-full z-50 min-[600px]:static"
        >
          {/* TOP */}
          <div>
            {/* LOGO */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 32,
                padding: "0 8px",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🧩
              </div>

              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  {title}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a8a9a" }}>
                  {subtitle}
                </p>
              </div>
            </div>

            {/* CLOSE BUTTON (mobile) */}
            <button
              onClick={() => setOpenBar(false)}
              className="min-[600px]:hidden"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            {/* LINKS */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {links.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? ACCENT : "#4a4a6a",
                    backgroundColor: isActive ? `${ACCENT}12` : "transparent",
                    transition: "all 0.15s",
                  })}
                >
                  {icon}
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* BOTTOM */}
          <div
            style={{
              backgroundColor: "#f8f9fc",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <img
                src="https://i.pravatar.cc/40"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                alt="User"
              />

              <div>
                <NavLink to="/profile" style={{ textDecoration: "none" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                    {role}
                  </p>
                </NavLink>
                <p style={{ margin: 0, fontSize: 11, color: "#8a8a9a" }}>
                  Active
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 8,
                border: `1px solid ${ACCENT}`,
                backgroundColor: "white",
                color: ACCENT,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = ACCENT;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = ACCENT;
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* OVERLAY */}
      {openBar && (
        <div
          onClick={() => setOpenBar(false)}
          className="fixed inset-0 bg-black/30 z-30 min-[600px]:hidden"
        />
      )}
    </>
  );
}
/**
 * Footer.jsx - Site Footer Placeholder
 * =======================================
 * Stub component for the site-wide footer.
 * Replace the contents below with your actual footer design
 * (links, copyright notice, social media icons, etc.)
 */
export function Footer() {
  return (
    <>
      {/* ── Footer ── */}
      <footer
        className="py-16 md:py-24 px-6 md:px-12"
        style={{ background: "#f6f3ee", fontFamily: "'Manrope', sans-serif", color: "#251828ff" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
          <div className="sm:col-span-2 md:col-span-1">
            <p
              className="text-2xl mb-6 md:mb-8"
              style={{ fontFamily: "'Noto Serif', serif", color: "#241828ff" }}
            >
              ARoom
            </p>
            <p className="text-sm max-w-[240px]" style={{ color: "#5b4c72ff", opacity: 0.7 }}>
              Curating the modern sanctuary through timeless craft and organic form.
            </p>
          </div>
          {[
            { heading: "Maison", links: ["About us", "Sustainability", "Heritage", "Journal"] },
            { heading: "Support", links: ["Contact us", "Shipping & Returns", "Privacy Policy", "Terms of Use"] },
          ].map(({ heading, links }) => (
            <div key={heading} className="flex flex-col space-y-4">
              <span
                className="text-[0.6875rem] uppercase tracking-widest font-bold mb-2"
                style={{ color: "#61316bff", opacity: 0.5 }}
              >
                {heading}
              </span>
              {links.map(l => (
                <a
                  key={l}
                  href="#"
                  className="text-sm hover:opacity-70 transition-colors"
                  style={{ color: "#806e8dff" }}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
          <div className="flex flex-col justify-between md:text-right">
            <div className="space-y-4">
              <span
                className="text-[0.6875rem] uppercase tracking-widest font-bold mb-2 block"
                style={{ color: "#211828ff", opacity: 0.5 }}
              >
                Follow
              </span>
              <div className="flex md:justify-end space-x-6 md:space-x-4">
                {["Instagram", "Pinterest"].map(s => (
                  <a
                    key={s}
                    href="#"
                    className="hover:opacity-50 transition-opacity italic"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <p
              className="text-[10px] uppercase tracking-tighter mt-12 md:mt-0"
              style={{ opacity: 0.4 }}
            >
              © {new Date().getFullYear()} ARoom . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
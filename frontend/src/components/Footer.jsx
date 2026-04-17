import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-cream pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-16">
          <div>
            <Link to="/" className="font-serif text-2xl font-bold text-charcoal">
              ARoom
            </Link>
            <p className="text-muted text-sm mt-3 max-w-xs leading-relaxed">
              AR-powered furniture shopping. Preview any piece in your real room before you buy, with AI styling help from Roomie.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {[
              { label: "Shop", to: "/furniture" },
              { label: "Journal", to: "/journal" },
              { label: "How It Works", to: "/aboutus" },
              { label: "Contact", to: "/contactus" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-muted text-sm hover:text-charcoal transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="h-px bg-blush mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} ARoom. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted text-xs hover:text-charcoal transition-colors duration-300">Privacy</a>
            <a href="#" className="text-muted text-xs hover:text-charcoal transition-colors duration-300">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

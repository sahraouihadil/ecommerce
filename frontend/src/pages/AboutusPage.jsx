import { useNavigate } from "react-router-dom";

export function AboutusPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-cream text-charcoal pb-32">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-36 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          <div>
            <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">How It Works</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold
              leading-[1.1] tracking-tight mb-8">
              Furniture Shopping,
              Reimagined with AR
            </h1>
            <p className="text-muted text-base leading-[1.9] max-w-lg">
              ARoom lets you see exactly how furniture looks in your real room before
              you buy it. Point your phone camera, place any piece, and know it's right.
              No guesswork, no returns.
            </p>
          </div>

          <div>
            <img
              alt="ARoom AR furniture preview"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2gyqcgzSNriw4OUPA4wGTTJu_8N6WAaOhqQ30c68zvKqKwzFWxQehIKWkPvPYmsvXi4Z8zCR4i_Asxe1G7tHcQ94uWB601zCHR2dwxnS5zNAxIjMtmla5Fl4SIh23MdRfBfQNoL06d7u7JTefmYMYp3EXTVum0IpsGDXrPS4ysP7vcRrY2OwhThlHWecLYVVHM1kjYi8V9aSZ8xU3My4ogsXdGiuXM011cgIVL-TtPWsFe_yIPiEQAFWS6jaePaTGWVSil9QaXNA"
              className="w-full h-[420px] object-cover rounded-3xl"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl font-bold leading-[1.15] mb-10">
          Try Before You Buy
        </h2>
        <div className="space-y-6 text-muted leading-[1.9] text-[15px]">
          <p>
            Traditional furniture shopping is broken. You see a photo online,
            guess the dimensions, hope the color works with your walls, and
            cross your fingers when it arrives. ARoom fixes that.
          </p>
          <p>
            With our AR preview, you place any piece of furniture directly
            into your room using your phone's camera. See how that sofa fits
            next to your bookshelf. Check if the lamp height works with
            your ceiling. Know before you buy.
          </p>
          <p>
            Need help deciding? Roomie, our AI styling assistant, can suggest
            pieces that match your existing decor, recommend color combinations,
            and help you build a room layout that works.
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <blockquote className="text-center">
          <p className="font-serif text-2xl md:text-3xl italic leading-[1.5] text-charcoal/80 mb-6">
            "See it in your space. Know it's right. Buy with confidence."
          </p>
          <cite className="text-muted text-sm not-italic">The ARoom Team</cite>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 text-center pt-16">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-5">
          Ready to try it?
        </h2>
        <p className="text-muted mb-10 max-w-md mx-auto leading-relaxed">
          Browse the catalog and preview any piece in your room with AR.
        </p>
        <button onClick={() => navigate('/furniture')} className="btn-pill btn-pill-black">
          Start Shopping
        </button>
      </section>
    </div>
  );
}

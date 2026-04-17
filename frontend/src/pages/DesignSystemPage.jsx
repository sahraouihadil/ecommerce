/**
 * DesignSystemPage — Renders every UI primitive in every variant
 *
 * Route: /design-system (must be added to App.jsx manually)
 */
import { Button, Card, CircularImage, Section, Divider } from '../components/ui';

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <Section maxWidth="5xl">

        {/* Header */}
        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Reference</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-charcoal mb-4">
          Design System
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed mb-16">
          Every primitive component used across ARoom, shown in each variant.
        </p>

        {/* ── COLORS ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-16">
          {[
            { name: 'Cream', token: 'bg-cream', hex: '#FAF6F2' },
            { name: 'Blush', token: 'bg-blush', hex: '#E8D5CC' },
            { name: 'Charcoal', token: 'bg-charcoal', hex: '#1A1A1A' },
            { name: 'Rose', token: 'bg-rose', hex: '#D4A99A' },
            { name: 'Surface', token: 'bg-surface', hex: '#F3EDE7' },
            { name: 'Muted', token: 'bg-muted', hex: '#8A8078' },
          ].map((c) => (
            <div key={c.name} className="text-center">
              <div className={`w-full aspect-square rounded-2xl ${c.token} border border-blush/30 mb-2`} />
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted">{c.hex}</p>
            </div>
          ))}
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── TYPOGRAPHY ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Typography</h2>
        <div className="space-y-6 mb-16">
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-1">Serif / Playfair Display</p>
            <h3 className="font-serif text-4xl font-bold tracking-tight">The art of timeless living</h3>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-1">Serif / All-Caps Tracked</p>
            <h3 className="font-serif text-xl font-bold uppercase tracking-[0.15em]">The Collection</h3>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-1">Sans / Inter - Body</p>
            <p className="text-base text-muted leading-relaxed max-w-lg">
              Each piece is hand-selected for character, craftsmanship, and the stories it carries.
              We believe your home should be a curated sanctuary, not a catalog of trends.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-1">Sans / Label</p>
            <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted">Section Label</p>
          </div>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── BUTTONS ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Button</h2>
        <div className="space-y-8 mb-16">
          {/* Variants */}
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">Variants</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="black">Black (default)</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="blush">Blush</Button>
            </div>
          </div>
          {/* Sizes */}
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">Sizes</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          {/* With icon */}
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">With Icon</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button className="gap-2">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                Add to Cart
              </Button>
              <Button variant="outline" className="gap-2">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Save
              </Button>
            </div>
          </div>
          {/* Disabled */}
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">Disabled</p>
            <Button disabled className="opacity-40 cursor-not-allowed">Disabled</Button>
          </div>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── CARD ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card variant="cream">
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-2">Cream (default)</p>
            <h3 className="font-serif text-xl font-bold mb-2">Elm Lounge Chair</h3>
            <p className="text-muted text-sm leading-relaxed">Hand-turned solid oak frame with woven Danish cord seat.</p>
          </Card>
          <Card variant="white">
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-2">White</p>
            <h3 className="font-serif text-xl font-bold mb-2">Brass Floor Lamp</h3>
            <p className="text-muted text-sm leading-relaxed">Patinated brass with linen shade. Adjustable height.</p>
          </Card>
          <Card variant="surface">
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-2">Surface</p>
            <h3 className="font-serif text-xl font-bold mb-2">Walnut Side Table</h3>
            <p className="text-muted text-sm leading-relaxed">Live-edge walnut top on blackened steel hairpin legs.</p>
          </Card>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── CIRCULAR IMAGE ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">CircularImage</h2>
        <div className="flex flex-wrap gap-8 items-end mb-8">
          <div className="text-center">
            <CircularImage size="sm" />
            <p className="text-xs text-muted mt-2">sm (48px)</p>
          </div>
          <div className="text-center">
            <CircularImage size="md" />
            <p className="text-xs text-muted mt-2">md (80px)</p>
          </div>
          <div className="text-center">
            <CircularImage size="lg" />
            <p className="text-xs text-muted mt-2">lg (120px)</p>
          </div>
          <div className="text-center">
            <CircularImage size="xl" />
            <p className="text-xs text-muted mt-2">xl (180px)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 items-center mb-16">
          <div className="text-center">
            <CircularImage
              size="lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVfrvbRRQIUNPpLjfF8-420RxORkmtRI22XCeDt_SN-l0OjcoJBTJSu-XCF83LaVvq4aeVQQjk-c4JIX8LL8K819-cnBWRf8U90Th9i_8YGCrSYGJ3nIM7Ll5VPI3z2pdmT0fMpDwxo9GO7HIiiva9umMzSeg1pC2nd4SIckUdB0xtbFGTdHFRYAJVquq1qiXggY71bQcfjrJTBOkVjH1waJdV_1MMc4zC2Woi5WvgIyW603ZX-326-3AXdCBEv-6V0oiQdvkpsnQ"
              alt="Cloud Lounger"
            />
            <p className="text-xs text-muted mt-2">With image</p>
          </div>
          <div className="text-center">
            <CircularImage
              size="lg"
              ring
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVfrvbRRQIUNPpLjfF8-420RxORkmtRI22XCeDt_SN-l0OjcoJBTJSu-XCF83LaVvq4aeVQQjk-c4JIX8LL8K819-cnBWRf8U90Th9i_8YGCrSYGJ3nIM7Ll5VPI3z2pdmT0fMpDwxo9GO7HIiiva9umMzSeg1pC2nd4SIckUdB0xtbFGTdHFRYAJVquq1qiXggY71bQcfjrJTBOkVjH1waJdV_1MMc4zC2Woi5WvgIyW603ZX-326-3AXdCBEv-6V0oiQdvkpsnQ"
              alt="Cloud Lounger (ring)"
            />
            <p className="text-xs text-muted mt-2">With ring</p>
          </div>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── SECTION ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Section</h2>
        <p className="text-muted text-sm mb-6 max-w-lg leading-relaxed">
          Section wraps content with consistent padding and max-width. Sizes: sm, md, lg. Max-widths: 3xl, 5xl, 7xl, full.
          This entire page is wrapped in a Section(maxWidth="5xl").
        </p>
        <div className="bg-surface rounded-2xl p-6 mb-16">
          <div className="space-y-3">
            {['sm', 'md', 'lg'].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted w-8">{s}</span>
                <div className="flex-1 bg-blush/50 rounded-full h-3" />
              </div>
            ))}
          </div>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── DIVIDER ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Divider</h2>
        <div className="space-y-8 mb-16">
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">Line (default)</p>
            <Divider />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.1em] mb-4">Diamond</p>
            <Divider variant="diamond" />
          </div>
        </div>

        <Divider variant="diamond" className="mb-16" />

        {/* ── COMBINED EXAMPLE ── */}
        <h2 className="font-serif text-2xl font-bold mb-6">Combined Example</h2>
        <Card variant="white" className="max-w-sm mx-auto text-center">
          <CircularImage
            size="xl"
            className="mx-auto mb-6"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV_a7Hf-uTNJwz0UIUMytXliCvPYmUDpcNg1YZWOZrtpVS1t-i42pphJV8bjX60zj_i8Y3V0X4WTWewRIgOfRb0hTOzisnTT4jEvE4s--TcIYM15GzR1HcDkMMoVUFHJZYphEpo_C5cHdPeAjwkn2rCcblMncZyUb07iQy2gsamx0PmSs6jPThX2GYwDkX4CAh7-FKD0LQjEQXGpU-1Qv2oK5OcGXm8PeWT7H46tGK8s7trFU7zBXEhC_ZC65YoHmlkYQc5qPYGzc"
            alt="Mushroom Side Table"
            ring
          />
          <span className="inline-block bg-charcoal text-cream text-xs font-semibold uppercase tracking-[0.1em] px-4 py-1.5 rounded-full -mt-10 relative z-10 mb-4">
            $410
          </span>
          <h3 className="font-serif text-xl font-bold mb-2">Mushroom Side Table</h3>
          <p className="text-muted text-sm leading-relaxed mb-6">Hand-carved organic geometry</p>
          <Button variant="black" className="w-full gap-2">
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            Add to Cart
          </Button>
        </Card>

      </Section>
    </div>
  );
}

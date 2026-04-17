export function JournalPage() {
  const posts = [
    {
      id: 1,
      title: "How AR is Changing Furniture Shopping",
      excerpt: "Discover how augmented reality lets you see furniture in your room before buying, reducing returns and increasing satisfaction.",
      date: "2026-04-01",
    },
    {
      id: 2,
      title: "How AR Is Changing Furniture Returns",
      excerpt: "When you can see exactly how a piece fits in your room before buying, return rates drop dramatically.",
      date: "2026-03-15",
    },
    {
      id: 3,
      title: "Designing Your Perfect Living Room",
      excerpt: "Tips and guidance from our curators on creating a cohesive, comfortable living space with character.",
      date: "2026-03-01",
    },
  ];

  return (
    <div className="min-h-screen bg-cream text-text">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Stories</p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary tracking-tight mb-5">
          Journal
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed mb-20">
          Reflections on design, craftsmanship, and the art of creating spaces that tell your story.
        </p>

        <div className="space-y-0">
          {posts.map((post, idx) => (
            <article key={post.id}
              className="py-12 border-b border-surface group cursor-pointer">

              <p className="text-xs text-muted mb-4">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <h2 className="font-serif text-3xl font-bold leading-[1.2] mb-4
                group-hover:text-accent2 transition-colors duration-300">
                {post.title}
              </h2>

              <p className="text-muted leading-[1.8] text-[15px] mb-5 max-w-2xl">{post.excerpt}</p>

              <span className="text-primary text-sm font-semibold hover:text-accent2 transition-colors duration-300">
                Read more &rarr;
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

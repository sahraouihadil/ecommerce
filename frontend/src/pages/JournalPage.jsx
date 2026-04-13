/**
 * JournalPage.jsx - Blog / Journal Page
 * ========================================
 * Displays blog posts about furniture, AR technology, and design trends.
 * Currently uses hardcoded posts — in the future, these could come from a CMS or API.
 */

export function JournalPage() {
  // Static blog post data (title, excerpt, date)
  const posts = [
    {
      id: 1,
      title: "How AR is Changing Furniture Shopping",
      excerpt: "Discover how augmented reality lets you see furniture in your room before buying, reducing returns and increasing satisfaction.",
      date: "2026-04-01",
    },
    {
      id: 2,
      title: "Top 5 Furniture Trends for 2026",
      excerpt: "From biophilic design to curved silhouettes, explore the trends shaping modern interiors this year.",
      date: "2026-03-15",
    },
    {
      id: 3,
      title: "Designing Your Perfect Living Room",
      excerpt: "Tips and tricks from our design team on creating a cohesive, comfortable living space.",
      date: "2026-03-01",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Journal</h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-1">{new Date(post.date).toLocaleDateString()}</p>
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

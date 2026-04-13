/**
 * AboutusPage.jsx - About Us Page
 * ==================================
 * Static page that tells visitors about ARoom:
 *   - Company mission and vision
 *   - What we offer (AR previews, AI chatbot, etc.)
 *   - Team information
 */

export function AboutusPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About ARoom</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <p className="text-gray-700 leading-relaxed">
          ARoom is an innovative AR-powered furniture platform that lets you visualize luxury furniture
          in your own space before purchasing. Founded by a team of designers and technologists,
          we believe that buying furniture should be an immersive, delightful experience.
        </p>

        <h2 className="text-xl font-semibold mt-6">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          To bridge the gap between online shopping and the tactile experience of a showroom.
          Using augmented reality and AI-powered recommendations, we help you find the perfect
          piece for your space with confidence.
        </p>

        <h2 className="text-xl font-semibold mt-6">What We Offer</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>3D product previews with AR support</li>
          <li>AI-powered furniture recommendations via Roomie, our chatbot</li>
          <li>Curated luxury furniture collections</li>
          <li>Secure checkout and delivery tracking</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Our Team</h2>
        <p className="text-gray-700 leading-relaxed">
          We are a team of 3 passionate developers building the future of furniture shopping
          from Algiers, Algeria.
        </p>
      </div>
    </div>
  );
}

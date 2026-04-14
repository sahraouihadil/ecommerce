import { useState } from "react";

export function ContactusPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-[#f7f6f8] text-[#2d2f30] font-['Be_Vietnam_Pro'] min-h-screen">

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-20">

        {/* ── HERO ── */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-12">

            <div className="flex-1 space-y-6">
              <span className="text-[#6f5900] font-bold tracking-widest text-sm uppercase bg-[#fed01b]/30 px-6 py-2 rounded-full">
                SAY HELLO
              </span>

              <h1 className="text-5xl md:text-7xl font-extrabold text-[#6448b2] leading-tight tracking-tighter">
                Get in Touch
              </h1>

              <p className="text-[#5b5b5d] text-xl max-w-xl leading-relaxed">
                Have a question about a weird lamp? Need help finding the perfect floating chair?
                Our team is here to help you curate your playground.
              </p>
            </div>

            <div className="flex-1 relative">
              <div className="w-full h-[400px] bg-[#ab8ffe]/20 rounded-xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxrIFeuPu5VtD8f0pKcLtLYjBJwxkXq4Ts_3KU9SM2uFzYrR8Lud50nwOtYB-9gJU6e_sVOJ5VexNkCCbnHH6U_o5Hav7Rw0IKDNLIdaBJV9dKe2bIkGtcB_fWUM3U1G_06GCZAlqnTYmeOPCiPbutzkxjy4QOa77dHAag6uBdsmXuvby9GZrohZ7OENkSl3WSorr6ptDgwH9w82KGPQVwh2mYSyCfDxJNORXJ7NX3TyVIQCogquwn6KN98-WRQn1AbUNaqB8fm0w"
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white/60 backdrop-blur-xl p-6 rounded-lg shadow-xl max-w-[200px] -rotate-3">
                <p className="text-[#6448b2] font-bold italic">
                  "Let's find something weird together."
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">

          {/* FORM */}
          <div className="md:col-span-7 bg-white p-10 rounded-xl shadow">

            <h2 className="text-3xl font-bold mb-8">Send a Message</h2>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-800 font-semibold text-lg">
                  Thank you for your message!
                </p>
                <p className="text-gray-500 mt-2">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                  <input
                    type="text"
                    placeholder="Dreamer's Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-[#f1f0f3] focus:ring-2 focus:ring-[#6448b2] outline-none"
                    required
                  />

                  <input
                    type="email"
                    placeholder="you@wonderland.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-[#f1f0f3] focus:ring-2 focus:ring-[#6448b2] outline-none"
                    required
                  />

                </div>

                <textarea
                  placeholder="Tell us about your space..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 rounded-xl bg-[#f1f0f3] focus:ring-2 focus:ring-[#6448b2] outline-none"
                  required
                />

                <button
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-[#6448b2] text-white font-bold rounded-full hover:bg-[#583ba5] transition shadow-lg"
                >
                  Send Magic Link
                </button>

              </form>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="md:col-span-5 flex flex-col gap-6">

            {/* ✅ ROOMIE CARD (UI ONLY) */}
            <div className="bg-[#fed01b] p-8 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">

              <div>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined text-[#6f5900] text-3xl">
                    robot_2
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-[#594700] mb-2">
                  Chat with Roomie AI
                </h3>

                <p className="text-[#645000]">
                  Instant answers from our quirky assistant. Roomie never sleeps.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-8 font-bold text-[#594700]">
                <span>Wake up Roomie</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>

            </div>

            {/* CONTACT CARDS */}
            <div className="grid grid-cols-2 gap-6">

              <div className="bg-[#f1f0f3] p-6 rounded-xl">
                <p className="font-bold">Magic Mail</p>
                <p className="text-sm text-gray-500">hello@aroomx.weird</p>
              </div>

              <div className="bg-[#f1f0f3] p-6 rounded-xl">
                <p className="font-bold">Secret HQ</p>
                <p className="text-sm text-gray-500">Algiers, Algeria</p>
              </div>

            </div>

          </div>

        </div>

        {/* FAQ */}
        <section className="mb-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Common Riddles</h2>

          <div className="flex flex-wrap justify-center gap-4">
            {["Shipping Portals", "Furniture Returns", "Bulk Curations", "The Roomie Club"].map((item) => (
              <button
                key={item}
                className="px-6 py-3 bg-white rounded-full hover:bg-[#6448b2] hover:text-white transition shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default ContactusPage;
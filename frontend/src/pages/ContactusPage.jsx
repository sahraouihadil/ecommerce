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
    <div className="bg-cream text-text min-h-screen">
      <main className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Get in touch</p>
        <h1 className="font-serif text-5xl font-bold tracking-tight mb-5">
          Contact
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed mb-16">
          Have a question about AR preview, delivery, or styling? Our team is here to help.
        </p>

        {sent ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-success mb-4 block">check_circle</span>
            <p className="text-success font-serif font-bold text-2xl mb-3">Thank you!</p>
            <p className="text-muted text-sm">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mb-24">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                    text-sm focus:outline-none focus:border-primary transition-colors"
                  required />
              </div>
              <div>
                <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                    text-sm focus:outline-none focus:border-primary transition-colors"
                  required />
              </div>
            </div>
            <div>
              <label className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold block mb-2">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
                className="w-full px-4 py-4 bg-surface/50 border-b border-muted/20 rounded-t-lg
                  text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                required />
            </div>
            <button type="submit" className="btn-pill btn-pill-black">
              Send Message
            </button>
          </form>
        )}

        {/* Contact Info */}
        <div className="border-t border-surface pt-12 grid md:grid-cols-3 gap-8">
          <div>
            <span className="material-symbols-outlined text-[24px] text-accent2 mb-3 block">mail</span>
            <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-1">Email</p>
            <p className="text-sm">hello@aroom.com</p>
          </div>
          <div>
            <span className="material-symbols-outlined text-[24px] text-accent2 mb-3 block">location_on</span>
            <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-1">Location</p>
            <p className="text-sm">Algiers, Algeria</p>
          </div>
          <div>
            <span className="material-symbols-outlined text-[24px] text-accent2 mb-3 block">schedule</span>
            <p className="text-[0.6875rem] text-muted uppercase tracking-[0.1em] font-semibold mb-1">Hours</p>
            <p className="text-sm">Mon - Fri, 9am - 6pm</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactusPage;

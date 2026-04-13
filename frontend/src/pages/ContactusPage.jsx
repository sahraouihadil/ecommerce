/**
 * ContactusPage.jsx - Contact Us Page
 * ======================================
 * Shows a contact form + company contact details.
 *   - Form fields: name, email, message
 *   - On submit: shows a "Thank you" confirmation (currently frontend-only)
 *   - Contact cards: email, phone, address
 *
 * TODO: Connect the form to a backend endpoint to actually send messages.
 */

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-semibold text-lg">Thank you for your message!</p>
          <p className="text-gray-500 mt-2">We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
          <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
          <textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
          <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
            Send Message
          </button>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="font-semibold">Email</p>
          <p className="text-gray-500 text-sm">support@aroom.com</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="font-semibold">Phone</p>
          <p className="text-gray-500 text-sm">+213 555 123 456</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="font-semibold">Address</p>
          <p className="text-gray-500 text-sm">Algiers, Algeria</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatWidget.jsx - Roomie AI Chatbot Widget
 * ============================================
 * This file contains TWO components:
 *
 *   1. RoomieLamp  - The animated mascot (a Pixar-style desk lamp with eyes)
 *   2. ChatWidget  - The actual chat panel where users talk to the AI
 *
 * HOW IT WORKS:
 *   - The lamp mascot sits in the bottom-right corner of every customer page
 *   - Clicking the lamp opens/closes the chat panel
 *   - User types a message -> POST /api/chat -> Groq AI (LLaMA) responds
 *   - The AI (Roomie) knows about all products and helps users find furniture
 *
 * MASCOT FEATURES:
 *   - Eyes follow the mouse cursor in real-time
 *   - Random blinking every 2-5 seconds
 *   - Jump animation when clicked
 *   - Wave animation + greeting bubble after 2 seconds
 *   - Subtle idle breathing animation
 *
 * CHAT FEATURES:
 *   - Quick-reply suggestion chips for common questions
 *   - Typing indicator (bouncing dots) while AI is thinking
 *   - Full conversation history sent to AI for context
 *   - 3 shopping contexts: before_ar, during_ar, after_ar
 *
 * USED IN: App.jsx (via CustomerChat component, hidden on dashboard pages)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatWidget.css';

// ── Roomie Lamp Mascot ──────────────────────────────────
// A Pixar-Luxo-style desk lamp with eyes that follow the cursor.
// Pastel-colored, fun and friendly. Sits above the chat panel.
function RoomieLamp({ isOpen, onToggle }) {
  const lampRef = useRef(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Show greeting bubble + wave after 2 seconds, only if chat is closed
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowGreeting(true);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Track mouse movement for eye follow
  const handleMouseMove = useCallback((e) => {
    if (!lampRef.current) return;
    const rect = lampRef.current.getBoundingClientRect();
    const lampCenterX = rect.left + rect.width / 2;
    const lampCenterY = rect.top + rect.height * 0.3;
    const dx = e.clientX - lampCenterX;
    const dy = e.clientY - lampCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxOffset = 3;
    const factor = Math.min(maxOffset / (dist * 0.01 + 1), maxOffset);
    setEyeOffset({
      x: (dx / (dist || 1)) * factor,
      y: (dy / (dist || 1)) * factor,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Random blink every 2-5 seconds
  useEffect(() => {
    function scheduleBlink() {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        timerRef = scheduleBlink();
      }, delay);
    }
    let timerRef = scheduleBlink();
    return () => clearTimeout(timerRef);
  }, []);

  // Jump animation on click
  function handleClick() {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
    onToggle();
  }

  const eyeScaleY = isBlinking ? 0.1 : 1;

  return (
    <div
      ref={lampRef}
      className={`roomie-lamp-wrapper ${isJumping ? 'roomie-jump' : ''} ${isWaving ? 'roomie-wave' : ''}`}
      onClick={handleClick}
    >
      {showGreeting && !isOpen && (
        <div className="roomie-greeting">
          Hi! I'm Roomie 👋
        </div>
      )}
      <svg
        viewBox="0 0 120 140"
        width="90"
        height="105"
        className="roomie-lamp-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ground glow — blush */}
          <radialGradient id="lampGlow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#E8D5CC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8D5CC" stopOpacity="0" />
          </radialGradient>
          {/* Head gradient — blush */}
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0DDD6" />
            <stop offset="100%" stopColor="#E8D5CC" />
          </linearGradient>
          {/* Base gradient — rose */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A99A" />
            <stop offset="100%" stopColor="#B8887A" />
          </linearGradient>
          {/* Joint accent — rose */}
          <linearGradient id="jointGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A99A" />
            <stop offset="100%" stopColor="#B8887A" />
          </linearGradient>
        </defs>

        {/* Light glow on the ground */}
        <ellipse cx="60" cy="130" rx="30" ry="6" fill="url(#lampGlow)" className="roomie-glow" />

        {/* Base — rose */}
        <ellipse cx="60" cy="128" rx="22" ry="6" fill="url(#bodyGrad)" stroke="#B8887A" strokeWidth="1" />
        <ellipse cx="60" cy="126" rx="18" ry="4" fill="#E8D5CC" />

        {/* Lower arm — charcoal skeleton */}
        <line x1="60" y1="122" x2="52" y2="85" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
        {/* Joint — rose */}
        <circle cx="52" cy="85" r="4.5" fill="url(#jointGrad)" stroke="#1A1A1A" strokeWidth="1" />
        {/* Upper arm — charcoal skeleton */}
        <line x1="52" y1="85" x2="62" y2="48" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
        {/* Neck joint — rose */}
        <circle cx="62" cy="48" r="3.5" fill="url(#jointGrad)" stroke="#1A1A1A" strokeWidth="0.8" />

        {/* Lamp head (shade) — blush */}
        <path
          d="M 38 50 Q 40 30, 60 28 Q 80 30, 82 50 L 75 55 L 45 55 Z"
          fill="url(#headGrad)"
          stroke="#D4A99A"
          strokeWidth="1.2"
        />
        {/* Inner shade rim — cream accent */}
        <path d="M 45 55 L 75 55" stroke="#FAF6F2" strokeWidth="2" strokeLinecap="round" />

        {/* Face area (inside the shade opening) */}
        <ellipse cx="60" cy="49" rx="13" ry="7" fill="#FAF6F2" opacity="0.95" />

        {/* Cheek blush — rose */}
        <ellipse cx="46" cy="51" rx="3.5" ry="2" fill="#D4A99A" opacity="0.5" />
        <ellipse cx="74" cy="51" rx="3.5" ry="2" fill="#D4A99A" opacity="0.5" />

        {/* Eyes */}
        <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
          {/* Left eye */}
          <ellipse cx="53" cy="48" rx="4.5" ry={4.5 * eyeScaleY} fill="white" stroke="#1A1A1A" strokeWidth="0.8" />
          <circle cx={53 + eyeOffset.x * 0.5} cy={48 + eyeOffset.y * 0.3} r="2.2" fill="#1A1A1A" />
          <circle cx={52 + eyeOffset.x * 0.3} cy={47 + eyeOffset.y * 0.2} r="0.9" fill="white" />

          {/* Right eye */}
          <ellipse cx="67" cy="48" rx="4.5" ry={4.5 * eyeScaleY} fill="white" stroke="#1A1A1A" strokeWidth="0.8" />
          <circle cx={67 + eyeOffset.x * 0.5} cy={48 + eyeOffset.y * 0.3} r="2.2" fill="#1A1A1A" />
          <circle cx={66 + eyeOffset.x * 0.3} cy={47 + eyeOffset.y * 0.2} r="0.9" fill="white" />
        </g>

        {/* Light beam from under the head — blush */}
        <path
          d="M 48 56 L 38 72 L 82 72 L 72 56"
          fill="#E8D5CC"
          opacity="0.12"
        />
      </svg>

      {/* Shadow on the ground */}
      <div className="roomie-shadow"></div>
    </div>
  );
}

// ── Chat Widget ─────────────────────────────────────────
// The chat panel that appears when the user clicks the Roomie lamp.
//
// PROPS:
//   apiUrl      - Backend endpoint for chat (default: localhost:8000/api/chat)
//   chatContext  - Shopping context sent to AI: "before_ar", "during_ar", "after_ar"
//   productName  - Name of the product being viewed (sent to AI for context)
function ChatWidget({ apiUrl = "http://localhost:8000/api/chat", chatContext = "before_ar", productName = "" }) {
  const [isOpen, setIsOpen] = useState(false);         // Is the chat panel open?
  const [messages, setMessages] = useState([            // Conversation history
    { role: 'bot', text: "Hi! I'm Roomie, your ARoomX assistant. Looking for furniture? I can help you find the perfect piece." }
  ]);
  const [input, setInput] = useState('');               // Current text in the input field
  const [isLoading, setIsLoading] = useState(false);    // Is the AI currently thinking?
  const [showSuggestions, setShowSuggestions] = useState(true);  // Show quick-reply chips?
  const bottomRef = useRef(null);                       // Ref to auto-scroll to newest message

  // Quick-reply suggestion chips shown before the user types anything
  const suggestions = [
    'Help me find a sofa',
    'Bedroom furniture',
    'I have a small budget',
    'Show me something modern',
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send a quick reply chip as the user's message
  function handleSuggestionClick(text) {
    setShowSuggestions(false);
    setInput(text);
    sendMessage(text);
  }

  // Send message to backend and get AI reply
  function handleSend() {
    if (!input.trim() || isLoading) return;
    setShowSuggestions(false);
    sendMessage(input.trim());
  }

  // Core send logic — posts message to backend and appends the reply
  // Flow: add user msg to UI -> send to API -> add bot reply to UI
  async function sendMessage(userMsg) {
    // 1. Immediately show the user's message in the chat
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);  // Show typing indicator

    // 2. Build conversation history for the AI (so it remembers context)
    const history = messages.map((m) => ({ role: m.role, content: m.text }));

    try {
      // 3. Send to backend: POST /api/chat
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: chatContext, product_name: productName, history }),
      });
      const data = await res.json();
      // 4. Add the AI's reply to the conversation
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, I couldn't connect. Please try again." }]);
    }
    setIsLoading(false);
  }

  // Handle Enter key press
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <>
      {/* Roomie lamp mascot replaces the plain toggle button */}
      <RoomieLamp isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

      <div className={`chat-panel ${isOpen ? '' : 'closed'}`}>
        <div className="chat-header">
          <span>Roomie</span>
          <button className="chat-close" onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>{msg.text}</div>
          ))}
          {showSuggestions && (
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="chip" onClick={() => handleSuggestionClick(s)}>{s}</button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about our products..."
          />
          <button onClick={handleSend}>&#10148;</button>
        </div>
      </div>
    </>
  );
}

export default ChatWidget;

<div align="center">

# ARoom
### Luxury Furniture E-Commerce Platform

*A full-stack platform for discovering, visualizing, and purchasing premium furniture — with immersive 3D & AR experiences.*

---

![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Mobile-Expo_SDK_54-000020?style=flat-square&logo=expo)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)

</div>

---

## 👥 Team

This project was developed as part of an academic software engineering project.

| Name | Role |
|------|------|
| **Merahi Ikram** | Full-Stack Developer |
| **Sahraoui Hadil** | Full-Stack Developer |
| **Ferdi Oum Keltoum** | Full-Stack Developer |

> 🎓 **Under the supervision of:** Dr. Manel Djnouhat

---

## 📌 Overview

**ARoom** is a complete e-commerce solution for a luxury furniture brand. It features a customer-facing web and mobile application, a powerful multi-role staff dashboard, real-time order tracking, AI-powered chat support, and immersive 3D/AR product visualization.

---

## 📂 Project Structure

```
ecommerce/
├── backend/          # REST API — Python & FastAPI
├── frontend/         # Web Application — React 19 & Vite
└── mobile-fixed/     # Mobile Application — React Native & Expo
```

---

## ✨ Key Features

### 🛍️ Customer Experience
- Product browsing with category filtering and keyword search
- High-resolution image gallery per product
- **3D product viewer** and **Augmented Reality (AR)** visualization
- Shopping cart, wishlist (favorites), and streamlined checkout
- Real-time order tracking with delivery timeline
- Loyalty points system with tier progression
- Product reviews and ratings
- Newsletter subscription

### 📦 Stock Manager
- Full product catalog management (create, edit, archive)
- Inventory and stock-level control
- Delivery assignment and management
- Returns and issue tracking
- AR/3D model uploads per product

### 📣 Marketing Manager
- Campaign creation and scheduling
- Blog post management
- Newsletter design and dispatch
- Customer engagement analytics

### 🚚 Delivery Personnel
- Daily orders dashboard
- Delivery schedule management
- Delivery history and performance tracking

### 🔧 System Administration
- User and role management
- Staff account validation pipeline
- Complaints and support ticket handling
- Platform configuration panel
- Financial reports and accounting overview

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL |
| **Frontend** | React 19, Vite, React Router v6, Chart.js, Three.js |
| **Mobile** | React Native 0.81, Expo SDK 54, Expo Router |
| **Authentication** | JWT — OAuth2 Password Flow |
| **File Storage** | Local static file serving (`/static`, `/uploads`) |
| **AI Assistant** | Groq API (LLM-powered chatbot) |
| **Email** | SMTP — account verification & notifications |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Expo Go (mobile app) — available on Google Play / App Store

---

### 1️⃣ Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Generate RSA keys (first time only)
python generate_keys.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

📖 Interactive API documentation: `http://localhost:8000/docs`

---

### 2️⃣ Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

🌐 Application runs at: `http://localhost:5173`

---

### 3️⃣ Mobile Application

```bash
cd mobile-fixed
npm install --legacy-peer-deps
```

Create a `.env` file in the `mobile-fixed/` directory:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

> **Note:** Replace `YOUR_LOCAL_IP` with your machine's local IP address.
> On Windows, run `ipconfig` and look for the **IPv4 Address**.
> Make sure your phone and computer are on the **same network**.

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** on your Android or iOS device.

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=postgresql://user:password@localhost/aroom
GROQ_API_KEY=your_groq_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

### Mobile — `mobile-fixed/.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

---

## 👤 User Roles & Access

| Role | Description |
|------|-------------|
| `customer` | Shop, cart, orders, favorites, profile, reviews |
| `deliveryman` | Delivery dashboard, schedule, order detail, history |
| `stock_manager` | Product catalog, inventory, deliveries, returns |
| `marketing_manager` | Campaigns, blog posts, newsletters, analytics |
| `accountant` | Financial reports and account overview |
| `admin` | Full platform access and configuration |

---

## 📱 Mobile Application — Screen Map

**Authentication**
- Login · Register · Email Verification · Set Password · Forgot Password

**Customer**
- Home · Shop · Product Detail · Cart · Checkout · Orders · Order Tracking · Favorites · Search · Profile

**Delivery**
- Dashboard · Schedule · Order Detail · Delivery History · Profile

---

## 🌐 Web Application — Page Map

**Public**
- Home · About Us · Contact · FAQ

**Customer**
- Product Listing · Product Detail (3D/AR) · Cart · Checkout · Profile · Order History

**Staff Dashboards**
- Admin · Stock Manager · Marketing Manager · Delivery · Accountant

---

## 🔍 Current State & Honest Assessment

### ✅ What Works End-to-End

- **Authentication** — Registration with email verification, JWT login/logout, role-based route guards
- **Product Catalog** — Listing, search, detail pages, color variants
- **3D Viewer** — Model rotation, zoom, color swatches, auto-rotate
- **AR Mode** — Android AR via Scene Viewer, WebXR fallback, real-world scale
- **Cart & Checkout** — Add/update/remove items, full checkout flow
- **Order Tracking** — Order history, delivery status
- **Favorites** — Toggle, favorites page
- **AI Chatbot (Roomie)** — Groq-powered, catalog-aware, context-sensitive
- **5 Staff Dashboards** — Admin, Stock Manager, Marketing Manager, Accountant, Delivery

### ⚠️ Known Limitations

- Only one `.glb` model (`sofa.glb`) — all products share the same 3D model
- No `.usdz` files for iOS AR
- API base URL hardcoded in several frontend files
- No automated tests
- Payment is a stub — no real money flow

---

## 🔮 Future Work

- AI-generated 3D models from product photos (Meshy, Luma AI)
- Voice-driven chatbot (Web Speech API + Whisper)
- Real-time multi-user AR with shared spatial anchors
- Algerian payment integration (Chargily Pay — CIB & Edahabia)
- Multi-language support (Arabic, French, English with RTL)
- Production deployment with Docker + CI/CD
- Vector search over the catalog (pgvector + embeddings)
- Native mobile apps with ARKit / ARCore integration

---

## 📄 License

This project is academic and proprietary. All rights reserved © 2026 ARoom Team.

---

<div align="center">

*Crafted with precision and passion by the ARoom team*
*Under the supervision of **Dr. Manel Djnouhat***

</div>

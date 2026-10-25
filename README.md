# Yashi General Store (YGS) — E-Commerce Web Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A complete, responsive, full-stack e-commerce web platform built for **Yashi General Store (YGS)**. It features customer OTP mobile verification, dual-role access (Customer & Admin), interactive GPS distance calculation with a **strict 5 km delivery limit**, minimum order value of **₹100**, categorized catalog with 40+ products, local photo upload for Admin, and real-time order tracking.

---

## 🌟 Key Features

### 1. Dual Role & Secure Authentication
- **Customer Mobile OTP Verification**:
  - Sign in or checkout with any valid 10-digit mobile number.
  - Generates instant verification code (simulated test OTP with 1-click copy/auto-fill for fast testing).
  - Collects customer Name, Phone, Delivery Address, and GPS Pin.
- **Store Admin Dashboard**:
  - Secure credential login (`admin` / `admin123`) with JWT session token.
  - Comprehensive management suite: Delivery Requests, Inventory Catalog, Local Photo Upload, and Shop GPS Settings.

### 2. Strict 5 km Delivery Zone Restriction
- **Store Policy**: Deliveries are strictly limited to within 5 km of Yashi General Store.
- **Interactive Geolocation & Haversine Distance Engine**:
  - One-tap GPS location detection using browser Geolocation API.
  - Interactive Leaflet map with Shop Marker, 5km Delivery Circle, and Draggable Customer Pin.
  - Real-time calculation: Customers beyond 5 km are prevented from placing orders with a clear notification banner.

### 3. Minimum Order Value: ₹100
- Cart and checkout automatically validate that the order subtotal meets the minimum order requirement of **₹100**.
- Shows progress toward the ₹100 threshold and blocks submission on both frontend and backend API if below ₹100.

### 4. Categorized Catalog & Admin Local Photo Upload
- **Clean Category Sections**:
  - 🥛 **Dairy Products** (Fresh Milk, Paneer, Curd, Butter, Cheese, Chaas from Amul, Namaste India)
  - 🍦 **Ice Cream** (Amul Vanilla, Chocolate Fudge, Butterscotch, Kulfi, Namaste India Cones)
  - 🥦 **Vegetables** (Tomatoes, Potatoes, Onions, Spinach, Cauliflower, Carrots, Chillies)
  - 🌾 **Grocery** (Atta, Basmati Rice, Toor Dal, Sunflower Oil, CTC Tea, Salt, Sugar)
  - 📚 **Stationery** (Classmate Notebooks, Ballpoint Pens, Geometry Box, Highlighter Set)
  - 🧼 **General Store** (Detergents, Soaps, Toothpaste, Dishwash Gel)
- **Local Photo Upload**: Admin can browse files directly from their local computer/phone to upload actual product photos.

### 5. Order Management & Live Tracking
- Customer can track order status anytime with their mobile number.
- Admin status workflow: `Pending` ➔ `Accepted` ➔ `Packing` ➔ `Out for Delivery` ➔ `Delivered`.
- 1-click customer contact via Phone (`tel:`) or WhatsApp (`wa.me`) and direct navigation via Google Maps.

---

## 📁 Project Structure

```
General Store/
├── client/                     # Frontend React (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, CartDrawer, CheckoutModal, LocationPicker, ProductCard...
│   │   ├── pages/              # AdminDashboard.jsx
│   │   ├── api.js              # Centralized API service (relative /api base)
│   │   ├── App.jsx             # Main Store catalog & routing
│   │   └── main.jsx
│   ├── dist/                   # Production build assets
│   └── package.json
├── server/                     # Backend Node.js / Express REST API
│   ├── src/
│   │   ├── routes/             # auth.js, products.js, orders.js, settings.js, upload.js
│   │   └── server.js           # Express server & static asset serving
│   ├── uploads/                # Local photos uploaded by admin
│   ├── data.json               # Atomic JSON database
│   └── package.json
├── package.json                # Root orchestration scripts
├── render.yaml                 # Render cloud deployment config
└── .gitignore                  # Git ignore rules
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- Git

### 1. Install Dependencies
```bash
# Install both server and client dependencies
npm run install:all
```

### 2. Build Frontend & Start Server
```bash
# Build React client bundle
npm run build

# Start Express server (serves API on :5000 and the built frontend)
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🌐 Deploying Live to the Cloud (Render / Railway)

### Option A: Render (Free Tier)
1. Push this project to your GitHub account (see Git instructions below).
2. Go to [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository `yashi-general-store`.
4. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Click **Create Web Service**. Your store will be live with a free SSL HTTPS link!

### Option B: Instant Public Tunnel (for Quick Live Testing)
You can expose the running local server to the internet right away:
```bash
npx localtunnel --port 5000
```
This generates a live public HTTPS URL accessible from any mobile or desktop.

---

## 🐙 Git Setup & Pushing to GitHub

```bash
# Initialize git (already completed)
git init
git branch -M main

# Commit changes
git add .
git commit -m "Initial release of Yashi General Store (YGS)"

# Connect to your GitHub repository:
git remote add origin https://github.com/<your-username>/yashi-general-store.git
git push -u origin main
```

---

## 🔑 Default Credentials
- **Admin Portal**: Click "Admin Portal" in navigation
- **Admin Username**: `admin`
- **Admin Password**: `admin123`
- **Customer Sign-in**: Any 10-digit mobile number (e.g. `9876543210`) with the auto-generated test OTP.

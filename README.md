# REVIBE '26 🕷️

Official Website for **REVIBE '26**, a **National Level Symposium** organized by the **Student Guidance Cell (SGC), C. Abdul Hakeem College of Engineering & Technology (CAHCET)**.

---

## 🕷️ Theme

The official theme of **REVIBE '26** is **SPIDER-MAN**. The website follows a Spider-Man inspired visual identity while maintaining a professional symposium experience, and is built as a **multi-page interactive experience** with Spider-Man/web-inspired navigation and page transitions.

Fully responsive across Desktop, Laptop, Tablet, and Mobile.

---

## 🚀 Website Features

* Modern Spider-Man themed landing page
* Technical & Non-Technical events with details/rules
* Separate event detail pages
* Individual & team registration
* Event-specific registration fees
* UPI / GPay payment flow with status tracking
* Registration confirmation with unique registration number
* Venue & location info, FAQ, announcements
* Spider-Man/web-inspired page transitions
* Protected login portal (Admin / Coordinator / Sub-Coordinator dashboards)
* Event-wise participant & payment management

---

## 🛠️ Technology Stack

React · Vite · JavaScript/JSX · Tailwind CSS · Framer Motion · React Router DOM · Supabase · PostgreSQL · Vercel

---

## 📄 Website Pages

```text
/
├── Home
├── /events
│   └── /events/:slug → Event Details
├── /about
├── /faq
├── /location
├── /login
├── /register
└── /confirmation/:registrationNumber
```

* **Home** – landing page with navigation, login & registration access
* **Events** – lists technical & non-technical events
* **Event Details** – rules, fee, and info for a single event
* **About** – REVIBE '26 & SGC info
* **FAQ** – symposium & registration questions
* **Location** – venue info
* **Login** – access to the protected portal
* **Register** – event registration flow
* **Confirmation** – shows registration confirmation & details

---

## 📝 Registration System

Registration supports participant details (college, department, academic year), individual or team registration, event selection with event-specific fee, UPI/GPay payment, payment & registration status tracking, and a unique registration number on confirmation.

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

**7 core tables**, 13 events, 59 verified columns, RLS enabled on all tables, with foreign keys and indexes in place.

| Table | Purpose | Columns |
|---|---|---|
| `events` | Event info (name, category, fee, status, date, venue, capacity) | 13 |
| `participants` | Participant identity & academic/college info | 9 |
| `registrations` | Registration number, type, team name, status | 10 |
| `registration_members` | Links participants to team registrations | 5 |
| `payments` | Amount, status, transaction ref, method, verification | 11 |
| `profiles` | Portal users & access roles | 6 |
| `event_staff` | Links coordinators/sub-coordinators to events | 5 |

**Relationships:** `events → registrations → participants / registration_members → participants`; `registrations → payments`; `events → event_staff → profiles`.

---

## 🔐 Portal & Access Control

Three access levels:

* **Admin** (4 accounts) – full access to all 13 events: dashboards, participants, registrations, teams, payments.
* **Coordinator / Sub-Coordinator** – one of each per event, restricted to their assigned event's participants, registrations, teams, and payment status.

Roles are stored in `profiles`; assignments are managed via `event_staff`. Row Level Security (RLS) is enabled on all 7 core tables, enforcing access by role and assigned event.

---

## 📁 Project Structure

```text
revibe-2026/
├── public/
├── src/
│   ├── assets/{icons,images,logos}/
│   ├── components/{layout,navigation,ui}/
│   ├── data/{eventData.js, faqData.js, teamData.js}
│   ├── pages/{Home,Events,EventDetails,About,FAQ,Location,Login,Register,Confirmation}.jsx
│   ├── services/{registrationService.js, supabase.js}
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # build for production
```

Environment variables for external services are stored in `.env`.

---

## 🚀 Deployment

The website will be deployed using **Vercel**.

---

## 👥 Website Team

**Student Guidance Cell (SGC)**, C. Abdul Hakeem College of Engineering & Technology

Aasif · Asjad · Zahangir · Yasar · Zainab Sayeeda · Rila Fathima · Saad

---

**REVIBE '26 — With Great Power Comes Great Responsibility. 🕷️**
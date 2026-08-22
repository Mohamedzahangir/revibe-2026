import { Link } from "react-router-dom";

import logoWhite from "../assets/logos/logo-white.png";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Events", to: "/events" },
  { label: "FAQ", to: "/faq" },
  { label: "Location", to: "/location" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

// TODO: replace with confirmed real values before launch.
const contactDetails = [
  { key: "email", label: "To be announced", href: null },
  { key: "phone", label: "To be announced", href: null },
  { key: "venue", label: "CAHCET", href: "/location" },
];

// TODO: replace href="#" with confirmed social URLs before launch.
const connectLinks = [
  { key: "website", label: "Website", href: "#" },
  { key: "instagram", label: "Instagram", href: "#" },
  { key: "linkedin", label: "LinkedIn", href: "#" },
  { key: "github", label: "GitHub", href: "#" },
];

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 6.5 12 13l8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A17 17 0 0 1 4.99 5.1 1.5 1.5 0 0 1 6.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.6 2.3 4 5.2 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.2-4-8.5s1.4-6.2 4-8.5Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10v6.5M7.5 7.6v.01M11.5 16.5V10M11.5 12.6c0-1.4 1-2.6 2.4-2.6 1.5 0 2.1 1 2.1 2.7v3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.56c.43.08.58-.19.58-.42v-1.63c-2.36.51-2.86-1.14-2.86-1.14-.39-.98-.94-1.24-.94-1.24-.77-.53.06-.52.06-.52.85.06 1.3.87 1.3.87.75 1.29 1.98.92 2.46.7.08-.55.3-.92.54-1.13-1.88-.21-3.86-.94-3.86-4.19 0-.93.33-1.68.87-2.28-.09-.21-.38-1.07.08-2.24 0 0 .71-.23 2.34.87a8.1 8.1 0 0 1 4.26 0c1.63-1.1 2.34-.87 2.34-.87.46 1.17.17 2.03.08 2.24.54.6.87 1.35.87 2.28 0 3.26-1.99 3.97-3.88 4.18.31.27.58.79.58 1.6v2.37c0 .23.15.5.59.42A8.5 8.5 0 0 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const connectIcons = {
  website: IconGlobe,
  instagram: IconInstagram,
  linkedin: IconLinkedin,
  github: IconGithub,
};

export default function Footer() {
  return (
    <>
      <footer className="sgc-footer">
        <div className="sgc-footer-inner">
          <div className="sgc-footer-grid">
            <div className="sgc-footer-section sgc-footer-brand">
              <div className="sgc-footer-brand-row">
                <img
                  src={logoWhite}
                  alt="Student Guidance Cell logo"
                  className="sgc-footer-logo"
                />

                <div className="sgc-footer-brand-copy">
                  <span className="sgc-footer-brand-name">SGC</span>
                  <span className="sgc-footer-brand-title">
                    Student Guidance Cell
                  </span>
                </div>
              </div>

              <p className="sgc-footer-event">REVIBE '26</p>
              <p className="sgc-footer-description">
                REVIBE '26 is a National Level Symposium organized by the Student
                Guidance Cell (SGC), C. Abdul Hakeem College of Engineering &amp;
                Technology, bringing together technical and non-technical events
                for students to explore, compete, and connect.
              </p>
            </div>

            <div className="sgc-footer-section">
              <h3 className="sgc-footer-title">Quick Links</h3>
              <ul className="sgc-footer-links">
                {quickLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sgc-footer-section sgc-footer-contact-connect">
              <div className="sgc-footer-block">
                <h3 className="sgc-footer-title">Contact</h3>
                <ul className="sgc-footer-contact-list">
                  {contactDetails.map((item) => (
                    <li key={item.key}>
                      <span className="sgc-footer-icon" aria-hidden="true">
                        {item.key === "email" && <IconMail />}
                        {item.key === "phone" && <IconPhone />}
                        {item.key === "venue" && <IconPin />}
                      </span>
                      {item.href ? (
                        <Link to={item.href}>{item.label}</Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sgc-footer-block">
                <h3 className="sgc-footer-title">Connect</h3>
                <div className="sgc-footer-social-row">
                  {connectLinks.map((item) => {
                    const Icon = connectIcons[item.key];
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        className="sgc-footer-social-link"
                        aria-label={item.label}
                      >
                        <span className="sgc-footer-social-icon">
                          <Icon />
                        </span>
                        <span className="sgc-footer-social-label">{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="sgc-footer-bottom">
            <p>© 2026 Student Guidance Cell (SGC). All Rights Reserved.</p>
            <p>Made with ❤️ by Student Guidance Cell.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .sgc-footer {
          position: relative;
          background: #050505;
          border-top: 1px solid rgba(220, 0, 0, 0.5);
          color: var(--white);
        }

        .sgc-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(220, 0, 0, 0.12), transparent 22%),
            linear-gradient(180deg, rgba(255,255,255,0.01), rgba(220,0,0,0.02));
          pointer-events: none;
        }

        .sgc-footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.25rem 1.5rem;
        }

        .sgc-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 0.8fr 1fr;
          gap: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(220, 0, 0, 0.4);
        }

        .sgc-footer-section {
          min-width: 0;
        }

        .sgc-footer-brand-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .sgc-footer-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 50%;
        }

        .sgc-footer-brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .sgc-footer-brand-name,
        .sgc-footer-title {
          font-family: 'Orbitron', sans-serif;
          color: var(--red);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .sgc-footer-brand-name {
          font-size: 1rem;
          font-weight: 800;
          color: var(--white);
        }

        .sgc-footer-brand-title {
          font-size: 0.85rem;
          color: var(--soft-white);
          text-transform: none;
          letter-spacing: normal;
          font-family: 'Rajdhani', sans-serif;
        }

        .sgc-footer-event {
          margin: 0 0 0.6rem;
          font-family: 'Bangers', cursive;
          font-size: clamp(1.6rem, 2vw, 2.2rem);
          letter-spacing: 0.08em;
          color: var(--white);
        }

        .sgc-footer-description {
          color: var(--soft-white);
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
          max-width: 420px;
        }

        .sgc-footer-title {
          margin: 0 0 1rem;
          font-size: 0.78rem;
        }

        .sgc-footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .sgc-footer-links a {
          color: var(--soft-white);
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-size: 0.95rem;
        }

        .sgc-footer-links a:hover,
        .sgc-footer-links a:focus-visible {
          color: var(--red);
        }

        .sgc-footer-contact-connect {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .sgc-footer-contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .sgc-footer-contact-list li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--soft-white);
          font-size: 0.92rem;
        }

        .sgc-footer-contact-list a {
          color: var(--soft-white);
          text-decoration: none;
        }

        .sgc-footer-contact-list a:hover,
        .sgc-footer-contact-list a:focus-visible {
          color: var(--red);
        }

        .sgc-footer-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: var(--red);
          flex-shrink: 0;
        }

        .sgc-footer-icon svg {
          width: 100%;
          height: 100%;
        }

        .sgc-footer-social-row {
          display: flex;
          gap: 0.75rem;
        }

        .sgc-footer-social-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: var(--soft-white);
          text-decoration: none;
        }

        .sgc-footer-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(220, 0, 0, 0.5);
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        }

        .sgc-footer-social-icon svg {
          width: 18px;
          height: 18px;
        }

        .sgc-footer-social-link:hover .sgc-footer-social-icon,
        .sgc-footer-social-link:focus-visible .sgc-footer-social-icon {
          border-color: rgba(220, 0, 0, 0.9);
          box-shadow: 0 0 14px var(--shadow);
          color: var(--red);
        }

        .sgc-footer-social-label {
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .sgc-footer-bottom {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1rem;
          color: var(--muted);
          font-size: 0.95rem;
        }

        .sgc-footer-bottom p {
          margin: 0;
        }

        @media (max-width: 900px) {
          .sgc-footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .sgc-footer-contact-connect {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 2rem;
          }
        }

        @media (max-width: 560px) {
          .sgc-footer-grid {
            grid-template-columns: 1fr;
          }

          .sgc-footer-contact-connect {
            flex-direction: column;
          }

          .sgc-footer-bottom {
            flex-direction: column;
          }

          .sgc-footer-description {
            max-width: none;
          }
        }
      `}</style>
    </>
  );
}
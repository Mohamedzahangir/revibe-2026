import imageTemplate from "../assets/Photos/image-template.png";

const coreTeam = [
  {
    name: "Mohammed Ayaz",
    role: "President",
    dept: "IV Year CSE",
    photo:
      "https://res.cloudinary.com/drgwlnf67/image/upload/v1782542238/WhatsApp_Image_2026-06-27_at_9.12.04_AM_vv5fls.jpg",
  },
  {
    name: "Kashif Ulhaq",
    role: "Vice President",
    dept: "IV Year CSE",
    photo:
      "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935202/Kashif_Ul_haq_hatop4.png",
  },
  {
    name: "Mohammed Melhan",
    role: "Vice President",
    dept: "IV Year AI-DS",
    photo:
      "https://res.cloudinary.com/drgwlnf67/image/upload/v1782659638/melhan_sedtgb.jpg",
  },
];

const teams = [
  {
    id: "web-architects",
    label: "Website Team",
    title: "Web Architects",
    blurb:
      "The builders behind the web, coding, structuring and shipping every page of the experience.",
    members: [
      { name: "Mohammed Aasif", dept: "IV Year CSE", role: "Administrator", lead: true, photo: "https://res.cloudinary.com/devn2ez7p/image/upload/v1782652275/prof_link_pic_3_2.jpg_w85kkn.jpg" },
      { name: "Mohammed Zahangir", dept: "III Year AI-DS", role: "Administrator", lead: true, photo: "https://res.cloudinary.com/drgwlnf67/image/upload/f_auto,q_auto/dcb3e81a-ec96-49ea-aad0-05ad796b053e_rifahc" },
      { name: "Abdul Gaffoor Asjad", dept: "IV Year CSE", photo: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1739474332/Abdul_Gaffoor_Asjad_d9uolc.jpg" },
      { name: "Mohammed Yasar M", dept: "III Year AI-DS", role: "Session Incharge", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/f_auto,q_auto/Screenshot_2026-03-31_163341_uwuv0c" },
      { name: "Rila Fathima S.K", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935200/Rila_Fathima_bmcgac.png" },
      { name: "A Muhammad Saad", dept: "II Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935198/A_Muhammad_Saad_dqvnob.jpg" },
      { name: "Zainab Sayeeda MK", dept: "II Year AI-DS", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935200/Sayeeda_qq0vv6.png" },
    ],
  },
  {
    id: "web-artists",
    label: "Design Team",
    title: "Web Artists",
    blurb:
      "The visual storytellers, shaping the look, feel and identity that makes the web come alive.",
    members: [
      { name: "Mudassir", dept: "IV Year AI-DS", lead: true, photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935182/Mohammed_Mudassir_y8mis1.jpg" },
      { name: "Pooja Sri M", dept: "III Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941461/Pooja_Sri_M_jr0hls.jpg" },
      { name: "Afra Naushine S", dept: "III Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941446/Afra_Naushine_zpxjoc.jpg" },
      { name: "Juvariya Anjum", dept: "II Year AI-DS", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941461/Juvariya_Anjum_zmyciw.jpg" },
      { name: "Shanmuga Priya. J", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935197/Shanmuga_Priya_viwfz7.png" },
      { name: "MONIKA A", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935193/Monika_tb1xkl.png" },
    ],
  },
  {
    id: "story-weavers",
    label: "Content Team",
    title: "Story Weavers",
    blurb:
      "The wordsmiths of the web, spinning the narrative thread that runs through every page.",
    members: [
      { name: "Shafifa Naaz", dept: "IV Year IT", lead: true, photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941459/Shaffu_Naaz_fpygq3.jpg" },
      { name: "Samiiksha C", dept: "III Year CSE", photo: "https://res.cloudinary.com/dnbifmfhl/image/upload/v1774977981/WhatsApp_Image_2026-03-31_at_10.45.05_PM_rzanjh.jpg" },
      { name: "Sanga Illakiya. S", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935199/Sanga_Ilakiya_mhftws.png" },
    ],
  },
  {
    id: "signal-squads",
    label: "Media Team",
    title: "Signal Squads",
    blurb:
      "The amplifiers of the web, carrying the signal of REVIBE '26 across every channel.",
    members: [
      { name: "Mohammed Abuzar", dept: "IV Year CSE", role: "Social Media Lead", lead: true, photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941459/Md_Abuzar_w1qi0d.jpg" },
      { name: "Mohammed Sufyaan", dept: "II Year IT" },
      { name: "S MOHAMMED SAAD", dept: "II Year AI-DS", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935208/S_MOHAMMED_SAAD_h03juj.png" },
      { name: "Mohammed Fahad Khan FM", dept: "II Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935189/Fahad_Khan_gtft9u.png" },
      { name: "Zainab Sayeeda MK", dept: "II Year AI-DS", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935200/Sayeeda_qq0vv6.png" },
      { name: "Mohammed Yasar M", dept: "III Year AI-DS", role: "Session Incharge", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/f_auto,q_auto/Screenshot_2026-03-31_163341_uwuv0c" },
    ],
  },
  {
    id: "rest-of-team",
    label: "The Wider Web",
    title: "Rest of the Team",
    blurb:
      "The wider web of SGC, the hands holding the rest of the strands together.",
    members: [
      { name: "Abishek", dept: "IV Year IT", role: "Session Incharge", photo: "/placeholder.svg?height=200&width=200" },
      { name: "Mohammed Abbas", dept: "IV Year CSE", role: "Session Incharge", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941467/Mohammed_Abbas_vpydox.jpg" },
      { name: "Swetha", dept: "IV Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935194/Swetha_edexd4.jpg" },
      { name: "Dhurga prasad S", dept: "IV Year EEE", photo: "https://res.cloudinary.com/douhcccb7/image/upload/v1739638236/WhatsApp_Image_2025-02-15_at_9.36.39_PM_uzlpgq.jpg" },
      { name: "Raja Rajeswari S", dept: "III Year AI-DS", role: "Advisor", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935189/Raja_Rajeshwari_ejr7v6.jpg" },
      { name: "Zakwan Haaziq K", dept: "III Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787941463/Zakwan_Haaziq_b6f5m5.jpg" },
      { name: "Affan Basha A", dept: "III Year IT", photo: "https://res.cloudinary.com/drgwlnf67/image/upload/v1782659637/affan_jnnr58.jpg" },
      { name: "Akshaya A", dept: "III Year CSE", photo: "https://gokuls2028.neocities.org/Akshaya%20A.jpeg" },
      { name: "Banusree R", dept: "III Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935183/R.Banusree_uisleq.jpg" },
      { name: "Gokul S", dept: "III Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935187/gokul_s_kmjp5e.jpg" },
      { name: "GOPIKA. P", dept: "II Year EEE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935191/Gopika_P_itslkt.png" },
      { name: "S Teekaraman", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935203/S_Teekaraman_xfcata.jpg" },
      { name: "MOHAMMED MAAZ C", dept: "II Year CSE", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935180/Maaz_Mohammed_ykuaie.jpg" },
      { name: "Zuha Fathima. Z", dept: "II Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935204/Zuha_Fathima_apwj0d.png" },
      { name: "K Mohamed Emad UR Rahman", dept: "II Year AI-ML", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935211/MD_EMAD_K_brf3yl.png" },
      { name: "M Samyuktha", dept: "II Year AI-ML" },
      { name: "S. Shalini", dept: "II Year AI-ML", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935204/Shalini_mm8tyg.jpg" },
      { name: "Madiha. A", dept: "II Year IT", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935202/Madiha_r249s3.jpg" },
      { name: "Mohammed Amaan. D", dept: "II Year AI-ML", photo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1787935181/Mohammed_Amaan._D_auakrw.jpg" },
      { name: "T. Vaishnavi", dept: "II Year AI-ML" },
      { name: "Monesh Raji R", dept: "II Year ECE" },
    ],
  },
];

function initials(name) {
  const parts = name.replace(/\./g, "").trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function MemberCard({ member }) {
  return (
    <article className="mb-card" key={member.name}>
      <div className="mb-photo" aria-label={`${member.name} photo`}>
        {member.lead && (
          <span className="mb-lead-pill" aria-label="Lead">
            Lead
          </span>
        )}
        <img className="mb-photo-frame" src={imageTemplate} alt="" aria-hidden="true" />
        <div className="mb-photo-cutout">
          {member.photo ? (
            <img
              className="mb-photo-img"
              src={member.photo}
              alt={member.name}
              style={member.photoPos ? { objectPosition: member.photoPos } : undefined}
            />
          ) : (
            <span className="mb-photo-mark">{initials(member.name)}</span>
          )}
        </div>
      </div>
      <div className="mb-copy">
        <div className="mb-name-row">
          <h3 className="mb-name">{member.name}</h3>
          {member.role && (
            <span className="mb-designation">{member.role}</span>
          )}
        </div>
        <p className="mb-dept">{member.dept}</p>
      </div>
    </article>
  );
}

export default function Team() {
  return (
    <>
      <main className="mb-page">
        {/* ============================================================
            HERO
            ============================================================ */}
        <section className="mb-hero" aria-labelledby="members-title">
          <div className="mb-container mb-container--narrow">
            <p className="mb-label">REVIBE '26 Crew</p>

            <h1 id="members-title" className="mb-display">
              Meet our Web Slingers.
            </h1>

            <p className="mb-body-lg">
              Behind every strand of REVIBE '26 is a Slinger. Coders, designers,
              writers and signal keepers, each one pulling their thread to hold
              the web together. This is the crew that slung the next chapter
              into existence.
            </p>

            <p className="mb-strong">Different talents. One web. One mission.</p>
          </div>
        </section>

        <hr className="mb-rule" aria-hidden="true" />

        {/* ============================================================
            CORE TEAM
            ============================================================ */}
        <section className="mb-section" aria-labelledby="core-team">
          <div className="mb-container">
            <p className="mb-label">REVIBE '26 Core</p>
            <h2 id="core-team" className="mb-headline">
              The Core Team
            </h2>
            <p className="mb-body">
              The leads of SGC, steering the vision and holding the web together.
            </p>

            <div className="mb-grid-wrap">
              <ul className="mb-grid mb-grid--core" role="list">
                {coreTeam.map((member) => (
                  <li key={`core-${member.name}`}>
                    <MemberCard member={member} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <hr className="mb-rule" aria-hidden="true" />

        {teams.map((team) => (
          <section key={team.id} className="mb-section" aria-labelledby={team.id}>
            <div className="mb-container">
              <p className="mb-label">{team.label}</p>
              <h2 id={team.id} className="mb-headline">
                {team.title}
              </h2>
              <p className="mb-body">{team.blurb}</p>

              <div className="mb-grid-wrap">
                <ul className="mb-grid" role="list">
                  {team.members.map((member) => (
                    <li key={`${team.id}-${member.name}-${member.dept}`}>
                      <MemberCard member={member} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </main>

      <style>{`
        /* =========================================================
           WEB-SLINGER MODERN - Team page
           Mirrors the neo-comic system used by Home + About.
           Off-white surface · 2px black borders · sharp corners ·
           hard offset shadows · Anton / Hanken Grotesk / JetBrains Mono
        ========================================================= */

        .mb-page {
          width: 100%;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow-x: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
        }

        .mb-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        .mb-container--narrow {
          max-width: 900px;
        }

        /* ---------- sections ---------- */

        .mb-hero {
          position: relative;
          padding: 96px 0 72px;
          background: #f9f9f9;
          overflow: hidden;
        }

        .mb-section {
          position: relative;
          padding: 72px 0;
          background: #f5f5f5;
          overflow: hidden;
        }

        .mb-hero .mb-container,
        .mb-section .mb-container {
          position: relative;
          z-index: 1;
        }

        .mb-hero .mb-container {
          text-align: center;
        }

        /* ---------- 2px black panel dividers ---------- */

        .mb-rule {
          display: block;
          width: 100%;
          height: 0;
          border: 0;
          border-top: 2px solid #1a1a1a;
          margin: 0;
        }

        /* ---------- typography ---------- */

        .mb-label {
          margin: 0 0 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          line-height: 16px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .mb-display {
          margin: 0 0 24px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(40px, 9vw, 84px);
          line-height: 0.98;
          letter-spacing: 0.01em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .mb-accent-line {
          margin: 0 0 20px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(22px, 4.5vw, 34px);
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #dc0000;
        }

        .mb-body-lg {
          margin: 0 auto 20px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 18px;
          line-height: 28px;
          color: #1a1a1a;
        }

        .mb-strong {
          margin: 24px 0 0;
          font-family: 'Anton', sans-serif;
          font-size: clamp(20px, 4vw, 30px);
          line-height: 1.15;
          letter-spacing: 0.03em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .mb-headline {
          margin: 0 0 20px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(32px, 6vw, 48px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .mb-body {
          margin: 0 0 8px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          line-height: 24px;
          color: #3a3a3a;
        }

        /* =========================================================
           MEMBER GRID + CARDS
           Same box system as the sponsor cards on About/Sponsors.
           ========================================================= */

        .mb-grid-wrap {
          position: relative;
          margin-top: 40px;
        }

        .mb-grid {
          position: relative;
          z-index: 2;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .mb-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .mb-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
          pointer-events: none;
        }

        .mb-card:hover,
        .mb-card:focus-within {
          transform: translateY(-3px);
          border-color: rgba(220, 0, 0, 0.6);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        /* ---------- photo block (template frame + circular photo) ----------
           The template (image-template.png) is drawn as the card frame.
           A circular cutout sits over the template's circle and holds each
           member's photo. Adjust the three vars below to match the template.
        --------------------------------------------------------- */

        .mb-photo {
          position: relative;
          z-index: 1;
          width: 100%;
          aspect-ratio: 577 / 433;
          margin-top: 8px;
          border-radius: 12px;
          overflow: hidden;

          /* circle cutout tuning (percentages of the photo block)
             Measured from image-template.png (577x433):
             ring center (282,230) -> 48.9% X, 53.1% Y
             ring outer diameter 238px -> 41.2% of width */
          --cut-size: 41.2%;
          --cut-x: 48.9%;
          --cut-y: 53.1%;
        }

        .mb-photo-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
          user-select: none;
        }

        .mb-photo-cutout {
          position: absolute;
          top: var(--cut-y);
          left: var(--cut-x);
          width: var(--cut-size);
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          overflow: hidden;
          z-index: 1;
          display: grid;
          place-items: center;
          background: #f2f2f2;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        }

        .mb-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .mb-photo-mark {
          font-family: 'Anton', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.06em;
          color: #b0202c;
          opacity: 0.5;
          text-transform: uppercase;
        }

        .mb-lead-pill {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          padding: 5px 11px;
          background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
          color: #ffffff;
          border: 1px solid rgba(220, 0, 0, 0.4);
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(220, 0, 0, 0.25);
        }

        /* ---------- copy ---------- */

        .mb-copy {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mb-name-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.3rem 0.45rem;
        }

        .mb-name {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: 1.25rem;
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #b7102a;
          text-transform: uppercase;
        }

        .mb-designation {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0d0d0d;
          background: rgba(220, 0, 0, 0.10);
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 999px;
          padding: 0.12rem 0.5rem;
          white-space: nowrap;
        }

        .mb-dept {
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3a3a3a;
        }

        .mb-grid--core {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        /* =========================================================
           RESPONSIVE - tablet
           ========================================================= */

        @media (min-width: 600px) {
          .mb-container {
            padding-inline: 32px;
          }
        }

        /* =========================================================
           RESPONSIVE - desktop
           ========================================================= */

        @media (min-width: 1024px) {
          .mb-container {
            padding-inline: 64px;
          }

          .mb-hero {
            padding: 128px 0 96px;
          }

          .mb-section {
            padding: 96px 0;
          }

          .mb-card {
            padding: 24px;
          }
        }

        /* =========================================================
           RESPONSIVE - mobile
           ========================================================= */

        @media (max-width: 899px) {
          .mb-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .mb-grid--core {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 560px) {
          .mb-hero {
            padding: 80px 0 56px;
          }

          .mb-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            justify-items: center;
          }

          .mb-grid > li {
            width: 100%;
            max-width: 340px;
          }

          .mb-grid--core {
            grid-template-columns: 1fr;
            gap: 16px;
            justify-items: center;
          }

          .mb-grid--core > li {
            width: 100%;
            max-width: 340px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mb-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

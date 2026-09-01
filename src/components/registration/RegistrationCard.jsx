import React, { forwardRef } from "react";

const SOLO_BG = "/Reg cards/regcardName.png";
const TEAM_BG = "/Reg cards/regcardTeamname.png";

function getEventsFontSize(count) {
  if (count <= 5) return "clamp(0.55rem, 2.2vw, 1rem)";
  if (count <= 6) return "clamp(0.48rem, 1.9vw, 0.88rem)";
  if (count <= 7) return "clamp(0.4rem, 1.6vw, 0.72rem)";
  return "clamp(0.32rem, 1.3vw, 0.58rem)";
}

const RegistrationCard = forwardRef(function RegistrationCard(
  { name, teamName, events, type },
  ref
) {
  const isTeam = type === "team";
  const displayName = (() => {
    const raw = isTeam ? teamName : name;
    if (!raw) return "";
    return raw.length > 15 ? raw.slice(0, 15) + "..." : raw;
  })();

  const eventCount = (events || []).length;

  return (
    <div ref={ref} className="reg-card-container">
      <img
        src={isTeam ? TEAM_BG : SOLO_BG}
        alt="Registration Card"
        className="reg-card-bg"
        draggable={false}
      />
      <div className="reg-card-name-overlay">{displayName}</div>
      <div
        className="reg-card-events-overlay"
        style={{ fontSize: getEventsFontSize(eventCount) }}
      >
        {(events || [])
          .map((e) => {
            const count = Number(e.teamSize) || 1;
            return `${e.name} (${count})`;
          })
          .join(", ")}
      </div>
    </div>
  );
});

export default RegistrationCard;

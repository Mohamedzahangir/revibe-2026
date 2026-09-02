import React, { forwardRef } from "react";

const SOLO_BG = "/Reg cards/regcardName.png";
const TEAM_BG = "/Reg cards/regcardTeamname.png";

function getEventsFontSize(count) {
  if (count <= 5) return "clamp(0.45rem, 2.8cqw, 0.85rem)";
  if (count <= 6) return "clamp(0.42rem, 2.5cqw, 0.78rem)";
  if (count <= 7) return "clamp(0.38rem, 2.2cqw, 0.68rem)";
  return "clamp(0.32rem, 1.9cqw, 0.55rem)";
}

function getVerticalEventsFontSize(count) {
  if (count === 1) return "clamp(0.5rem, 3.5cqw, 0.95rem)";
  if (count === 2) return "clamp(0.45rem, 3cqw, 0.82rem)";
  return "clamp(0.38rem, 2.6cqw, 0.7rem)";
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
  const isVertical = eventCount <= 3;

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
        className={`reg-card-events-overlay${isVertical ? " events-vertical" : ""}`}
        style={{
          fontSize: isVertical
            ? getVerticalEventsFontSize(eventCount)
            : getEventsFontSize(eventCount),
        }}
      >
        {isVertical
          ? (events || []).map((e, i) => {
              const count = Number(e.teamSize) || 1;
              return <div key={i} className="reg-card-event-line">{`${e.name} (${count})`}</div>;
            })
          : (events || [])
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

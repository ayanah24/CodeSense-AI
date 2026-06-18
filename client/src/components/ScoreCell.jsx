
export default function ScoreCell({ label, value }) {
  const score = Number(value ?? 0);

  // Colour bands: red < 50, amber 50-74, green ≥ 75
  const color =
    score >= 75
      ? "var(--success)"
      : score >= 50
      ? "var(--warning, #e3a008)"
      : "var(--danger)";

  
  const ringStyle = {
    background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)`,
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        background: "var(--card)",
        padding: "0.75rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {/* Arc ring */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          ...ringStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.7rem",
            color,
          }}
        >
          {score}
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--muted-foreground)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

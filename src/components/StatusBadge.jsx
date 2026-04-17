// components/StatusBadge.jsx
// Colorful badge to represent application status

export const STATUS_CONFIG = {
  applied:     { label: 'Applied',      cls: 'badge-blue',   emoji: '📩' },
  review:      { label: 'Under Review', cls: 'badge-purple', emoji: '🔍' },
  shortlisted: { label: 'Shortlisted',  cls: 'badge-green',  emoji: '⭐' },
  interview:   { label: 'Interview',    cls: 'badge-yellow', emoji: '🎯' },
  rejected:    { label: 'Rejected',     cls: 'badge-red',    emoji: '✗'  },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

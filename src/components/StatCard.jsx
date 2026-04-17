// components/StatCard.jsx
// Dashboard metric card with icon and trend indicator

import './StatCard.css';

export default function StatCard({ icon, label, value, color = 'blue', trend }) {
  return (
    <div className={`stat-card card animate-fade-in stat-card--${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {trend && <p className="stat-card-trend">{trend}</p>}
      </div>
    </div>
  );
}

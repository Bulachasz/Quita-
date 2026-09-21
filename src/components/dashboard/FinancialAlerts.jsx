import React from 'react';

export function FinancialAlerts({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-medium shadow-sm ${
            alert.type === 'danger'
              ? 'bg-red-50 border-red-200 text-red-800'
              : alert.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <span className="text-lg">{alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : '💡'}</span>
          <div className="flex-1">
            <h5 className="font-bold text-xs uppercase tracking-wide opacity-80">{alert.title}</h5>
            <p className="mt-0.5">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
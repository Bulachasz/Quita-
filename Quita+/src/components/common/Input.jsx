import React from 'react';

export function Input({ label, error, icon: Icon, tooltip, className = '', ...props }) {
  return (
    <div className="w-full flex flex-col gap-1 text-left">
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="cursor-pointer text-gray-400 hover:text-gray-600 text-xs" title={tooltip}>
              ⓘ
            </span>
          )}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />}
        <input
          className={`w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 ${
            Icon ? 'pl-10' : 'px-3.5'
          } ${error ? 'border-red-500 ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
}
import React from 'react';

const StatusBadge = ({ status, size = 'sm', showIcon = true, showLabel = true }) => {
  const statusConfig = {
    'not-started': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '⭕', label: '시작 전', shortLabel: '시작전' },
    'in-progress': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔄', label: '진행 중', shortLabel: '진행중' },
    'completed': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅', label: '완료', shortLabel: '완료' },
    'on-hold': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏸️', label: '보류', shortLabel: '보류' },
    'cancelled': { color: 'bg-red-50 text-red-700 border-red-200', icon: '❌', label: '취소', shortLabel: '취소' }
  };

  const config = statusConfig[status] || statusConfig['not-started'];
  
  // Size configurations
  const sizeConfig = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const currentSize = sizeConfig[size] || sizeConfig.sm;
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${currentSize} flex-shrink-0`}>
      {showIcon && <span className="flex-shrink-0">{config.icon}</span>}
      {showLabel && (
        <span className="truncate">
          {/* Mobile: Show short label */}
          <span className="sm:hidden">
            {config.shortLabel}
          </span>
          {/* Desktop: Show full label */}
          <span className="hidden sm:inline">
            {config.label}
          </span>
        </span>
      )}
    </span>
  );
};

export default StatusBadge;
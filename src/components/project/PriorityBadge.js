import React from 'react';

const PriorityBadge = ({ priority, size = 'sm', showIcon = true, showLabel = true }) => {
  const priorityConfig = {
    'low': { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: '🔵', label: '낮음' },
    'medium': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🟡', label: '보통' },
    'high': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🟠', label: '높음' },
    'critical': { color: 'bg-red-50 text-red-700 border-red-200', icon: '🔴', label: '긴급' }
  };

  const config = priorityConfig[priority] || priorityConfig['medium'];
  
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
          {/* Mobile: Show short label for critical */}
          <span className="sm:hidden">
            {priority === 'critical' ? '긴급' : config.label}
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

export default PriorityBadge;
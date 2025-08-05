import React from 'react';
import { Layout, List, Clock, BarChart3 } from 'lucide-react';

const ViewSelector = ({ activeView, setActiveView, filteredProjectsCount }) => {
  const views = [
    { id: 'board', label: '보드', icon: Layout },
    { id: 'list', label: '리스트', icon: List },
    { id: 'timeline', label: '타임라인', icon: Clock },
    { id: 'analytics', label: '분석', icon: BarChart3 }
  ];

  return (
    <div className="mb-4 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Mobile: Stacked Layout */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
            {views.map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === view.id
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-200 rounded-xl p-1">
          {views.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeView === view.id
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
                
        {/* Project Count - Responsive */}
        <div className="flex items-center justify-center sm:justify-end">
          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
            <span className="text-xs sm:text-sm font-medium">
              <span className="hidden sm:inline">프로젝트 </span>
              {filteredProjectsCount}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSelector;
import React from 'react';
import { Clock } from 'lucide-react';

// Component: Status Badge
const StatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    'not-started': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '⭕', label: '시작 전', shortLabel: '시작전' },
    'in-progress': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔄', label: '진행 중', shortLabel: '진행중' },
    'completed': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅', label: '완료', shortLabel: '완료' },
    'on-hold': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏸️', label: '보류', shortLabel: '보류' },
    'cancelled': { color: 'bg-red-50 text-red-700 border-red-200', icon: '❌', label: '취소', shortLabel: '취소' }
  };

  const config = statusConfig[status] || statusConfig['not-started'];
  
  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span>{config.icon}</span>
      {/* Mobile: Show short label */}
      <span className="sm:hidden">{config.shortLabel}</span>
      {/* Desktop: Show full label */}
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
};

// Component: Priority Badge
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    'low': { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: '🔵', label: '낮음' },
    'medium': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🟡', label: '보통' },
    'high': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🟠', label: '높음' },
    'critical': { color: 'bg-red-50 text-red-700 border-red-200', icon: '🔴', label: '긴급' }
  };

  const config = priorityConfig[priority] || priorityConfig['medium'];
  
  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span>{config.icon}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
};

const ProjectCard = ({ project, onClick }) => {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const daysUntilDue = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      style={{ borderLeftColor: project.color, borderLeftWidth: '4px' }}
    >
      {/* Header Section - Responsive */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-200 flex-shrink-0">
            <span className="text-lg sm:text-xl">{project.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <PriorityBadge priority={project.priority} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Description - Responsive */}
      <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
        {project.description}
      </p>
      
      {/* Team and Due Date - Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex -space-x-1 sm:-space-x-2">
          {project.team.slice(0, 3).map(member => (
            <img 
              key={member.id}
              src={member.avatar} 
              alt={member.name}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-sm"
              title={member.name}
            />
          ))}
          {project.team.length > 3 && (
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-slate-600">+{project.team.length - 3}</span>
            </div>
          )}
        </div>
        
        {/* Due Date Badge - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs">
          {daysUntilDue > 0 && project.status !== 'completed' && (
            <span className={`px-2 sm:px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
              daysUntilDue <= 7 ? 'bg-red-100 text-red-700 border border-red-200' : 
              daysUntilDue <= 14 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
              'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">D-{daysUntilDue}</span>
              <span className="sm:hidden">{daysUntilDue}일</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Section - Responsive */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="font-medium">
            <span className="hidden sm:inline">작업 진행률</span>
            <span className="sm:hidden">진행률</span>
          </span>
          <span className="text-slate-500 font-mono">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
            style={{ width: `${taskProgress}%` }}
          />
        </div>
      </div>
      
      {/* Footer - Tags and Status - Responsive */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {project.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200 truncate max-w-20 sm:max-w-none">
              #{tag}
            </span>
          ))}
          {project.tags.length > 2 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
              +{project.tags.length - 2}
            </span>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>
    </div>
  );
};

export default ProjectCard;
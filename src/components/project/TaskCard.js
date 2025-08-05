import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Paperclip, MoreHorizontal, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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

const TaskCard = ({ task, onUpdate, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className={`group bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
      task.status === 'completed' ? 'opacity-75' : ''
    }`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={() => onUpdate(task.id, { status: task.status === 'completed' ? 'in-progress' : 'completed' })}
            className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              task.status === 'completed' 
                ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {task.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm sm:text-base text-slate-900 mb-1 line-clamp-2 ${
              task.status === 'completed' ? 'line-through text-slate-500' : ''
            }`}>
              {task.title}
            </h4>
            
            {task.description && !compact && (
              <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {task.description}
              </p>
            )}
            
            {/* Tags and Meta Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <PriorityBadge priority={task.priority} />
              
              {task.assignee && (
                <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 px-2 py-1 rounded-full">
                  <img 
                    src={task.assignee.avatar || `https://i.pravatar.cc/20?img=${task.assignee.id}`} 
                    alt={task.assignee.name} 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                  />
                  <span className="text-xs text-slate-600 font-medium truncate max-w-16 sm:max-w-20">
                    {task.assignee.name}
                  </span>
                </div>
              )}
              
              {task.dueDate && (
                <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className="sm:hidden">
                    {new Date(task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {task.comments > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-1.5 sm:px-2 py-1 rounded-full">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">{task.comments}</span>
            </span>
          )}
          
          {task.attachments > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-1.5 sm:px-2 py-1 rounded-full">
              <Paperclip className="w-3 h-3" />
              <span className="hidden sm:inline">{task.attachments}</span>
            </span>
          )}
          
          {totalSubtasks > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {task.labels.slice(0, 3).map(label => (
            <span key={label} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium border border-indigo-100 truncate">
              #{label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md font-medium border border-slate-200">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium">
              <span className="hidden sm:inline">서브태스크</span>
              <span className="sm:hidden">서브</span>
            </span>
            <span className="text-slate-500 font-mono">{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Subtasks */}
      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2 sm:gap-2.5">
                <button className={`w-3 h-3 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                  subtask.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'
                }`}>
                  {subtask.completed && <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />}
                </button>
                <span className={`text-xs sm:text-sm flex-1 min-w-0 ${
                  subtask.completed ? 'line-through text-slate-500' : 'text-slate-700'
                }`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
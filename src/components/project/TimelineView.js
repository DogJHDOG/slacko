import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TaskCard from './TaskCard';

const TimelineView = ({ filteredProjects, updateTask }) => {
  return (
    <div className="space-y-4 sm:space-y-8">
      {filteredProjects.map(project => {
                
        return (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <span className="text-xl sm:text-2xl">{project.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2 sm:line-clamp-1">
                    {project.description}
                  </p>
                </div>
              </div>
              
              {/* Badges - Responsive */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                <PriorityBadge priority={project.priority} />
                <StatusBadge status={project.status} />
              </div>
            </div>

            {/* Timeline - Responsive */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-purple-200"></div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Milestones */}
                {project.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="relative flex items-start">
                    <div className={`absolute left-0 sm:left-2 w-4 h-4 rounded-full border-2 shadow-sm ${
                      milestone.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-slate-300'
                    }`}></div>
                    
                    <div className="ml-6 sm:ml-10 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-semibold text-sm sm:text-base ${
                            milestone.completed ? 'text-emerald-700' : 'text-slate-900'
                          }`}>
                            {milestone.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                        {milestone.completed && (
                          <div className="flex-shrink-0 mt-1 sm:mt-0">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Tasks */}
                <div className="ml-6 sm:ml-10 space-y-3 sm:space-y-4">
                  {project.tasks?.map(task => (
                    <div key={task.id} className="relative">
                      <TaskCard
                        task={task}
                        onUpdate={(taskId, updates) => updateTask(project.id, taskId, updates)}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State - When no milestones or tasks */}
            {(!project.milestones || project.milestones.length === 0) && 
             (!project.tasks || project.tasks.length === 0) && (
              <div className="text-center py-8 sm:py-12 text-slate-400">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-30 bg-slate-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <p className="text-sm font-medium">아직 마일스톤이나 작업이 없습니다</p>
                <p className="text-xs mt-1">프로젝트 상세에서 추가해보세요</p>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Empty State - When no projects */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 sm:py-16 text-slate-400">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-30 bg-slate-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <p className="text-lg font-medium">표시할 프로젝트가 없습니다</p>
          <p className="text-sm mt-1">필터를 조정하거나 새 프로젝트를 생성해보세요</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
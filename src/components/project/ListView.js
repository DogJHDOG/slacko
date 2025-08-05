import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ListView = ({ filteredProjects, setSelectedProject }) => {
  return (
    <div className="w-full">
      {/* Mobile: Card View */}
      <div className="sm:hidden space-y-4">
        {filteredProjects.map(project => {
          const totalTasks = project.tasks?.length || 0;
          const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
          const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-200">
                  <span className="text-lg">{project.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{project.description}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>

              {/* Team */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-slate-600">팀원:</span>
                <div className="flex -space-x-1">
                  {project.team.slice(0, 4).map(member => (
                    <img 
                      key={member.id}
                      src={member.avatar} 
                      alt={member.name}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      title={member.name}
                    />
                  ))}
                  {project.team.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-xs font-semibold text-slate-600">+{project.team.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>진행률</span>
                  <span>{Math.round(taskProgress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-900 font-medium">
                  {new Date(project.endDate).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                >
                  보기
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  프로젝트
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  팀원
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  마감일
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  예산
                </th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProjects.map(project => {
                const totalTasks = project.tasks?.length || 0;
                const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
                const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                return (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-200 mr-3 flex-shrink-0">
                          <span className="text-lg">{project.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900 truncate max-w-48">
                            {project.name}
                          </div>
                          <div className="text-sm text-slate-500 truncate max-w-48">
                            {project.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={project.priority} />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map(member => (
                          <img 
                            key={member.id}
                            src={member.avatar} 
                            alt={member.name}
                            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white shadow-sm"
                            title={member.name}
                          />
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-sm">
                            <span className="text-xs font-semibold text-slate-600">
                              +{project.team.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-16 lg:w-20 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 min-w-[3rem]">
                          {Math.round(taskProgress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      <div className="hidden lg:block">
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className="lg:hidden">
                        {new Date(project.endDate).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-medium">
                        {project.budget ? (
                          <div>
                            <div className="truncate">
                              ₩{(project.spent / 1000000).toFixed(1)}M / ₩{(project.budget / 1000000).toFixed(1)}M
                            </div>
                            <div className="w-16 lg:w-20 bg-slate-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  (project.spent / project.budget) * 100 > 90 ? 'bg-red-500' : 
                                  (project.spent / project.budget) * 100 > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 sm:py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-30 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-medium">표시할 프로젝트가 없습니다</p>
          <p className="text-sm mt-1">필터를 조정하거나 새 프로젝트를 생성해보세요</p>
        </div>
      )}
    </div>
  );
};

export default ListView;
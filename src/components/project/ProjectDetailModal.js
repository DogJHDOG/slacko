import React from 'react';
import { X, FileText, Eye, Mail, Plus, Users, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TaskCard from './TaskCard';

const ProjectDetailModal = ({ 
  selectedProject, 
  setSelectedProject, 
  updateTask, 
  setShowTaskModal 
}) => {
  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <span className="text-2xl sm:text-3xl">{selectedProject.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                {selectedProject.name}
              </h2>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2 sm:line-clamp-1">
                {selectedProject.description}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                <StatusBadge status={selectedProject.status} />
                <PriorityBadge priority={selectedProject.priority} />
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 p-4 sm:p-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6 sm:space-y-8">
              {/* Tasks Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">작업 목록</h3>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium shadow-sm flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">작업 추가</span>
                    <span className="sm:hidden">추가</span>
                  </button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {selectedProject.tasks?.length > 0 ? (
                    selectedProject.tasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onUpdate={(taskId, updates) => updateTask(selectedProject.id, taskId, updates)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <p className="text-sm font-medium">아직 작업이 없습니다</p>
                      <p className="text-xs mt-1">새 작업을 추가해보세요</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              <div className="xl:block hidden">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">첨부 파일</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.files?.length > 0 ? (
                    selectedProject.files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <FileText className="w-6 h-6 text-slate-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.size} • {file.uploadedBy}</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">첨부된 파일이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Project Info */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  프로젝트 정보
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <span className="text-sm text-slate-600 font-medium">기간</span>
                    <span className="text-sm text-slate-900 font-medium">
                      <span className="block sm:inline">
                        {new Date(selectedProject.startDate).toLocaleDateString()}
                      </span>
                      <span className="hidden sm:inline"> - </span>
                      <span className="block sm:inline">
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                  
                  {selectedProject.budget > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <span className="text-sm text-slate-600 font-medium">예산</span>
                      <span className="text-sm text-slate-900 font-medium">
                        ₩{(selectedProject.budget / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}
                  
                  {selectedProject.tags?.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <span className="text-sm text-slate-600 font-medium">태그</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                        {selectedProject.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            +{selectedProject.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  팀 구성원
                </h4>
                <div className="space-y-3">
                  {selectedProject.team?.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-600">{member.role}</p>
                        {member.email && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">최근 활동</h4>
                <div className="space-y-4">
                  {selectedProject.activity?.length > 0 ? (
                    selectedProject.activity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">
                            <span className="font-semibold">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <p className="text-sm">최근 활동이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Files Section */}
              <div className="xl:hidden bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">첨부 파일</h4>
                <div className="space-y-3">
                  {selectedProject.files?.length > 0 ? (
                    selectedProject.files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.size}</p>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">첨부된 파일이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
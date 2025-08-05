import React, { useState } from 'react';
import { X, Calendar, Users, Palette, Hash } from 'lucide-react';
import TeamMemberSelector from './TeamMemberSelector';
import { useProjectContext } from '../../context/ProjectContext';

const ProjectModal = ({ showModal, onClose }) => {
  const { addProject } = useProjectContext();
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    color: '#6366f1',
    icon: '📁',
    visibility: 'team',
    tags: []
  });
  const [projectTeam, setProjectTeam] = useState([
    {
      id: 1,
      name: '김현우',
      role: 'PM',
      avatar: 'https://i.pravatar.cc/40?img=1',
      email: 'kim@example.com',
      phone: '010-1234-5678'
    }
  ]);

  const handleCreateProject = () => {
    if (!projectData.name || !projectData.startDate || !projectData.endDate) return;
    
    const newProject = {
      ...projectData,
      id: Date.now(),
      status: 'not-started',
      budget: parseInt(projectData.budget) || 0,
      spent: 0,
      estimatedHours: 0,
      actualHours: 0,
      owner: projectTeam[0],
      team: projectTeam,
      tasks: [],
      milestones: [],
      activity: [],
      files: [],
      tags: projectData.tags
    };
    
    addProject(newProject);
    onClose();
    
    // Reset form
    setProjectData({
      name: '',
      description: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      color: '#6366f1',
      icon: '📁',
      visibility: 'team',
      tags: []
    });
    setProjectTeam([
      {
        id: 1,
        name: '김현우',
        role: 'PM',
        avatar: 'https://i.pravatar.cc/40?img=1',
        email: 'kim@example.com',
        phone: '010-1234-5678'
      }
    ]);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900">새 프로젝트 생성</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                기본 정보
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    프로젝트명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="프로젝트 이름을 입력하세요"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">프로젝트 설명</label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base resize-none"
                    rows="3"
                    placeholder="프로젝트에 대한 간단한 설명"
                  />
                </div>
              </div>
            </div>

            {/* Dates and Settings */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                일정 및 설정
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={projectData.startDate}
                    onChange={(e) => setProjectData({...projectData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  />
                </div>
                
                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={projectData.endDate}
                    onChange={(e) => setProjectData({...projectData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  />
                </div>
                
                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">우선순위</label>
                  <select
                    value={projectData.priority}
                    onChange={(e) => setProjectData({...projectData, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                    <option value="critical">긴급</option>
                  </select>
                </div>
                
                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">예산 (원)</label>
                  <input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData({...projectData, budget: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    placeholder="10000000"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                외관 설정
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">프로젝트 색상</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={projectData.color}
                      onChange={(e) => setProjectData({...projectData, color: e.target.value})}
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={projectData.color}
                      onChange={(e) => setProjectData({...projectData, color: e.target.value})}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                
                {/* Icon */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">프로젝트 아이콘</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      {projectData.icon}
                    </div>
                    <input
                      type="text"
                      value={projectData.icon}
                      onChange={(e) => setProjectData({...projectData, icon: e.target.value})}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      placeholder="📁"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Management */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                팀 관리
              </h4>
              
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <TeamMemberSelector
                  team={projectTeam}
                  selectedMembers={projectTeam}
                  onMembersChange={setProjectTeam}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50 sm:bg-white flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-slate-700 bg-white sm:bg-slate-100 hover:bg-slate-100 sm:hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 sm:border-0 font-medium"
          >
            취소
          </button>
          <button 
            onClick={handleCreateProject}
            disabled={!projectData.name || !projectData.startDate || !projectData.endDate}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-sm"
          >
            프로젝트 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
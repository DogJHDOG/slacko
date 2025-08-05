import { useState, useMemo } from 'react';
import { 
  Plus, Search, Briefcase, Filter, X
} from 'lucide-react';

import ProjectModal from '../../components/project/ProjectModal';
import ViewSelector from '../../components/project/ViewSelector';
import BoardView from '../../components/project/BoardView';
import ListView from '../../components/project/ListView';
import TimelineView from '../../components/project/TimelineView';
import AnalyticsView from '../../components/project/AnalyticsView';
import ProjectDetailModal from '../../components/project/ProjectDetailModal';
import TaskModal from '../../components/project/TaskModal';
import { useProjectContext } from '../../context/ProjectContext';

export default function AdvancedProjectManagement() {
  const { projects, addProject, updateTask, addTask } = useProjectContext();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    tags: []
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Analytics & Metrics
  const analytics = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
    const overallProgress = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    
    const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
    const completedTasks = projects.reduce((acc, p) => 
      acc + (p.tasks?.filter(t => t.status === 'completed').length || 0), 0);
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      overallProgress,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalBudget,
      totalSpent,
      budgetUtilization
    };
  }, [projects]);

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      if (filters.priority !== 'all' && project.priority !== filters.priority) return false;
      if (filters.assignee !== 'all' && !project.team.some(member => member.id.toString() === filters.assignee)) return false;
      if (filters.tags.length > 0 && !filters.tags.some(tag => project.tags.includes(tag))) return false;
      
      return true;
    });
  }, [projects, searchQuery, filters]);

  const handleCreateProject = (newProject) => {
    addProject(newProject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Responsive Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="w-full px-4 sm:px-6 py-3">
          {/* Mobile and Desktop Header Layout */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg flex-shrink-0">
                <Briefcase size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent truncate">
                  프로젝트 관리
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 truncate hidden sm:block">
                  팀 협업과 프로젝트 진행을 관리하세요
                </p>
              </div>
            </div>
            
            {/* Right side - Action Button */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => setShowProjectModal(true)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-1 sm:gap-2 font-medium text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">새 프로젝트</span>
                <span className="sm:hidden">추가</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Search and Filters Section */}
        <div className="mb-4 sm:mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="프로젝트, 작업, 팀원 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 sm:pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm text-sm sm:text-base"
            />
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 sm:hidden"
            >
              <Filter size={16} />
            </button>
          </div>
          
          {/* Desktop Filters - Always visible on desktop */}
          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm min-w-0"
            >
              <option value="all">모든 상태</option>
              <option value="not-started">시작 전</option>
              <option value="in-progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="on-hold">보류</option>
            </select>
            
            <select 
              value={filters.priority} 
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm min-w-0"
            >
              <option value="all">모든 우선순위</option>
              <option value="critical">긴급</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
          
          {/* Mobile Filters - Collapsible */}
          {showFilters && (
            <div className="sm:hidden bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">필터</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                  <select 
                    value={filters.status} 
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">모든 상태</option>
                    <option value="not-started">시작 전</option>
                    <option value="in-progress">진행 중</option>
                    <option value="completed">완료</option>
                    <option value="on-hold">보류</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
                  <select 
                    value={filters.priority} 
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">모든 우선순위</option>
                    <option value="critical">긴급</option>
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Selector - Responsive */}
        <div className="mb-4 sm:mb-6">
          <ViewSelector 
            activeView={activeView}
            setActiveView={setActiveView}
            filteredProjectsCount={filteredProjects.length}
          />
        </div>
        
        {/* Content Views - All responsive by default */}
        <div className="w-full overflow-hidden">
          {activeView === 'board' && (
            <BoardView 
              filteredProjects={filteredProjects}
              setSelectedProject={setSelectedProject}
            />
          )}
          {activeView === 'list' && (
            <ListView 
              filteredProjects={filteredProjects}
              setSelectedProject={setSelectedProject}
            />
          )}
          {activeView === 'timeline' && (
            <TimelineView 
              filteredProjects={filteredProjects}
              updateTask={updateTask}
            />
          )}
          {activeView === 'analytics' && (
            <AnalyticsView 
              analytics={analytics}
              projects={projects}
            />
          )}
        </div>
        
        {/* Modals */}
        <ProjectModal 
          showModal={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onCreateProject={handleCreateProject}
        />

        <ProjectDetailModal 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          updateTask={updateTask}
          setShowTaskModal={setShowTaskModal}
        />

        <TaskModal 
          showTaskModal={showTaskModal}
          setShowTaskModal={setShowTaskModal}
          selectedProject={selectedProject}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
}
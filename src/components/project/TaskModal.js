import React, { useState } from 'react';
import { X } from 'lucide-react';

const TaskModal = ({ 
  showTaskModal, 
  setShowTaskModal, 
  selectedProject, 
  onAddTask 
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: null,
    dueDate: '',
    labels: []
  });

  const handleSubmit = () => {
    if (!taskData.title) return;
    
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: 'not-started',
      comments: 0,
      attachments: 0,
      subtasks: []
    };
    
    onAddTask(selectedProject.id, newTask);
    setTaskData({ title: '', description: '', priority: 'medium', assignee: null, dueDate: '', labels: [] });
    setShowTaskModal(false);
  };

  if (!showTaskModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header - Responsive */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900">새 작업 추가</h3>
          <button
            onClick={() => setShowTaskModal(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - Responsive */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              작업 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              placeholder="작업 제목을 입력하세요"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">설명</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base resize-none"
              rows="3"
              placeholder="작업에 대한 상세 설명"
            />
          </div>
          
          {/* Priority and Due Date - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">우선순위</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="critical">긴급</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">마감일</label>
              <input
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>
          
          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">담당자</label>
            <select
              value={taskData.assignee?.id || ''}
              onChange={(e) => {
                const assignee = selectedProject?.team.find(member => member.id.toString() === e.target.value);
                setTaskData({...taskData, assignee});
              }}
              className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            >
              <option value="">담당자 선택</option>
              {selectedProject?.team.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          {/* Selected Assignee Preview */}
          {taskData.assignee && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <img
                src={taskData.assignee.avatar || `https://i.pravatar.cc/32?img=${taskData.assignee.id}`}
                alt={taskData.assignee.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">{taskData.assignee.name}</p>
                <p className="text-xs text-slate-600">{taskData.assignee.role}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50 sm:bg-white rounded-b-2xl">
          <button
            onClick={() => setShowTaskModal(false)}
            className="px-4 py-2.5 text-slate-700 bg-white sm:bg-slate-100 hover:bg-slate-100 sm:hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 sm:border-0 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!taskData.title.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-sm"
          >
            작업 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
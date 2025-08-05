import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AddSubjectModal = ({ open, onClose, onAdd }) => {
  const [newSubject, setNewSubject] = useState({
    name: '',
    category: 'major',
    color: 'blue',
    priority: 'medium',
    difficulty: 3,
    targetCompletionDate: '',
    dailyGoal: 60,
    weeklyGoal: '',
    chapters: []
  });

  const colorMap = {
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      accent: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    green: { 
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      accent: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
      border: 'border-purple-200', 
      text: 'text-purple-700', 
      accent: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    red: { 
      bg: 'bg-gradient-to-br from-red-50 to-red-100', 
      border: 'border-red-200', 
      text: 'text-red-700', 
      accent: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    yellow: { 
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100', 
      border: 'border-amber-200', 
      text: 'text-amber-700', 
      accent: 'bg-gradient-to-r from-amber-500 to-amber-600'
    },
    indigo: { 
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', 
      border: 'border-indigo-200', 
      text: 'text-indigo-700', 
      accent: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    }
  };

  const handleSubmit = () => {
    if (newSubject.name.trim() && newSubject.chapters.length > 0) {
      onAdd(newSubject);
      setNewSubject({
        name: '',
        category: 'major',
        color: 'blue',
        priority: 'medium',
        difficulty: 3,
        targetCompletionDate: '',
        dailyGoal: 60,
        weeklyGoal: '',
        chapters: []
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Plus size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">새 과목 추가</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">과목명 *</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={e => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 자료구조와 알고리즘"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">카테고리</label>
                  <select
                    value={newSubject.category}
                    onChange={e => setNewSubject(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="major">전공</option>
                    <option value="project">프로젝트</option>
                    <option value="certificate">자격증</option>
                    <option value="hobby">취미</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">색상 테마</label>
                  <div className="flex gap-2">
                    {Object.keys(colorMap).map(color => (
                      <button
                        key={color}
                        onClick={() => setNewSubject(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full ${colorMap[color].accent} ${
                          newSubject.color === color ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">우선순위</label>
                  <select
                    value={newSubject.priority}
                    onChange={e => setNewSubject(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              {/* 목표 설정 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">난이도 (1-5)</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(level => (
                      <button
                        key={level}
                        onClick={() => setNewSubject(prev => ({ ...prev, difficulty: level }))}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          level <= newSubject.difficulty 
                            ? 'bg-yellow-400 text-yellow-900' 
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">완료 목표일</label>
                  <input
                    type="date"
                    value={newSubject.targetCompletionDate}
                    onChange={e => setNewSubject(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">일일 학습 목표 (분)</label>
                  <input
                    type="number"
                    value={newSubject.dailyGoal}
                    onChange={e => setNewSubject(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 60 }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">주간 목표</label>
                  <input
                    type="text"
                    value={newSubject.weeklyGoal}
                    onChange={e => setNewSubject(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 3챕터 완료"
                  />
                </div>
              </div>
            </div>

            {/* 챕터 추가 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">학습 챕터 목록</label>
              <div className="space-y-2 mb-4">
                {newSubject.chapters.map((chapter, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={chapter}
                      onChange={e => {
                        const updatedChapters = [...newSubject.chapters];
                        updatedChapters[index] = e.target.value;
                        setNewSubject(prev => ({ ...prev, chapters: updatedChapters }));
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`챕터 ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const updatedChapters = newSubject.chapters.filter((_, i) => i !== index);
                        setNewSubject(prev => ({ ...prev, chapters: updatedChapters }));
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setNewSubject(prev => ({ ...prev, chapters: [...prev.chapters, ''] }))}
                className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center gap-2"
              >
                <Plus size={16} /> 챕터 추가
              </button>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newSubject.name.trim() || newSubject.chapters.length === 0}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> 과목 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal; 
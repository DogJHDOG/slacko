import React from 'react';
import { Target, Trophy, BookMarked, BookOpen, Zap, Award } from 'lucide-react';

const GoalSetting = ({ subjects, goals, showToastMessage, updateGoalProgress }) => {
  const colorMap = {
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
      border: 'border-blue-200', 
      text: 'text-blue-700'
    },
    green: { 
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
      border: 'border-purple-200', 
      text: 'text-purple-700'
    }
  };

  const categoryMap = {
    major: { name: '전공', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    project: { name: '프로젝트', color: 'bg-green-100 text-green-800', icon: Zap },
    certificate: { name: '자격증', color: 'bg-purple-100 text-purple-800', icon: Award }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Target className="text-green-500" size={24} />
          목표 설정 및 관리
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 전체 목표 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              전체 학습 목표
            </h3>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">일일 학습 목표 (분)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">주간 학습 목표 (시간)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">연속 학습일 목표</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 과목별 목표 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BookMarked size={20} className="text-blue-500" />
              과목별 목표
            </h3>
            
            <div className="space-y-4">
              {subjects.map(subject => {
                const colors = colorMap[subject.color];
                const CategoryIcon = categoryMap[subject.category].icon;
                
                return (
                  <div key={subject.id} className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <CategoryIcon size={18} className={colors.text} />
                      <h4 className={`font-semibold ${colors.text}`}>{subject.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">일일 목표 (분)</label>
                        <input
                          type="number"
                          value={subject.dailyGoal}
                          onChange={e => {
                            const newGoal = parseInt(e.target.value) || 0;
                            // 목표 업데이트 로직은 나중에 구현
                            console.log(`새로운 일일 목표: ${newGoal}분`);
                          }}
                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">완료 목표일</label>
                        <input
                          type="date"
                          value={subject.targetCompletionDate}
                          onChange={e => {
                            // 목표 업데이트 로직은 나중에 구현
                            console.log(`새로운 완료 목표일: ${e.target.value}`);
                          }}
                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button 
            onClick={() => showToastMessage('목표가 설정되었습니다!', 'success')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <Target size={16} /> 목표 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting; 
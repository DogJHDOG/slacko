import React from 'react';
import { 
  BookMarked, ChevronRight, ChevronDown, Edit3, Trash2, 
  Play, Target, BarChart3, CheckCircle, BookOpen, Zap, Flame, Award
} from 'lucide-react';

const SubjectManagement = ({
  subjects,
  expandedSubjects,
  getProgress,
  formatTime,
  toggleChapter,
  updateMemo,
  toggleSubjectExpansion,
  setSelectedSubject,
  setActiveTab,
  setShowGoalForm,
  setShowAddForm
}) => {
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
    }
  };

  const categoryMap = {
    major: { name: '전공', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    project: { name: '프로젝트', color: 'bg-green-100 text-green-800', icon: Zap },
    certificate: { name: '자격증', color: 'bg-purple-100 text-purple-800', icon: Award }
  };

  const priorityMap = {
    high: { name: '높음', color: 'bg-red-100 text-red-800', icon: Flame },
    medium: { name: '보통', color: 'bg-yellow-100 text-yellow-800', icon: Award },
    low: { name: '낮음', color: 'bg-gray-100 text-gray-800', icon: BookOpen }
  };

  const getDaysUntilDeadline = (date) => {
    const today = new Date();
    const deadline = new Date(date);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <BookMarked className="text-blue-500" size={24} />
          과목 관리
        </h2>
        
        {subjects.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            <BookOpen size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">아직 등록된 과목이 없습니다</p>
            <p className="text-sm mb-6">새로운 과목을 추가해서 학습을 시작해보세요!</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-medium mx-auto"
            >
              <BookOpen size={18} /> 첫 번째 과목 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map(subject => {
              const progress = getProgress(subject);
              const colors = colorMap[subject.color];
              const CategoryIcon = categoryMap[subject.category].icon;
              const isExpanded = expandedSubjects.has(subject.id);
              const daysLeft = getDaysUntilDeadline(subject.targetCompletionDate);
              
              return (
                <div key={subject.id} className={`${colors.bg} rounded-2xl border ${colors.border} shadow-lg overflow-hidden`}>
                  <div className="p-6">
                    {/* 과목 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${colors.accent} rounded-xl shadow-lg`}>
                          <CategoryIcon size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-xl font-bold ${colors.text}`}>{subject.name}</h3>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryMap[subject.category].color}`}>
                              {categoryMap[subject.category].name}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityMap[subject.priority].color}`}>
                              {priorityMap[subject.priority].name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>난이도: {'★'.repeat(subject.difficulty)}{'☆'.repeat(5-subject.difficulty)}</span>
                            <span>D-{daysLeft > 0 ? daysLeft : 0}</span>
                            <span>{subject.currentStreak}일 연속</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSubjectExpansion(subject.id)}
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* 진도 바 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">전체 진도</span>
                        <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-3 shadow-inner">
                        <div 
                          className={`${colors.accent} h-3 rounded-full transition-all duration-700 shadow-sm`} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{subject.completedChapters}/{subject.totalChapters} 챕터 완료</span>
                        <span>총 {formatTime(subject.totalStudyTime)} 학습</span>
                      </div>
                    </div>

                    {/* 목표 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={16} className="text-blue-500" />
                          <span className="text-xs font-medium text-slate-600">일일 목표</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{formatTime(subject.dailyGoal)}</span>
                      </div>
                      <div className="bg-white/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen size={16} className="text-green-500" />
                          <span className="text-xs font-medium text-slate-600">주간 목표</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{subject.weeklyGoal}</span>
                      </div>
                      <div className="bg-white/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 size={16} className="text-purple-500" />
                          <span className="text-xs font-medium text-slate-600">목표 완료일</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {new Date(subject.targetCompletionDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {/* 챕터 세부사항 (확장 시) */}
                    {isExpanded && (
                      <div className="bg-white/30 rounded-xl p-4 mt-4">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <BookOpen size={16} />
                          챕터별 학습 현황
                        </h4>
                        <div className="space-y-3">
                          {subject.chapters.map(chapter => (
                            <div key={chapter.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                              <button
                                onClick={() => toggleChapter(subject.id, chapter.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  chapter.completed 
                                    ? `${colors.accent} border-transparent` 
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                {chapter.completed && <CheckCircle className="w-4 h-4 text-white" />}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium ${chapter.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {chapter.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {'★'.repeat(chapter.difficulty)}
                                  </span>
                                  {chapter.timeSpent > 0 && (
                                    <span className="text-xs text-slate-500">
                                      ({formatTime(chapter.timeSpent)})
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={chapter.memo}
                                  onChange={e => updateMemo(subject.id, chapter.id, e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-white/60 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  placeholder="학습 메모를 입력하세요..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 액션 버튼들 */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setSelectedSubject(subject);
                          setActiveTab('timer');
                        }}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                      >
                        <Play size={16} /> 학습 시작
                      </button>
                      <button
                        onClick={() => setShowGoalForm(true)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <Target size={16} /> 목표 설정
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubject(subject);
                          setActiveTab('analytics');
                        }}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={16} /> 분석
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement; 
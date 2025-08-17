import React, { useState } from 'react';
import { Target, Plus, X, Settings, CheckCircle, Calendar, Clock } from 'lucide-react';

// 모달 컴포넌트
const WeeklyGoalsModal = ({ 
  isOpen, 
  onClose, 
  studyPlans = [], 
  onPlansUpdate,
  currentWeek 
}) => {
  const [newPlan, setNewPlan] = useState({ 
    chapter: '', 
    pages: '', 
    week: `${currentWeek}주차`, 
    date: '', 
    days: [] 
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  React.useEffect(() => {
    if (isOpen) {
      setNewPlan({ 
        chapter: '', 
        pages: '', 
        week: `${currentWeek}주차`, 
        date: '', 
        days: [] 
      });
      setShowAddForm(false);
    }
  }, [isOpen, currentWeek]);

  const handleAddPlan = () => {
    if (!newPlan.chapter.trim()) return;
    
    const plan = {
      id: Date.now().toString(),
      chapter: newPlan.chapter,
      pages: newPlan.pages,
      week: newPlan.week,
      date: newPlan.date || new Date().toISOString().split('T')[0],
      days: newPlan.days,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    onPlansUpdate([...studyPlans, plan]);
    setNewPlan({ 
      chapter: '', 
      pages: '', 
      week: `${currentWeek}주차`, 
      date: '', 
      days: [] 
    });
    setShowAddForm(false);
  };

  const handleRemovePlan = (planId) => {
    onPlansUpdate(studyPlans.filter(plan => plan.id !== planId));
  };
  
  const handleToggleDay = (dayIndex) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex) 
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex]
    }));
  };

  const handleTogglePlanDay = (planId, dayIndex) => {
    onPlansUpdate(studyPlans.map(plan => {
      if (plan.id === planId) {
        const days = plan.days || [];
        const newDays = days.includes(dayIndex) 
          ? days.filter(d => d !== dayIndex)
          : [...days, dayIndex];
        return { ...plan, days: newDays };
      }
      return plan;
    }));
  };

  if (!isOpen) return null;

  // 주차별로 그룹화
  const plansByWeek = studyPlans.reduce((acc, plan) => {
    const week = plan.week || '1주차';
    if (!acc[week]) acc[week] = [];
    acc[week].push(plan);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">주간 학습 계획 관리</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* 계획 추가 버튼 */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">학습 계획 목록</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              계획 추가
            </button>
          </div>

          {/* 계획 추가 폼 */}
          {showAddForm && (
            <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">학습 내용</label>
                  <input
                    type="text"
                    value={newPlan.chapter}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="예: Chapter 1-3 완독"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">페이지 범위 (선택)</label>
                  <input
                    type="text"
                    value={newPlan.pages}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, pages: e.target.value }))}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="예: 1-50p"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1">주차</label>
                  <select
                    value={newPlan.week}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, week: e.target.value }))}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
                      <option key={week} value={`${week}주차`}>{week}주차</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">학습 예정일</label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleToggleDay(index)}
                        className={`
                          p-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${newPlan.days.includes(index)
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPlan}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 주차별 계획 목록 */}
          <div className="space-y-6">
            {Object.entries(plansByWeek).sort().map(([week, weekPlans]) => (
              <div key={week} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{week}</h4>
                <div className="space-y-4">
                  {weekPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        plan.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className={`font-semibold ${plan.completed ? 'text-green-700' : 'text-gray-900'}`}>
                            {plan.chapter}
                          </div>
                          {plan.pages && (
                            <div className={`text-sm ${plan.completed ? 'text-green-600' : 'text-gray-600'}`}>
                              {plan.pages}
                            </div>
                          )}
                          {plan.date && (
                            <div className={`text-xs ${plan.completed ? 'text-green-500' : 'text-gray-500'}`}>
                              {plan.date}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemovePlan(plan.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 주간 일정 설정 */}
                      <div>
                        <p className="text-sm text-gray-700 mb-2">학습 예정일</p>
                        <div className="grid grid-cols-7 gap-2">
                          {dayNames.map((day, index) => {
                            const isScheduled = (plan.days || []).includes(index);
                            return (
                              <button
                                key={index}
                                onClick={() => handleTogglePlanDay(plan.id, index)}
                                className={`
                                  p-2 rounded-lg text-sm font-medium transition-all duration-200
                                  ${isScheduled 
                                    ? 'bg-amber-500 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }
                                `}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {studyPlans.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">아직 설정된 학습 계획이 없습니다</p>
              <p className="text-sm">계획 추가 버튼을 클릭하여 새로운 계획을 만들어보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 주간 학습 목표 위젯 컴포넌트
const WeeklyGoalsWidget = ({ 
  studyPlans = [], 
  onStudyPlansUpdate,
  className = ""
}) => {
  const [showModal, setShowModal] = useState(false);
  
  // 현재 주차 계산 (기존 계획에서 가장 최근 주차를 찾거나 1주차 기본값)
  const getCurrentWeek = () => {
    if (studyPlans.length === 0) return 1;
    
    // 기존 계획에서 주차 정보 추출
    const weeks = studyPlans
      .filter(plan => plan.week)
      .map(plan => parseInt(plan.week.replace('주차', '')))
      .filter(week => !isNaN(week));
    
    return weeks.length > 0 ? Math.max(...weeks) : 1;
  };
  
  const currentWeek = getCurrentWeek();
  const currentWeekStr = `${currentWeek}주차`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date().getDay();

  // 현재 주차에 해당하는 계획만 필터링
  const currentWeekPlans = studyPlans.filter(plan => 
    plan.week === currentWeekStr || 
    (!plan.week && currentWeek === 1) // week 정보가 없는 기존 계획은 1주차로 간주
  );
  
  const handleToggleCompleted = (planId) => {
    const updatedPlans = studyPlans.map(plan => {
      if (plan.id === planId) {
        return { ...plan, completed: !plan.completed };
      }
      return plan;
    });
    onStudyPlansUpdate(updatedPlans);
  };

  // 완료된 계획 수 계산
  const completedPlans = currentWeekPlans.filter(plan => plan.completed).length;
  const totalPlans = currentWeekPlans.length;
  const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  // 오늘 학습 예정인 계획들
  const todayPlans = currentWeekPlans.filter(plan => 
    (plan.days || []).includes(today) && !plan.completed
  );

  return (
    <>
      <div className={`group p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900">주간 학습 목표</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/80 rounded-full text-sm font-bold text-amber-700">
              {currentWeekStr}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-white/60 rounded-lg transition-all duration-200"
              title="학습 계획 관리"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {currentWeekPlans.length === 0 ? (
            <div className="bg-white/60 border-2 border-dashed border-amber-200 rounded-xl p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-amber-400" />
              <p className="text-sm font-medium text-amber-600 mb-2">이번 주에 설정된 학습 계획이 없습니다</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold bg-white/80 hover:bg-white/90 px-3 py-2 rounded-lg transition-all duration-200"
              >
                + 계획 설정하기
              </button>
            </div>
          ) : (
            <>
              {/* 현재 주차 계획들 */}
              {currentWeekPlans.slice(0, 2).map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl p-4 transition-all duration-200 ${
                    plan.completed
                      ? 'bg-emerald-100/80 border border-emerald-200'
                      : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 border border-white/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className={`font-bold text-sm mb-1 ${plan.completed ? 'text-emerald-700' : 'text-amber-900'}`}>
                        {plan.chapter}
                      </div>
                      {plan.pages && (
                        <div className={`text-xs ${plan.completed ? 'text-emerald-600' : 'text-amber-700'}`}>
                          {plan.pages}
                        </div>
                      )}
                      {plan.date && (
                        <div className={`text-xs ${plan.completed ? 'text-emerald-500' : 'text-amber-600'}`}>
                          {plan.date}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleCompleted(plan.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        plan.completed
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-400 hover:shadow-sm'
                      }`}
                    >
                      {plan.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-current" />
                      )}
                    </button>
                  </div>

                  {/* 주간 학습 일정 표시 */}
                  {plan.days && plan.days.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-amber-600 mb-2 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        학습 예정일
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {dayNames.map((day, index) => {
                          const isScheduled = plan.days.includes(index);
                          const isToday = index === today;
                          
                          return (
                            <div key={index} className="text-center">
                              <div className="text-xs text-amber-600 mb-1 font-medium">{day}</div>
                              <div
                                className={`
                                  w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-all duration-200 text-xs
                                  ${!isScheduled 
                                    ? 'bg-white/50 text-amber-300' 
                                    : plan.completed
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : isToday
                                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                                        : 'bg-amber-200 text-amber-700'
                                  }
                                `}
                              >
                                {!isScheduled ? (
                                  '·'
                                ) : plan.completed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : isToday ? (
                                  '!'
                                ) : (
                                  '○'
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 추가 계획이 있을 때 */}
              {currentWeekPlans.length > 2 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 border border-dashed border-amber-300"
                >
                  + {currentWeekPlans.length - 2}개 계획 더 보기
                </button>
              )}

              {/* 오늘의 학습 목표 */}
              {todayPlans.length > 0 && (
                <div className="bg-amber-100/80 backdrop-blur-sm rounded-xl p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">오늘의 학습 목표</span>
                  </div>
                  <div className="space-y-1">
                    {todayPlans.slice(0, 2).map(plan => (
                      <div key={plan.id} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span className="text-xs text-amber-700 font-medium">{plan.chapter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 주간 진행률 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-amber-700 font-medium">이번 주 진행률</span>
                  <span className="font-bold text-amber-800">
                    {completedPlans} / {totalPlans} 개 완료 ({completionRate}%)
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 모달 */}
      <WeeklyGoalsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        studyPlans={studyPlans}
        onPlansUpdate={onStudyPlansUpdate}
        currentWeek={currentWeek}
      />
    </>
  );
};

export default WeeklyGoalsWidget;
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Target, CheckCircle, Calendar, X } from 'lucide-react';

const StudyProgressView = ({ 
  textbookData, 
  currentPage, 
  totalPages, 
  studyTimer, 
  isStudying, 
  highlights, 
  allNotes,
  plan = [],
  onPlanUpdate
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [todayPlan, setTodayPlan] = useState(null);
  const [completedChapters, setCompletedChapters] = useState([]);

  // 학습 계획 데이터 처리 - useMemo로 메모이제이션
  const studyPlan = useMemo(() => plan || [], [plan]);
  const totalStudyTime = studyTimer || 0;
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0];
  
  // 오늘의 학습 계획 찾기
  useEffect(() => {
    const todayPlanData = studyPlan.find(p => p.date === today);
    setTodayPlan(todayPlanData);
  }, [studyPlan, today]);

  // 완료된 챕터 계산
  useEffect(() => {
    const completed = studyPlan.filter(p => p.completed).map(p => p.chapter);
    setCompletedChapters(completed);
  }, [studyPlan]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분 ${secs}초`;
  };

  const handleCompleteChapter = (chapterId) => {
    if (window.confirm('이 챕터를 완료로 표시하시겠습니까?')) {
      const updatedPlan = studyPlan.map(p => 
        p.id === chapterId ? { ...p, completed: true, completedAt: new Date().toISOString() } : p
      );
      onPlanUpdate(updatedPlan);
    }
  };

  return (
    <div className="max-w p-6 space-y-6">
      {/* 학습 계획 알림 */}
      {todayPlan && !todayPlan.completed && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">오늘의 학습 계획</h4>
                <p className="text-sm text-blue-700">{todayPlan.chapter} - {todayPlan.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleCompleteChapter(todayPlan.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>완료</span>
            </button>
          </div>
        </div>
      )}

      {/* 전체 진도 현황 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">학습 현황</h3>
                <p className="text-white/80 text-sm">꾸준한 학습이 성공의 열쇠입니다</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(totalStudyTime)}</div>
              <div className="text-white/80 text-sm">총 학습 시간</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>전체 진도율</span>
              </span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500 ease-out shadow-sm" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>
        </div>
        
        {/* 통계 카드들 */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600">{completedChapters.length}</div>
              <div className="text-sm text-gray-600">완료한 챕터</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{allNotes?.length || 0}</div>
              <div className="text-sm text-gray-600">작성한 노트</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{highlights?.length || 0}</div>
              <div className="text-sm text-gray-600">하이라이트</div>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 계획 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">학습 계획</h3>
                <p className="text-sm text-gray-600">체계적인 학습으로 목표를 달성하세요</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {studyPlan.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">학습 계획이 없습니다</h4>
              <p className="text-gray-600 mb-4">체계적인 학습을 위해 계획을 세워보세요</p>
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                첫 번째 계획 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {studyPlan.map((planItem) => (
                <div
                  key={planItem.id}
                  className={`p-4 rounded-xl border transition-all ${
                    planItem.completed 
                      ? 'bg-green-50 border-green-200' 
                      : planItem.date === today
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {planItem.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Target className="w-5 h-5 text-blue-600" />
                        )}
                        <h4 className="font-medium text-gray-900">{planItem.chapter}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          planItem.completed 
                            ? 'bg-green-100 text-green-700'
                            : planItem.date === today
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {planItem.completed ? '완료' : planItem.date === today ? '오늘' : planItem.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{planItem.description}</p>
                    </div>
                    {!planItem.completed && planItem.date === today && (
                      <button
                        onClick={() => handleCompleteChapter(planItem.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        완료
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 학습 계획 모달 */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">학습 계획 추가</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">챕터</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: Chapter 1 - JavaScript 기초"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  placeholder="학습할 내용을 간단히 설명하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 날짜</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학습 완료 모달 */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">오늘의 학습 완료!</h3>
              <p className="text-gray-600 mb-6">
                {formatTime(totalStudyTime)} 동안 열심히 학습하셨네요.<br/>
                내일도 화이팅하세요!
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>학습 시간</span>
                  <span className="font-medium">{formatTime(totalStudyTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>작성한 노트</span>
                  <span className="font-medium">{allNotes?.length || 0}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>하이라이트</span>
                  <span className="font-medium">{highlights?.length || 0}개</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowProgressModal(false)}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyProgressView; 
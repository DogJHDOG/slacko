import React from 'react';
import { BookOpen, TrendingUp, Clock, Flame, Activity, Target, Zap } from 'lucide-react';

const StudyDashboard = ({ 
  subjects, 
  studyLogs,
  goals,
  getProgress, 
  formatTime, 
  getTotalStudyTime, 
  getCompletionRate, 
  getCurrentStreak,
  getTodayRecommendations,
  updateStudyTime,
  updateGoalProgress
}) => {
  const recommendations = getTodayRecommendations();
  const today = new Date().toISOString().split('T')[0];

  const colorMap = {
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      accent: 'bg-gradient-to-r from-blue-500 to-blue-600',
      light: 'bg-blue-100',
      ring: 'ring-blue-500'
    },
    green: { 
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      accent: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      light: 'bg-emerald-100',
      ring: 'ring-emerald-500'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
      border: 'border-purple-200', 
      text: 'text-purple-700', 
      accent: 'bg-gradient-to-r from-purple-500 to-purple-600',
      light: 'bg-purple-100',
      ring: 'ring-purple-500'
    }
  };

  const categoryMap = {
    major: { name: '전공', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    project: { name: '프로젝트', color: 'bg-green-100 text-green-800', icon: TrendingUp },
    certificate: { name: '자격증', color: 'bg-purple-100 text-purple-800', icon: Flame }
  };

  // 오늘의 학습 기록
  const todayLogs = studyLogs.filter(log => log.date === today);
  const todayTotalTime = todayLogs.reduce((total, log) => total + log.duration, 0);

  // 목표 진행률 계산
  const getGoalProgress = (goal) => {
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
  };

  return (
    <div className="space-y-8">
      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{subjects.length}</h3>
              <p className="text-sm text-slate-600">진행중인 과목</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{getCompletionRate()}%</h3>
              <p className="text-sm text-slate-600">전체 진도율</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{formatTime(getTotalStudyTime())}</h3>
              <p className="text-sm text-slate-600">총 학습 시간</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{getCurrentStreak()}</h3>
              <p className="text-sm text-slate-600">연속 학습일</p>
            </div>
          </div>
        </div>
      </div>

      {/* 오늘의 추천 학습 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Zap className="text-yellow-500" size={24} />
          🎯 오늘의 추천 학습
        </h2>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => {
              const subject = subjects.find(s => s.id === rec.subjectId);
              const colors = colorMap[subject.color];
              
              return (
                <div key={rec.subjectId} className={`${colors.bg} rounded-xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryMap[subject.category].color}`}>
                      {categoryMap[subject.category].name}
                    </span>
                    <span className="text-xs text-slate-500">우선순위 {rec.priority}</span>
                  </div>
                  <h3 className={`font-semibold ${colors.text} mb-2`}>{rec.subjectName}</h3>
                  <p className="text-sm text-slate-600 mb-3">{rec.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>예상 시간: {subject.dailyGoal}분</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">오늘의 학습 완료!</h3>
            <p className="text-slate-500">모든 과목을 오늘 학습했습니다.</p>
          </div>
        )}
      </div>

      {/* 오늘의 목표 진행률 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Target className="text-red-500" size={24} />
          📊 오늘의 목표 진행률
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = getGoalProgress(goal);
            const isDaily = goal.type === 'daily';
            const isWeekly = goal.type === 'weekly';
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{goal.description}</span>
                  <span className="text-sm text-slate-500">{goal.current}/{goal.target}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isDaily ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      isWeekly ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {isDaily ? '오늘' : isWeekly ? '이번 주' : '이번 달'}
                  </span>
                  <span className="font-medium text-slate-700">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오늘의 학습 기록 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Activity className="text-green-500" size={24} />
          📝 오늘의 학습 기록
        </h2>
        {todayLogs.length > 0 ? (
          <div className="space-y-4">
            {todayLogs.map(log => {
              const subject = subjects.find(s => s.id === log.subjectId);
              const chapter = subject?.chapters.find(c => c.id === log.chapterId);
              const colors = colorMap[subject.color];
              
              return (
                <div key={log.id} className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${colors.text}`}>{subject.name}</h4>
                    <span className="text-sm text-slate-600">{formatTime(log.duration)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{chapter?.name}</p>
                  <p className="text-xs text-slate-500">{log.content}</p>
                </div>
              );
            })}
            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Clock size={16} />
                오늘 총 학습 시간: {formatTime(todayTotalTime)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">아직 오늘 학습 기록이 없습니다</h3>
            <p className="text-slate-500">학습 타이머를 사용해서 학습을 시작해보세요!</p>
          </div>
        )}
      </div>

      {/* 학습 현황 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Activity className="text-green-500" size={24} />
          📈 학습 현황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const progress = getProgress(subject);
            const colors = colorMap[subject.color];
            const CategoryIcon = categoryMap[subject.category].icon;
            
            return (
              <div key={subject.id} className={`${colors.bg} rounded-xl p-6 border ${colors.border} shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CategoryIcon size={20} className={colors.text} />
                    <h3 className={`font-semibold ${colors.text}`}>{subject.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryMap[subject.category].color}`}>
                    {categoryMap[subject.category].name}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">진도율</span>
                    <span className={`text-sm font-semibold ${colors.text}`}>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div 
                      className={`${colors.accent} h-2 rounded-full transition-all duration-500`} 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{subject.completedChapters}/{subject.totalChapters} 챕터</span>
                    <span>{formatTime(subject.totalStudyTime)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard; 
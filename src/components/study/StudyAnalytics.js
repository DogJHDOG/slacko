import React from 'react';
import { PieChart, TrendingUp, Award, Flame, BookOpen, Zap } from 'lucide-react';

const StudyAnalytics = ({ 
  subjects, 
  getProgress, 
  formatTime, 
  getTotalStudyTime, 
  getCompletionRate, 
  getCurrentStreak 
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

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <PieChart className="text-indigo-500" size={24} />
          학습 진도 분석
        </h2>

        {/* 분석 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-blue-800">학습 효율성</h3>
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {Math.round((getTotalStudyTime() / subjects.length) / 60 * 10) / 10}h
            </div>
            <p className="text-sm text-blue-600">과목당 평균 학습시간</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Award size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-green-800">완료율</h3>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">{getCompletionRate()}%</div>
            <p className="text-sm text-green-600">전체 챕터 완료율</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Flame size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-purple-800">학습 일관성</h3>
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">{getCurrentStreak()}일</div>
            <p className="text-sm text-purple-600">연속 학습 기록</p>
          </div>
        </div>

        {/* 과목별 상세 분석 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">과목별 상세 분석</h3>
          {subjects.map(subject => {
            const colors = colorMap[subject.color];
            const progress = getProgress(subject);
            const avgTimePerChapter = subject.completedChapters > 0 
              ? Math.round(subject.totalStudyTime / subject.completedChapters) 
              : 0;
            
            return (
              <div key={subject.id} className={`${colors.bg} rounded-xl p-6 border ${colors.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${colors.text}`}>{subject.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryMap[subject.category].color}`}>
                    {categoryMap[subject.category].name}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${colors.text}`}>{progress}%</div>
                    <div className="text-sm text-slate-600">진도율</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${colors.text}`}>{formatTime(subject.totalStudyTime)}</div>
                    <div className="text-sm text-slate-600">총 학습시간</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${colors.text}`}>{avgTimePerChapter}분</div>
                    <div className="text-sm text-slate-600">챕터당 평균</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${colors.text}`}>{subject.currentStreak}일</div>
                    <div className="text-sm text-slate-600">연속 학습</div>
                  </div>
                </div>

                {/* 챕터별 시간 분석 */}
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-700">챕터별 학습 시간</h5>
                  {subject.chapters.filter(ch => ch.completed).map(chapter => (
                    <div key={chapter.id} className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                      <span className="text-sm text-slate-700">{chapter.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatTime(chapter.timeSpent)}</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`${colors.accent} h-2 rounded-full`}
                            style={{ 
                              width: `${Math.min(100, (chapter.timeSpent / Math.max(...subject.chapters.map(c => c.timeSpent))) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyAnalytics; 
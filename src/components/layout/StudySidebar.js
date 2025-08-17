// StudySidebar.js - 학습 모드 전용 사이드바
import { useState, useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  NotebookPen,
  Sparkles,
  Menu,
  ChevronsLeft,
  Timer,
  Target,
  Zap,
  ArrowLeft,
  Focus
} from 'lucide-react';

const StudySidebar = ({ 
  isCollapsed, 
  onToggle, 
  activeView, 
  onViewChange, 
  textbookId, 
  studyTimer, 
  setStudyTimer,
  // isStudying,
  // setIsStudying 
}) => {
  // 목표 시간 (초 단위)
  const [targetTime] = useState(2 * 60 * 60); // 2시간

  const studyNavItems = [
    { 
      id: 'content', 
      label: '원서 본문', 
      icon: BookOpen, 
      path: 'content', 
      color: 'emerald',
      description: '교재 내용 학습'
    },
    { 
      id: 'notes', 
      label: '노트', 
      icon: NotebookPen, 
      path: 'notes', 
      color: 'amber',
      description: '학습 노트 작성'
    },
    { 
      id: 'progress', 
      label: '학습 현황', 
      icon: BarChart3, 
      path: 'progress', 
      color: 'violet',
      description: '진도 및 성과 확인'
    },
  ];

  // 학습 상태 관리
  const [isStudying, setIsStudying] = useState(true);

  // 자동 학습 시간 측정 - 페이지 포커스 기반
  useEffect(() => {
    let interval;
    let isPageVisible = true;
    
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      setIsStudying(!document.hidden);
    };
    
    const handleFocus = () => {
      isPageVisible = true;
      setIsStudying(true);
    };
    
    const handleBlur = () => {
      isPageVisible = false;
      setIsStudying(false);
    };

    // 초기 상태 설정
    setIsStudying(!document.hidden);

    // 자동 시간 측정 - 페이지가 보이는 상태일 때만 측정
    interval = setInterval(() => {
      if (isPageVisible) {
        setStudyTimer(prev => prev + 1);
      }
    }, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setStudyTimer]);

  const getColorClasses = (color, isActive = false) => {
    if (isCollapsed && !isActive) return 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50';
    
    const colors = {
      emerald: isActive 
        ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400 shadow-lg shadow-emerald-500/20' 
        : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-md hover:shadow-emerald-500/10',
      amber: isActive 
        ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400 shadow-lg shadow-amber-500/20' 
        : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 hover:shadow-md hover:shadow-amber-500/10',
      violet: isActive 
        ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-400 shadow-lg shadow-violet-500/20' 
        : 'text-slate-300 hover:text-violet-300 hover:bg-violet-500/10 hover:shadow-md hover:shadow-violet-500/10',
    };
    return colors[color] || colors.emerald;
  };

  const getIconBgClass = (color, isActive) => {
    const classes = {
      emerald: isActive ? 'bg-emerald-400/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      amber: isActive ? 'bg-amber-400/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      violet: isActive ? 'bg-violet-400/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
    };
    return classes[color] || classes.emerald;
  };

  const getZapClass = (color) => {
    const classes = {
      emerald: 'text-emerald-400',
      amber: 'text-amber-400',
      violet: 'text-violet-400',
    };
    return classes[color] || classes.emerald;
  };

  const getDotClass = (color) => {
    const classes = {
      emerald: 'bg-emerald-400',
      amber: 'bg-amber-400',
      violet: 'bg-violet-400',
    };
    return classes[color] || classes.emerald;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // 진행률 계산
  const progressPercentage = Math.min((studyTimer / targetTime) * 100, 100);

  return (
    <div className={`bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50 transition-all duration-300 flex flex-col flex-shrink-0 relative
      ${isCollapsed ? 'w-16' : 'w-64'}`}>
      
      {/* Header - Focus Mode */}
      <div className="p-4 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg relative">
                <Sparkles size={16} className="text-white" />
                {isStudying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Focus Mode</h1>
                <p className="text-xs text-emerald-300 -mt-0.5 flex items-center gap-1">
                  <Focus size={10} />
                  {isStudying ? '집중 학습 중' : '집중 학습 환경'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg mx-auto relative">
              <Sparkles size={16} className="text-white" />
              {isStudying && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
          
          {!isCollapsed && (
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <ChevronsLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 자동 집중 타이머 - 강화된 UI */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-800/30">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/20 transition-all duration-300">
                  <Timer size={16} className="text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white">학습 시간</span>
              </div>
              <div className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>측정 중</span>
                </div>
              </div>
            </div>
            
            {/* 실시간 시간 표시 - 더 큰 폰트와 애니메이션 */}
            <div className="text-3xl font-bold mb-2 text-white transition-all duration-300">
              {formatTime(studyTimer)}
              <span className="text-lg text-emerald-300 ml-2 animate-pulse">●</span>
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${progressPercentage >= 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            
            {/* 목표 시간과 진행률 */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>목표: {formatTime(targetTime)}</span>
              <span className={progressPercentage >= 100 ? 'text-emerald-300 font-medium' : ''}>
                {Math.round(progressPercentage)}% 완료
              </span>
            </div>
            
            {/* 목표 달성 메시지 */}
            {progressPercentage >= 100 && (
              <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="text-xs text-emerald-300 font-medium animate-pulse flex items-center gap-2">
                  <span>🎉</span>
                  <span>목표 달성! 훌륭합니다!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-1.5 overflow-y-auto">
        <div className="space-y-2">
          {studyNavItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative
                  ${getColorClasses(item.color, isActive)}
                  ${isActive ? 'transform scale-[1.02]' : 'hover:transform hover:scale-[1.01]'}
                `}
              >
                <div className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                  getIconBgClass(item.color, isActive)
                } ${isCollapsed ? 'mx-auto' : ''}`}>
                  <item.icon size={16} />
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="flex items-center gap-1">
                          <Zap size={12} className={`animate-pulse ${getZapClass(item.color)}`} />
                          <div className={`w-2 h-2 rounded-full animate-pulse ${getDotClass(item.color)}`}></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    {/* 컨텐츠 뷰일 때 자동 측정 표시 */}
                    {item.id === 'content' && isActive && isStudying && (
                      <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        자동 시간 측정 중
                      </p>
                    )}
                  </div>
                )}
                
                {isCollapsed && isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-l-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Study Stats */}
        {!isCollapsed && (
          <>
            <div className="my-6 border-t border-slate-800/50"></div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">실시간 통계</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-blue-400" />
                    <span className="text-sm text-slate-300">오늘 목표</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    progressPercentage >= 100 ? 'text-emerald-300' : 'text-blue-300'
                  }`}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-sm text-slate-300">집중 시간</span>
                  </div>
                  <span className="text-sm font-medium flex items-center gap-1 text-amber-300">
                    {formatTime(studyTimer)}
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Back to Main & Collapse Button */}
      <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg transition-all duration-200 text-sm font-medium">
              <ArrowLeft size={14} />
              메인으로
            </button>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="w-full p-2.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
          >
            <Menu size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudySidebar;
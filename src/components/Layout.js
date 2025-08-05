// Layout.js - 스크롤 문제가 해결된 레이아웃 컴포넌트
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FolderOpen, 
  Calendar, 
  Book, 
  Menu, 
  ChevronsLeft,
  BarChart3,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import FloatingCalender from './FloatingCalender';

const studyNavItems = [
  { id: 'content', label: '원서 본문', icon: BookOpen, path: 'content', color: 'emerald' },
  { id: 'notes', label: '노트', icon: NotebookPen, path: 'notes', color: 'amber' },
  { id: 'progress', label: '학습 현황', icon: BarChart3, path: 'progress', color: 'violet' },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // 일반 nav용
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 학습 nav용
  const [activeView, setActiveView] = useState('content'); // 학습 nav용
  const location = useLocation();
  // /textbook/:id/study(및 하위) 경로 감지
  const isStudyPage = /^\/textbook\/[^/]+\/study/.test(location.pathname);
  // id 추출 (학습 nav 링크용)
  let id = null;
  if (isStudyPage) {
    const match = location.pathname.match(/^\/textbook\/(\w+)\/study/);
    id = match ? match[1] : null;
  }

  // 기존 메뉴
  const mainMenuItems = [
    {
      id: 'dashboard',
      title: '대시보드',
      icon: Home,
      path: '/dashboard',
      exact: true,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'study',
      title: '학습 관리',
      icon: BookOpen,
      path: '/study',
      subPaths: ['/study/:id'],
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'project',
      title: '프로젝트 관리',
      icon: FolderOpen,
      path: '/project',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'textbook',
      title: '원서 관리',
      icon: Book,
      path: '/textbook',
      color: 'blue',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'calendar',
      title: '학습 캘린더',
      icon: Calendar,
      path: '/calendar',
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500'
    },
  ];

  // 학습 nav 클릭 시 activeView 변경
  const handleStudyNavClick = (item) => {
    setActiveView(item.id);
  };

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-600',
      emerald: isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'hover:bg-emerald-50 hover:text-emerald-600',
      violet: isActive ? 'bg-violet-50 text-violet-700 border-violet-200' : 'hover:bg-violet-50 hover:text-violet-600',
      orange: isActive ? 'bg-orange-50 text-orange-700 border-orange-200' : 'hover:bg-orange-50 hover:text-orange-600',
      pink: isActive ? 'bg-pink-50 text-pink-700 border-pink-200' : 'hover:bg-pink-50 hover:text-pink-600',
      amber: isActive ? 'bg-amber-50 text-amber-700 border-amber-200' : 'hover:bg-amber-50 hover:text-amber-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* 사이드바 */}
      <div className={`bg-white/80 shadow-xl border-r border-slate-200/60 transition-all duration-500 flex flex-col flex-shrink-0
        ${isStudyPage ? (sidebarCollapsed ? 'w-16' : 'w-72') : (sidebarOpen ? 'w-72' : 'w-16')}`}>
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            {((isStudyPage && !sidebarCollapsed) || (!isStudyPage && sidebarOpen)) && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                  {isStudyPage ? (
                    <Sparkles size={18} className="text-white" />
                  ) : (
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    {isStudyPage ? 'Focus Mode' : 'Slacko'}
                  </h1>
                  {isStudyPage && (
                    <p className="text-sm text-slate-500 -mt-0.5">집중 학습 환경</p>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => isStudyPage ? setSidebarCollapsed(!sidebarCollapsed) : setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md group"
            >
              {(isStudyPage ? sidebarCollapsed : !sidebarOpen) ? (
                <Menu size={18} className="text-slate-600 group-hover:text-slate-800 transition-colors" />
              ) : (
                <ChevronsLeft size={18} className="text-slate-600 group-hover:text-slate-800 transition-colors" />
              )}
            </button>
          </div>
        </div>
        {/* nav 영역 */}
        <nav className="flex-1 p-2 space-y-2 overflow-y">
          {isStudyPage && id ? (
            <div className="space-y-2">
              {studyNavItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleStudyNavClick(item)}
                    className={`group flex items-center gap-3 px-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full text-left relative
                      ${getColorClasses(item.color, isActive)}
                      ${isActive ? 'shadow-sm border transform scale-[1.02]' : 'text-slate-700 hover:transform hover:scale-[1.01]'}
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? `bg-${item.color}-100` : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                      <item.icon size={16} />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500 animate-pulse`}></div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {mainMenuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                    className={`group flex items-center gap-3 px-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                      ${getColorClasses(item.color, isActive)}
                      ${isActive ? 'shadow-md border transform scale-[1.02]' : 'text-slate-700 hover:transform hover:scale-[1.01]'}
                    `}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10`}></div>
                    )}
                    <div className={`relative p-2 rounded-lg ${isActive ? `bg-${item.color}-100` : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors z-10`}>
                      <item.icon size={16} />
                    </div>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 relative z-10">{item.title}</span>
                        {isActive && (
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.gradient} animate-pulse z-10`}></div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
            </div>
          )}
        </nav>
        {/* 캘린더 등 부가 영역 */}
        <div className="px-2 pb-4">
          {!isStudyPage && <FloatingCalender />}
          </div>
      </div>
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
          <Outlet context={{ 
            activeView, 
            sidebarOpen: isStudyPage ? !sidebarCollapsed : sidebarOpen,
            sidebarCollapsed: isStudyPage ? sidebarCollapsed : !sidebarOpen
          }} key={location.pathname} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
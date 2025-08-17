// Sidebar.js - 메인 사이드바 컴포넌트
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FolderOpen, 
  Calendar, 
  Book, 
  Menu, 
  ChevronsLeft,
  Settings,
  User,
  Search,
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

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
      color: 'orange',
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

  const getColorClasses = (color, isActive = false) => {
    if (!isOpen && !isActive) return 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50';
    
    const colors = {
      blue: isActive ? 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-400' : 'text-slate-300 hover:text-blue-300 hover:bg-blue-500/10',
      emerald: isActive ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400' : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10',
      violet: isActive ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-400' : 'text-slate-300 hover:text-violet-300 hover:bg-violet-500/10',
      orange: isActive ? 'bg-orange-500/20 text-orange-300 border-l-2 border-orange-400' : 'text-slate-300 hover:text-orange-300 hover:bg-orange-500/10',
      pink: isActive ? 'bg-pink-500/20 text-pink-300 border-l-2 border-pink-400' : 'text-slate-300 hover:text-pink-300 hover:bg-pink-500/10',
    };
    return colors[color] || colors.blue;
  };

  const getIconBgClass = (color, isActive) => {
    if (!isOpen) return 'bg-slate-700/50';
    const classes = {
      blue: isActive ? 'bg-blue-100' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      emerald: isActive ? 'bg-emerald-100' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      violet: isActive ? 'bg-violet-100' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      orange: isActive ? 'bg-orange-100' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
      pink: isActive ? 'bg-pink-100' : 'bg-slate-700/50 group-hover:bg-slate-600/50',
    };
    return classes[color] || classes.blue;
  };

  const getDotClass = (color) => {
    const classes = {
      blue: 'bg-blue-400',
      emerald: 'bg-emerald-400',
      violet: 'bg-violet-400',
      orange: 'bg-orange-400',
      pink: 'bg-pink-400',
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className={`bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50 transition-all duration-300 flex flex-col flex-shrink-0 relative
      ${isOpen ? 'w-64' : 'w-16'}`}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Slacko</h1>
                <p className="text-xs text-slate-400 -mt-0.5">학습 관리 플랫폼</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg mx-auto">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          )}
          
          {isOpen && (
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <ChevronsLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isOpen && (
        <div className="p-4 border-b border-slate-800/30">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="검색..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-400 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
            {searchFocused && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs text-slate-400 bg-slate-700 rounded">⌘K</kbd>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-1.5 overflow-y-auto">
        <div className="space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                  ${getColorClasses(item.color, isActive)}
                  ${isActive ? 'transform scale-[1.02]' : 'hover:transform hover:scale-[1.01]'}
                `}
              >
                <div className={`flex-shrink-0 ${isOpen ? '' : 'mx-auto'}`}>
                  <div className={`p-2 rounded-lg transition-colors ${getIconBgClass(item.color, isActive)}`}>
                    <item.icon size={18} />
                  </div>
                </div>
                {isOpen && (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    {isActive && (
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getDotClass(item.color)}`}></div>
                    )}
                  </>
                )}
                {!isOpen && isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">사용자</p>
              <p className="text-xs text-slate-400">온라인</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200">
              <Settings size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="w-full p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
          >
            <Menu size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
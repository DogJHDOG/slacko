// Layout.js - 업데이트된 레이아웃 컴포넌트
import { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import StudySidebar from '../components/layout/StudySidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // 일반 사이드바용 - 기본값 false로 변경
  const [studySidebarCollapsed, setStudySidebarCollapsed] = useState(true); // 학습 사이드바용 - 기본값 true로 변경
  const [activeView, setActiveView] = useState('content'); // 학습 nav용
  const location = useLocation();

  // /textbook/:id/study(및 하위) 경로 감지
  const isStudyPage = /^\/textbook\/[^/]+\/study/.test(location.pathname);
  
  // id 추출 (학습 nav 링크용)
  let textbookId = null;
  if (isStudyPage) {
    const match = location.pathname.match(/^\/textbook\/(\w+)\/study/);
    textbookId = match ? match[1] : null;
  }

  // 사이드바 토글 핸들러
  const handleSidebarToggle = () => {
    if (isStudyPage) {
      setStudySidebarCollapsed(!studySidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // 학습 뷰 변경 핸들러
  const handleViewChange = (viewId) => {
    setActiveView(viewId);
  };

  // 학습 타이머 상태 관리
  const [studyTimer, setStudyTimer] = useState(0);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* 사이드바 - 조건부 렌더링 */}
      {isStudyPage ? (
        <StudySidebar
          isCollapsed={studySidebarCollapsed}
          onToggle={handleSidebarToggle}
          activeView={activeView}
          onViewChange={handleViewChange}
          textbookId={textbookId}
          studyTimer={studyTimer}
          setStudyTimer={setStudyTimer}
        />
      ) : (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
          <Outlet 
            context={{ 
              activeView, 
              sidebarOpen: isStudyPage ? !studySidebarCollapsed : sidebarOpen,
              sidebarCollapsed: isStudyPage ? studySidebarCollapsed : !sidebarOpen,
              isStudyMode: isStudyPage,
              studyTimer,
              setStudyTimer
            }} 
            key={location.pathname} 
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
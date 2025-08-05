import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/index';
import StudyManagementSystem from './pages/StudyManagement/index';
import TextbookDetailPage from './pages/TextbookDetail/index';
import TextbookStudyPage from './pages/TextbookStudy/index';
import Layout from './components/Layout';
import NotFound from './components/Notfound';
import OnboardingLanding from './pages/Onboarding';
import TextbookManagementSystem from './pages/TextbookManagement/index';
import AddTextbook from './pages/TextbookManagement/AddTextbook';

// 프로젝트 관리, 학습 캘린더 임시 컴포넌트 import
import ProjectManagementPage from './pages/ProjectManagement/index';
import StudyCalendarPage from './pages/StudyCalendar/index';

// Context import
import { ProjectProvider } from './context/ProjectContext';
import { StudyProvider } from './context/StudyContext';

// 임시 학습 하위 컴포넌트
const StudyContent = () => <div>원서 본문 내용</div>;
const StudyNotes = () => <div>노트 내용</div>;
const StudyConcepts = () => <div>개념 정리 내용</div>;
const StudyProgress = () => <div>학습 현황 내용</div>;
const StudyBookmarks = () => <div>북마크 내용</div>;

function App() {
  return (
    <StudyProvider>
      <ProjectProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/study" element={<StudyManagementSystem />} />
            <Route path="/textbook/:id" element={<TextbookDetailPage />} />
            <Route path="/textbook" element={<TextbookManagementSystem />} />
            <Route path="/textbook/add" element={<AddTextbook />} />
            <Route path="/textbook-study/:id" element={<TextbookStudyPage />} />
            <Route path="/project" element={<ProjectManagementPage />} />
            <Route path="/calendar" element={<StudyCalendarPage />} />
            
            {/* 원서 학습 중첩 라우트 */}
            <Route path="/textbook/:id/study" element={<TextbookStudyPage />}>
              <Route index element={<StudyContent />} />
              <Route path="content" element={<StudyContent />} />
              <Route path="notes" element={<StudyNotes />} />
              <Route path="concepts" element={<StudyConcepts />} />
              <Route path="progress" element={<StudyProgress />} />
              <Route path="bookmarks" element={<StudyBookmarks />} />
            </Route>
          </Route>
          {/* 기타 라우트 */}
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<OnboardingLanding />} />
        </Routes>
      </ProjectProvider>
    </StudyProvider>
  );
}

export default App;
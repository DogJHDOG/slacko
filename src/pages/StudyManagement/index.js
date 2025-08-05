import { useState } from 'react';
import {
  Plus, BookOpen, Trophy, Target,
  Clock, BarChart3, Timer, PieChart,
  BookMarked
} from 'lucide-react';
import StudyDashboard from '../../components/study/StudyDashboard';
import SubjectManagement from '../../components/study/SubjectManagement';
import StudyTimer from '../../components/study/StudyTimer';
import GoalSetting from '../../components/study/GoalSetting';
import StudyAnalytics from '../../components/study/StudyAnalytics';
import AddSubjectModal from '../../components/study/AddSubjectModal';
import GoalSettingModal from '../../components/study/GoalSettingModal';
import Toast from '../../components/common/Toast';
import { useStudyContext } from '../../context/StudyContext';

export default function StudyManagementSystem() {
  const {
    subjects,
    studyLogs,
    goals,
    getTodayRecommendations,
    updateStudyTime,
    updateGoalProgress,
    addSubject,
    setSubjects
  } = useStudyContext();

  // 메인 상태 관리
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());

  // 토스트 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // 유틸리티 함수들
  const getProgress = (subject) => {
    return Math.round((subject.completedChapters / subject.totalChapters) * 100);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const getTotalStudyTime = () => {
    return subjects.reduce((total, subject) => total + subject.totalStudyTime, 0);
  };

  const getCompletionRate = () => {
    const totalChapters = subjects.reduce((total, subject) => total + subject.totalChapters, 0);
    const completedChapters = subjects.reduce((total, subject) => total + subject.completedChapters, 0);
    return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  };

  const getCurrentStreak = () => {
    return Math.max(...subjects.map(s => s.currentStreak));
  };

  // 이벤트 핸들러들
  const toggleChapter = (subjectId, chapterId) => {
    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        const updatedChapters = subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            const newCompleted = !chapter.completed;
            return {
              ...chapter,
              completed: newCompleted,
              lastStudied: newCompleted ? new Date().toISOString().split('T')[0] : null
            };
          }
          return chapter;
        });
        
        const completedCount = updatedChapters.filter(ch => ch.completed).length;
        return {
          ...subject,
          chapters: updatedChapters,
          completedChapters: completedCount
        };
      }
      return subject;
    }));
  };

  const updateMemo = (subjectId, chapterId, memo) => {
    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        const updatedChapters = subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return { ...chapter, memo };
          }
          return chapter;
        });
        return { ...subject, chapters: updatedChapters };
      }
      return subject;
    }));
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddSubject = (newSubjectData) => {
    const newSubject = {
      ...newSubjectData,
      id: Date.now(),
      totalChapters: newSubjectData.chapters.length,
      completedChapters: 0,
      totalStudyTime: 0,
      currentStreak: 0,
      lastStudyDate: null,
      chapters: newSubjectData.chapters.map((name, index) => ({
        id: index + 1,
        name,
        completed: false,
        memo: '',
        timeSpent: 0,
        difficulty: 3,
        lastStudied: null
      }))
    };
    
    // Context의 addSubject 함수 호출
    addSubject(newSubject);
    showToastMessage('새 과목이 추가되었습니다!', 'success');
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 간단한 헤더 */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                학습 관리
              </h1>
                <p className="text-xs text-slate-600 mt-0.5">체계적인 학습으로 목표를 달성하세요!</p>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/50">
              <Trophy size={16} className="text-amber-500" />
                <span className="text-xs text-slate-600">{getCurrentStreak()}일 연속</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/50">
                <Clock size={16} className="text-blue-500" />
                <span className="text-xs text-slate-600">{formatTime(getTotalStudyTime())}</span>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <Plus size={18} /> 새 과목 추가
            </button>
          </div>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 탭 네비게이션 */}
          <div className="mb-8">
          <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-xl w-fit">
            {[
              { id: 'dashboard', name: '대시보드', icon: BarChart3 },
              { id: 'subjects', name: '과목 관리', icon: BookMarked },
              { id: 'timer', name: '학습 타이머', icon: Timer },
              { id: 'goals', name: '목표 설정', icon: Target },
              { id: 'analytics', name: '진도 분석', icon: PieChart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
            </div>
        </div>

        {/* 탭별 컨텐츠 */}
        {activeTab === 'dashboard' && (
          <StudyDashboard
            subjects={subjects}
            studyLogs={studyLogs}
            goals={goals}
            getProgress={getProgress}
            formatTime={formatTime}
            getTotalStudyTime={getTotalStudyTime}
            getCompletionRate={getCompletionRate}
            getCurrentStreak={getCurrentStreak}
            getTodayRecommendations={getTodayRecommendations}
            updateStudyTime={updateStudyTime}
            updateGoalProgress={updateGoalProgress}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManagement
            subjects={subjects}
            studyLogs={studyLogs}
            expandedSubjects={expandedSubjects}
            getProgress={getProgress}
            formatTime={formatTime}
            toggleChapter={toggleChapter}
            updateMemo={updateMemo}
            toggleSubjectExpansion={toggleSubjectExpansion}
            setSelectedSubject={setSelectedSubject}
            setActiveTab={setActiveTab}
            setShowGoalForm={setShowGoalForm}
            setShowAddForm={setShowAddForm}
            updateStudyTime={updateStudyTime}
          />
        )}

        {activeTab === 'timer' && (
          <StudyTimer
            subjects={subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            showToastMessage={showToastMessage}
            updateStudyTime={updateStudyTime}
            updateGoalProgress={updateGoalProgress}
          />
        )}

        {activeTab === 'goals' && (
          <GoalSetting
            subjects={subjects}
            goals={goals}
            showToastMessage={showToastMessage}
            updateGoalProgress={updateGoalProgress}
          />
        )}

        {activeTab === 'analytics' && (
          <StudyAnalytics
            subjects={subjects}
            studyLogs={studyLogs}
            goals={goals}
            getProgress={getProgress}
            formatTime={formatTime}
            getTotalStudyTime={getTotalStudyTime}
            getCompletionRate={getCompletionRate}
            getCurrentStreak={getCurrentStreak}
          />
        )}
      </div>

      {/* 모달들 */}
      <AddSubjectModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddSubject}
      />

      <GoalSettingModal
        open={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        showToastMessage={showToastMessage}
      />

      {/* 토스트 알림 */}
      <Toast open={showToast} type={toastType}>
        {toastMessage}
      </Toast>
    </div>
  );
} 
        
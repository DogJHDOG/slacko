import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Target, CheckCircle, Bell, BookOpen, TrendingUp, Flame, Calendar, Plus, Zap, Brain, Timer, BarChart3, BookMarked, CheckCircle2, Play, Pause, RotateCcw, Sparkles, Sun, Moon, Sunrise } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useProjectContext } from '../../context/ProjectContext';
import { useStudyContext } from '../../context/StudyContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjectContext();
  const { 
    subjects, 
    textbooks,
    studyLogs,
    goals,
    getTotalStudyTime, 
    getCompletionRate, 
    getCurrentStreak, 
    getWeeklyStudyData,
  } = useStudyContext();

  // 실제 데이터에서 Todo 목록 생성
  const [todoList, setTodoList] = useState([]);
  
  useEffect(() => {
    // 학습 과목과 프로젝트에서 할 일 생성
    const todos = [
      ...subjects.map(subject => ({
        id: `subject-${subject.id}`,
        text: `${subject.name} ${subject.completedChapters + 1}챕터 학습`,
        completed: subject.completedChapters === subject.totalChapters,
        priority: subject.priority || 'medium',
        type: 'study'
      })),
      ...projects.flatMap(project => 
        project.tasks?.map(task => ({
          id: `task-${task.id}`,
          text: `${project.name}: ${task.title}`,
          completed: task.status === 'completed',
          priority: task.priority || 'medium',
          type: 'project'
        })) || []
      ),
      ...textbooks.map(textbook => ({
        id: `textbook-${textbook.id}`,
        text: `${textbook.title} ${textbook.currentPage + 1}페이지 읽기`,
        completed: textbook.currentPage >= textbook.totalPages,
        priority: textbook.priority || 'medium',
        type: 'textbook'
      }))
    ];
    setTodoList(todos);
  }, [subjects, projects, textbooks]);

  // 모달 상태
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [newTodo, setNewTodo] = useState({ text: '', priority: 'medium' });

  // 토스트 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // 시간 기반 인사말
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: "늦은 밤이네요", icon: Moon, color: "text-indigo-600" };
    if (hour < 12) return { text: "좋은 아침입니다", icon: Sunrise, color: "text-orange-500" };
    if (hour < 18) return { text: "좋은 오후입니다", icon: Sun, color: "text-yellow-500" };
    return { text: "좋은 저녁입니다", icon: Moon, color: "text-purple-600" };
  };

  // 현재 시간 상태
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studyTimer, setStudyTimer] = useState({ isActive: false, seconds: 0, subject: null });
  const [showNotifications, setShowNotifications] = useState(false);

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 학습 타이머 효과
  useEffect(() => {
    let interval = null;
    if (studyTimer.isActive) {
      interval = setInterval(() => {
        setStudyTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyTimer.isActive]);

  // 유틸리티 함수들
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-400 to-green-600';
    if (progress >= 60) return 'from-blue-400 to-blue-600';
    if (progress >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getDaysUntilDeadline = (date) => {
    const today = new Date();
    const deadline = new Date(date);
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 실제 데이터 기반 통계
  const quickStats = {
    totalSubjects: subjects.length,
    totalProjects: projects.length,
    totalTextbooks: textbooks.length,
    totalStudyTime: Math.round(getTotalStudyTime() / 60),
    completionRate: getCompletionRate(),
    currentStreak: getCurrentStreak(),
    totalGoals: goals.length,
    completedGoals: goals.filter(goal => goal.progress >= 100).length
  };

  // 학습 과목 데이터
  const studySubjects = subjects.map(subject => ({
    id: `study-${subject.id}`,
    name: subject.name,
    description: `${subject.completedChapters}/${subject.totalChapters} 챕터 완료`,
    progress: Math.round((subject.completedChapters / subject.totalChapters) * 100),
    status: subject.completedChapters === subject.totalChapters ? 'completed' : 'in-progress',
    priority: subject.priority,
    color: subject.color,
    icon: '📚',
    type: 'study'
  }));

  // 프로젝트 데이터
  const currentProjects = projects.map(project => ({
    id: `project-${project.id}`,
    name: project.name,
    description: project.description,
    progress: project.progress || 0,
    status: project.status,
    priority: project.priority,
    color: project.color,
    icon: project.icon,
    type: 'project'
  }));

  // 학습 데이터
  const weeklyStudyData = getWeeklyStudyData();

  // 과목별 성과 데이터
  const subjectPerformance = subjects.map(subject => ({
    name: subject.name,
    progress: Math.round((subject.completedChapters / subject.totalChapters) * 100),
    studyTime: studyLogs
      .filter(log => log.subjectId === subject.id)
      .reduce((total, log) => total + log.duration, 0) / 60,
    color: subject.color || '#3b82f6'
  }));

  // 알림 데이터
  const notifications = [
    ...subjects.filter(subject => subject.completedChapters < subject.totalChapters)
      .map(subject => ({
        id: `subject-${subject.id}`,
        title: `${subject.name} 학습 필요`,
        message: `${subject.completedChapters + 1}챕터를 학습해주세요`,
        type: 'study',
        priority: subject.priority,
        time: '10분 전',
        urgent: subject.priority === 'high'
      })),
    ...projects.filter(project => project.status !== 'completed')
      .map(project => ({
        id: `project-${project.id}`,
        title: `${project.name} 진행 필요`,
        message: `프로젝트 진행률: ${project.progress || 0}%`,
        type: 'project',
        priority: project.priority,
        time: '1시간 전',
        urgent: project.priority === 'high'
      })),
    ...textbooks.filter(textbook => textbook.currentPage < textbook.totalPages)
      .map(textbook => ({
        id: `textbook-${textbook.id}`,
        title: `${textbook.title} 독서 필요`,
        message: `${textbook.currentPage + 1}페이지를 읽어주세요`,
        type: 'textbook',
        priority: textbook.priority,
        time: '2시간 전',
        urgent: textbook.priority === 'high'
      }))
  ];

  // 오늘의 추천 학습 (AI 기반)
  const getTodayRecommendations = () => {
    const currentHour = currentTime.getHours();
    const recommendations = [];

    // 아침 추천 (6-12시)
    if (currentHour >= 6 && currentHour < 12) {
      recommendations.push({
        type: 'study',
        title: '알고리즘 학습',
        reason: '아침 집중력이 높을 때 어려운 개념 학습',
        estimatedTime: '90분',
        priority: 'high',
        icon: Brain
      });
    }

    // 오후 추천 (12-18시)
    if (currentHour >= 12 && currentHour < 18) {
      recommendations.push({
        type: 'project',
        title: '캡스톤 프로젝트 진행',
        reason: '오후 시간대에 창작 활동 최적',
        estimatedTime: '120분',
        priority: 'high',
        icon: Zap
      });
    }

    // 저녁 추천 (18-22시)
    if (currentHour >= 18 && currentHour < 22) {
      recommendations.push({
        type: 'reading',
        title: 'Clean Code 읽기',
        reason: '저녁에 독서로 하루 마무리',
        estimatedTime: '30분',
        priority: 'medium',
        icon: BookOpen
      });
    }

    return recommendations;
  };

  // 마감일 데이터 (프로젝트 + 학습 과목 + 원서 학습)
  const upcomingDeadlines = [
    ...projects.flatMap(project => 
      project.tasks?.filter(task => task.dueDate && task.status !== 'completed')
        .map(task => ({
          id: `task-${task.id}`,
          title: `${project.name}: ${task.title}`,
          dueDate: task.dueDate,
          priority: task.priority,
          type: 'project-task'
        })) || []
    ),
    ...subjects.map(subject => ({
      id: `subject-${subject.id}`,
      title: `${subject.name} 완료`,
      dueDate: subject.targetCompletionDate,
      priority: subject.priority,
      type: 'study-subject'
    })),
    ...textbooks.map(textbook => ({
      id: `textbook-${textbook.id}`,
      title: `${textbook.title} 완료`,
      dueDate: textbook.targetDate,
      priority: textbook.priority,
      type: 'textbook'
    }))
  ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

  // 오늘의 추천 학습
  // 오늘의 추천사항 (현재 사용하지 않음)
  // const todayRecommendations = getTodayRecommendations();

  // Todo 핸들러들
  const handleAddTodo = () => {
    if (!newTodo.text.trim()) return;

    const todo = {
      id: Date.now(),
      text: newTodo.text,
      completed: false,
      priority: newTodo.priority,
      type: 'custom'
    };

    setTodoList(prev => [...prev, todo]);
    setNewTodo({ text: '', priority: 'medium' });
    setShowAddTodoModal(false);
    showToastMessage('새 할 일이 추가되었습니다!', 'success');
  };

  const handleQuickAdd = () => {
    if (!newTodo.text.trim()) return;

    const todo = {
      id: Date.now(),
      text: newTodo.text,
      completed: false,
      priority: 'medium',
      type: 'custom'
    };

    setTodoList(prev => [...prev, todo]);
    setNewTodo({ text: '', priority: 'medium' });
    setShowQuickAddModal(false);
    showToastMessage('할 일이 빠르게 추가되었습니다!', 'success');
  };

  const toggleTodo = (id) => {
    setTodoList(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    
    // 실제 데이터 업데이트 (커스텀 할 일만)
    const todo = todoList.find(t => t.id === id);
    if (todo && todo.type === 'custom') {
      showToastMessage(todo.completed ? '할 일을 완료 처리했습니다!' : '할 일을 미완료 처리했습니다!', 'success');
    }
  };

  // 할 일 삭제 (현재 사용하지 않음)
  // const deleteTodo = (id) => {
  //   const todo = todoList.find(t => t.id === id);
  //   if (todo && todo.type === 'custom') {
  //     setTodoList(prev => prev.filter(todo => todo.id !== id));
  //     showToastMessage('할 일이 삭제되었습니다.', 'success');
  //   } else {
  //     showToastMessage('시스템 할 일은 삭제할 수 없습니다.', 'error');
  //   }
  // };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 네비게이션 핸들러들
  const handleNavigateToStudy = () => {
    navigate('/study');
  };

  // 프로젝트 관리 페이지로 이동 (현재 사용하지 않음)
  // const handleNavigateToProject = () => {
  //   navigate('/project');
  // };

  const handleNavigateToTextbook = () => {
    navigate('/textbook');
  };

  const handleNavigateToCalendar = () => {
    navigate('/calendar');
  };

  const handleNavigateToTextbookDetail = (textbookId) => {
    navigate(`/textbook/${textbookId}`);
  };

  const handleNavigateToProjectDetail = (projectId) => {
    // 프로젝트 상세 페이지로 이동 (현재는 프로젝트 관리 페이지로)
    navigate('/project');
  };

  // 데이터 연결 상태 확인
  useEffect(() => {
    console.log('Dashboard Data Status:', {
      subjects: subjects.length,
      textbooks: textbooks.length,
      projects: projects.length,
      studyLogs: studyLogs.length,
      goals: goals.length,
      totalStudyTime: getTotalStudyTime(),
      completionRate: getCompletionRate(),
      currentStreak: getCurrentStreak()
    });
  }, [subjects, textbooks, projects, studyLogs, goals, getTotalStudyTime, getCompletionRate, getCurrentStreak]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 향상된 헤더 */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w mx-auto px-6 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {(() => {
                    const greeting = getTimeBasedGreeting();
                    const GreetingIcon = greeting.icon;
                    return (
                      <>
                        <GreetingIcon size={16} className={greeting.color} />
                        <span className="text-xs text-slate-600">{greeting.text}</span>
                      </>
                    );
                  })()}
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  대시보드
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentTime.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 빠른 통계 */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 rounded-lg border border-orange-200/50">
                  <Flame size={16} className="text-orange-500" />
                  <div className="text-right">
                    <div className="text-xs font-semibold text-orange-700">{quickStats.currentStreak}일</div>
                    <div className="text-xs text-orange-600">연속 학습</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200/50">
                  <Clock size={16} className="text-blue-500" />
                  <div className="text-right">
                    <div className="text-xs font-semibold text-blue-700">{Math.round(quickStats.totalStudyTime / 60)}h</div>
                    <div className="text-xs text-blue-600">총 학습</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200/50">
                  <Target size={16} className="text-green-500" />
                  <div className="text-right">
                    <div className="text-xs font-semibold text-green-700">{quickStats.completionRate}%</div>
                    <div className="text-xs text-green-600">완료율</div>
                  </div>
                </div>
              </div>

              {/* 알림 */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
                >
                  <Bell size={18} className="text-slate-600" />
                  {notifications.filter(n => n.urgent).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {notifications.filter(n => n.urgent).length}
                    </div>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {showNotifications && (
                  <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-900">알림</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 5).map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${notification.urgent ? 'bg-red-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              notification.type === 'study' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'project' ? 'bg-purple-100 text-purple-600' :
                              notification.type === 'textbook' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type === 'study' && <Brain size={16} />}
                              {notification.type === 'project' && <Zap size={16} />}
                              {notification.type === 'textbook' && <BookOpen size={16} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 font-medium">{notification.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 향상된 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={handleNavigateToStudy}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/25 cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <BookOpen size={28} className="text-blue-100" />
                <div className="text-right">
                  <div className="text-3xl font-bold">{quickStats.totalSubjects}</div>
                  <div className="text-blue-100 text-sm">학습 과목</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <TrendingUp size={16} />
                <span>진행중 {subjects.filter(s => s.completedChapters < s.totalChapters).length}개</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          </div>

          <div 
            onClick={handleNavigateToStudy}
            className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-green-500/25 cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle size={28} className="text-green-100" />
                <div className="text-right">
                  <div className="text-3xl font-bold">{quickStats.completionRate}%</div>
                  <div className="text-green-100 text-sm">전체 완료율</div>
                </div>
              </div>
              <div className="w-full bg-green-400/30 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${quickStats.completionRate}%` }}
                ></div>
              </div>
              <div className="text-green-100 text-sm">이번 주 목표 달성</div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          </div>

          <div 
            onClick={handleNavigateToStudy}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/25 cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Timer size={28} className="text-purple-100" />
                <div className="text-right">
                  <div className="text-3xl font-bold">{Math.round(quickStats.totalStudyTime / 60)}h</div>
                  <div className="text-purple-100 text-sm">총 학습 시간</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-100 text-sm">
                <Clock size={16} />
                <span>오늘 {Math.floor(Math.random() * 4) + 2}시간 학습</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          </div>

          <div 
            onClick={handleNavigateToStudy}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/25 cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Flame size={28} className="text-orange-100" />
                <div className="text-right">
                  <div className="text-3xl font-bold">{quickStats.currentStreak}</div>
                  <div className="text-orange-100 text-sm">연속 학습일</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <Sparkles size={16} />
                <span>최고 기록 15일</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 오늘의 집중 학습 & 타이머 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Brain size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">오늘의 집중 학습</h2>
                    <p className="text-slate-600 text-sm">AI가 추천하는 최적의 학습 계획</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full border border-green-200">
                    <span className="text-green-700 text-sm font-medium">집중도 94%</span>
                  </div>
                </div>
              </div>

              {/* 학습 타이머 */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-6 border border-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Timer size={20} className="text-indigo-600" />
                    <span className="font-medium text-slate-900">학습 타이머</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-indigo-600">
                    {formatTime(studyTimer.seconds)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStudyTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      studyTimer.isActive 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    }`}
                  >
                    {studyTimer.isActive ? <Pause size={18} /> : <Play size={18} />}
                    {studyTimer.isActive ? '일시정지' : '시작하기'}
                  </button>
                  <button
                    onClick={() => setStudyTimer({ isActive: false, seconds: 0, subject: null })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all"
                  >
                    <RotateCcw size={18} />
                    초기화
                  </button>
                </div>
              </div>

              {/* 오늘의 추천 학습 */}
              <div className="space-y-4">
                {getTodayRecommendations().map((rec, index) => {
                  const IconComponent = rec.icon;
                  return (
                    <div key={index} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-5 border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                            <IconComponent size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">{rec.title}</h3>
                            <p className="text-slate-600 text-sm mb-2">{rec.reason}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {rec.estimatedTime}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '보통' : '낮음'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium">
                          시작하기
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 향상된 주간 학습 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 주간 진행률 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/60">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">주간 학습 현황</h3>
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyStudyData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorHours)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 과목별 성과 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/60">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">과목별 성과</h3>
                  <BarChart3 size={20} className="text-blue-500" />
                </div>
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subjects[index]?.color || '#3b82f6' }}></div>
                        <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(subject.progress)}`}
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 w-10 text-right">{subject.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 학습 현황 통합 섹션 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">학습 현황</h2>
                    <p className="text-slate-600 text-sm">진행중인 모든 학습 활동</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="active">진행중</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
              </div>

              {/* 학습 과목 */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain size={18} className="text-blue-500" />
                  학습 과목 ({subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studySubjects.slice(0, 4).map(subject => {
                    const progress = Math.round((subject.completedChapters / subject.totalChapters) * 100);
                    return (
                      <div key={subject.id} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-5 border border-slate-200/60">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: subject.color }}>
                              📚
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{subject.name}</h4>
                              <p className="text-sm text-slate-600">{subject.completedChapters}/{subject.totalChapters} 챕터</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            subject.priority === 'high' ? 'bg-red-100 text-red-700' :
                            subject.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {subject.priority === 'high' ? '높음' : subject.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">진행률</span>
                            <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>최근 활동: {subject.recentActivity || '오늘'}</span>
                          <button className="text-blue-600 hover:text-blue-700 font-medium">자세히 →</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 프로젝트 */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-purple-500" />
                  프로젝트 ({projects.length})
                </h3>
                <div className="space-y-4">
                  {currentProjects.slice(0, 3).map(project => {
                    const daysLeft = project.dueDate ? getDaysUntilDeadline(project.dueDate) : null;
                    return (
                      <div key={project.id} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-5 border border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{project.icon}</div>
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{project.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{project.description}</p>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  project.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {project.priority === 'high' ? '높음' : project.priority === 'medium' ? '보통' : '낮음'}
                                </span>
                                {daysLeft && (
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                                    daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {daysLeft > 0 ? `${daysLeft}일 남음` : '마감 임박'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900 mb-1">{project.progress}%</div>
                            <div className="w-24 bg-slate-200 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.progress)} transition-all duration-500`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <button 
                              onClick={() => handleNavigateToProjectDetail(project.id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                            >
                              관리 →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 원서 학습 */}
              <div>
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BookMarked size={18} className="text-green-500" />
                  원서 학습 ({textbooks.length})
                </h3>
                <div className="space-y-4">
                  {textbooks.slice(0, 3).map(textbook => {
                    const progress = Math.round((textbook.currentPage / textbook.totalPages) * 100);
                    const daysLeft = textbook.targetDate ? getDaysUntilDeadline(textbook.targetDate) : null;
                    return (
                      <div 
                        key={textbook.id} 
                        className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-5 border border-slate-200/60 cursor-pointer"
                        onClick={() => handleNavigateToTextbookDetail(textbook.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-gradient-to-b from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                              📖
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{textbook.title}</h4>
                              <p className="text-sm text-slate-600 mb-2">{textbook.author}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  {textbook.currentPage}/{textbook.totalPages} 페이지
                                </span>
                                {daysLeft && (
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    daysLeft <= 7 ? 'bg-red-100 text-red-700' :
                                    daysLeft <= 14 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {daysLeft}일 남음
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900 mb-2">{progress}%</div>
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-green-600 hover:text-green-700 font-medium mt-2">
                              자세히 보기 →
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-6">
            {/* 향상된 Todo 섹션 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">오늘 할 일</h3>
                    <p className="text-xs text-slate-600">
                      {todoList.filter(t => !t.completed).length}개 남음
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddTodoModal(true)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todoList.slice(0, 5).map(todo => (
                  <div key={todo.id} className={`group p-4 rounded-2xl border transition-all duration-300 ${
                    todo.completed 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'bg-white border-slate-200 hover:shadow-md'
                  }`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {todo.completed && <CheckCircle2 size={12} />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          todo.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}>
                          {todo.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {todo.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    완료: {todoList.filter(t => t.completed).length}/{todoList.length}
                  </span>
                  <span className="text-slate-600">
                    예상 시간: {todoList.filter(t => !t.completed).reduce((acc, t) => acc + (t.estimatedTime || 30), 0)}분
                  </span>
                </div>
              </div>
            </div>

            {/* 빠른 작업 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                빠른 작업
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleNavigateToStudy}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border border-blue-200/50 transition-all text-left cursor-pointer"
                >
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Plus size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-blue-900">새 학습 세션 시작</span>
                </button>
                <button 
                  onClick={handleNavigateToTextbook}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl border border-green-200/50 transition-all text-left cursor-pointer"
                >
                  <div className="p-2 bg-green-500 rounded-xl">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-green-900">복습 노트 작성</span>
                </button>
                <button 
                  onClick={handleNavigateToStudy}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl border border-purple-200/50 transition-all text-left cursor-pointer"
                >
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <Target size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-purple-900">목표 설정</span>
                </button>
              </div>
            </div>

            {/* 다가오는 마감일 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-red-500" />
                  다가오는 마감일
                </h3>
                <button 
                  onClick={handleNavigateToCalendar}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                >
                  전체보기
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 4).map((deadline, index) => {
                  const daysLeft = getDaysUntilDeadline(deadline.dueDate);
                  return (
                    <div key={index} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                      daysLeft <= 3 ? 'bg-red-50 border-red-200' :
                      daysLeft <= 7 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 text-sm">{deadline.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft}일` : '오늘'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{deadline.type}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(deadline.dueDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 성취 배지 */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/25">
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-lg font-bold mb-2">이번 주 MVP!</h3>
                <p className="text-yellow-100 text-sm mb-4">
                  {quickStats.currentStreak}일 연속 학습 달성으로<br />
                  꾸준함 배지를 획득했습니다
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-100 text-sm">
                  <Sparkles size={16} />
                  <span>다음 목표: 15일 연속</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={showAddTodoModal}
        onClose={() => setShowAddTodoModal(false)}
        title="새 할 일 추가"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">할 일</label>
            <input
              type="text"
              value={newTodo.text}
              onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="할 일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setShowAddTodoModal(false)} variant="outline" className="flex-1">
              취소
            </Button>
            <Button onClick={handleAddTodo} className="flex-1">
              추가
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        title="빠른 할 일 추가"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">할 일</label>
            <input
              type="text"
              value={newTodo.text}
              onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="할 일을 입력하세요"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setShowQuickAddModal(false)} variant="outline" className="flex-1">
              취소
            </Button>
            <Button onClick={handleQuickAdd} className="flex-1">
              추가
            </Button>
          </div>
        </div>
      </Modal>

      {/* 토스트 알림 */}
      <Toast open={showToast} type={toastType}>
        {toastMessage}
      </Toast>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Target, Bell, BookOpen, TrendingUp, Flame, Calendar, Plus, Zap, Brain, Timer, BarChart3, BookMarked, CheckCircle2, Play, Pause, RotateCcw, Sparkles, Sun, Moon, Sunrise, Settings, User, LogOut } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  // Mock data - 실제로는 context에서 가져올 데이터
  const subjects = useMemo(() => [
    { id: 1, name: '알고리즘', completedChapters: 8, totalChapters: 12, priority: 'high', color: '#3b82f6' },
    { id: 2, name: '데이터베이스', completedChapters: 6, totalChapters: 10, priority: 'medium', color: '#10b981' },
    { id: 3, name: '운영체제', completedChapters: 4, totalChapters: 8, priority: 'medium', color: '#f59e0b' }
  ], []);

  const projects = useMemo(() => [
    { id: 1, name: '캡스톤 프로젝트', description: 'AI 기반 학습 관리 시스템', progress: 75, status: 'in-progress', priority: 'high', icon: '🚀' },
    { id: 2, name: '웹 포트폴리오', description: '개인 포트폴리오 웹사이트 제작', progress: 45, status: 'in-progress', priority: 'medium', icon: '💼' }
  ], []);

  const textbooks = useMemo(() => [
    { id: 1, title: 'Clean Code', author: 'Robert Martin', currentPage: 120, totalPages: 400, priority: 'high' },
    { id: 2, title: 'System Design Interview', author: 'Alex Xu', currentPage: 80, totalPages: 300, priority: 'medium' }
  ], []);
  
  const goals = useMemo(() => [
    { id: 1, title: '알고리즘 마스터', progress: 80 },
    { id: 2, title: '프로젝트 완성', progress: 75 }
  ], []);

  // 실제 데이터에서 Todo 목록 생성
  const [todoList, setTodoList] = useState([]);
  
  useEffect(() => {
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
  const [newTodo, setNewTodo] = useState({ text: '', priority: 'medium' });

  // 토스트 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // 알림 드롭다운 상태
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Mock functions
  const getTotalStudyTime = () => 7200; // 2시간 in seconds
  const getCompletionRate = () => 78;
  const getCurrentStreak = () => 12;
  const getWeeklyStudyData = () => [
    { day: '월', hours: 3 },
    { day: '화', hours: 2.5 },
    { day: '수', hours: 4 },
    { day: '목', hours: 2 },
    { day: '금', hours: 3.5 },
    { day: '토', hours: 1.5 },
    { day: '일', hours: 2 }
  ];

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
      }))
  ];

  // 마감일 데이터
  const upcomingDeadlines = [
    { id: 1, title: '알고리즘 과목 완료', dueDate: '2024-12-30', priority: 'high', type: 'study' },
    { id: 2, title: '캡스톤 프로젝트 제출', dueDate: '2024-12-25', priority: 'high', type: 'project' },
    { id: 3, title: 'Clean Code 완독', dueDate: '2024-12-20', priority: 'medium', type: 'textbook' }
  ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // 오늘의 추천 학습
  const getTodayRecommendations = () => {
    const currentHour = currentTime.getHours();
    const recommendations = [];

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

  const toggleTodo = (id) => {
    setTodoList(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 바 - 고정 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 페이지 제목 */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-lg">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const greeting = getTimeBasedGreeting();
                    const GreetingIcon = greeting.icon;
                    return (
                      <>
                        <GreetingIcon size={16} className={greeting.color} />
                        <span className="text-sm text-slate-600 font-medium">{greeting.text}</span>
                      </>
                    );
                  })()}
                </div>
                <h1 className="text-2xl font-bold text-slate-900">학습 대시보드</h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  {currentTime.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </div>

            {/* 우상단 알림 및 유저 메뉴 */}
            <div className="flex items-center gap-3">
              {/* 알림 */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <Bell size={24} />
                  {notifications.filter(n => n.urgent).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {notifications.filter(n => n.urgent).length}
                    </div>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <div className="p-4 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">알림</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 5).map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${notification.urgent ? 'bg-red-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-md ${
                              notification.type === 'study' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'project' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type === 'study' && <Brain size={16} />}
                              {notification.type === 'project' && <Zap size={16} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 font-medium">{notification.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 유저 메뉴 */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <User size={24} />
                </button>

                {/* 유저 메뉴 드롭다운 */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">학습자</p>
                          <p className="text-sm text-slate-600">learner@example.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-md transition-colors text-left">
                        <Settings size={16} className="text-slate-600" />
                        <span className="text-slate-700">설정</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-md transition-colors text-left">
                        <LogOut size={16} className="text-slate-600" />
                        <span className="text-slate-700">로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-lg">
                  <BookOpen size={20} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{quickStats.totalSubjects}</div>
                  <div className="text-sm text-slate-600">학습 과목</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{quickStats.completionRate}%</div>
                  <div className="text-sm text-green-600">완료율</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{Math.round(quickStats.totalStudyTime / 60)}h</div>
                  <div className="text-sm text-blue-600">총 학습시간</div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{quickStats.currentStreak}</div>
                  <div className="text-sm text-orange-600">연속 학습일</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 오늘의 집중 학습 & 타이머 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Brain size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">오늘의 집중 학습</h2>
                    <p className="text-slate-600 text-sm">AI가 추천하는 최적의 학습 계획</p>
                  </div>
                </div>
                <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <span className="text-green-700 text-sm font-medium">집중도 94%</span>
                </div>
              </div>

              {/* 학습 타이머 */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Timer size={18} className="text-slate-600" />
                    <span className="font-medium text-slate-900">학습 타이머</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-900">
                    {formatTime(studyTimer.seconds)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStudyTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      studyTimer.isActive 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {studyTimer.isActive ? <Pause size={16} /> : <Play size={16} />}
                    {studyTimer.isActive ? '일시정지' : '시작하기'}
                  </button>
                  <button
                    onClick={() => setStudyTimer({ isActive: false, seconds: 0, subject: null })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all text-sm"
                  >
                    <RotateCcw size={16} />
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
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-200 rounded-lg group-hover:bg-slate-300 transition-all">
                            <IconComponent size={18} className="text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 mb-1">{rec.title}</h3>
                            <p className="text-slate-600 text-sm mb-2">{rec.reason}</p>
                            <div className="flex items-center gap-2">
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
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm">
                          시작하기
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 주간 학습 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">주간 학습 현황</h3>
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getWeeklyStudyData()}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorHours)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">과목별 성과</h3>
                  <BarChart3 size={18} className="text-blue-500" />
                </div>
                <div className="space-y-3">
                  {subjects.map((subject, index) => {
                    const progress = Math.round((subject.completedChapters / subject.totalChapters) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>
                          <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                          <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 w-10 text-right">{progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 학습 현황 통합 섹션 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <BookOpen size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">학습 현황</h2>
                    <p className="text-slate-600 text-sm">진행중인 모든 학습 활동</p>
                  </div>
                </div>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">전체</option>
                  <option value="active">진행중</option>
                  <option value="completed">완료</option>
                </select>
              </div>

              {/* 학습 과목 */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain size={16} className="text-blue-500" />
                  학습 과목 ({subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(subject => {
                    const progress = Math.round((subject.completedChapters / subject.totalChapters) * 100);
                    return (
                      <div key={subject.id} className="group hover:border-slate-300 transition-all duration-200 bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: subject.color }}>
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
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">진행률</span>
                            <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress}%`, 
                                backgroundColor: subject.color 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>최근 활동: 오늘</span>
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
                  <Zap size={16} className="text-purple-500" />
                  프로젝트 ({projects.length})
                </h3>
                <div className="space-y-3">
                  {projects.map(project => {
                    return (
                      <div key={project.id} className="group hover:border-slate-300 transition-all duration-200 bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{project.icon}</div>
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{project.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{project.description}</p>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                project.priority === 'high' ? 'bg-red-100 text-red-700' :
                                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {project.priority === 'high' ? '높음' : project.priority === 'medium' ? '보통' : '낮음'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900 mb-1">{project.progress}%</div>
                            <div className="w-20 bg-slate-200 rounded-full h-2 mb-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                  <BookMarked size={16} className="text-green-500" />
                  원서 학습 ({textbooks.length})
                </h3>
                <div className="space-y-3">
                  {textbooks.map(textbook => {
                    const progress = Math.round((textbook.currentPage / textbook.totalPages) * 100);
                    return (
                      <div key={textbook.id} className="group hover:border-slate-300 transition-all duration-200 bg-slate-50 rounded-lg p-4 border border-slate-200 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">
                              📖
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{textbook.title}</h4>
                              <p className="text-sm text-slate-600 mb-2">{textbook.author}</p>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {textbook.currentPage}/{textbook.totalPages} 페이지
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 mb-2">{progress}%</div>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-green-600 hover:text-green-700 font-medium mt-2">
                              자세히 →
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
            {/* Todo 섹션 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <CheckCircle2 size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">오늘 할 일</h3>
                    <p className="text-xs text-slate-600">
                      {todoList.filter(t => !t.completed).length}개 남음
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddTodoModal(true)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {todoList.slice(0, 5).map(todo => (
                  <div key={todo.id} className={`group p-3 rounded-lg border transition-all duration-200 ${
                    todo.completed 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {todo.completed && <CheckCircle2 size={10} />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${
                          todo.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}>
                          {todo.text}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                            {todo.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    완료: {todoList.filter(t => t.completed).length}/{todoList.length}
                  </span>
                  <span className="text-slate-600">
                    예상: {todoList.filter(t => !t.completed).length * 30}분
                  </span>
                </div>
              </div>
            </div>

            {/* 빠른 작업 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                빠른 작업
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all text-left">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Plus size={14} className="text-white" />
                  </div>
                  <span className="font-medium text-blue-900 text-sm">새 학습 세션 시작</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all text-left">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <BookOpen size={14} className="text-white" />
                  </div>
                  <span className="font-medium text-green-900 text-sm">복습 노트 작성</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all text-left">
                  <div className="p-1.5 bg-purple-500 rounded-lg">
                    <Target size={14} className="text-white" />
                  </div>
                  <span className="font-medium text-purple-900 text-sm">목표 설정</span>
                </button>
              </div>
            </div>

            {/* 다가오는 마감일 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} className="text-red-500" />
                  다가오는 마감일
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  전체보기
                </button>
              </div>
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 4).map((deadline, index) => {
                  const daysLeft = getDaysUntilDeadline(deadline.dueDate);
                  return (
                    <div key={index} className={`p-3 rounded-lg border transition-all ${
                      daysLeft <= 3 ? 'bg-red-50 border-red-200' :
                      daysLeft <= 7 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
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
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl p-4 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold mb-2">이번 주 MVP!</h3>
                <p className="text-yellow-100 text-sm mb-3">
                  {quickStats.currentStreak}일 연속 학습 달성으로<br />
                  꾸준함 배지를 획득했습니다
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-100 text-sm">
                  <Sparkles size={14} />
                  <span>다음 목표: 15일 연속</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showAddTodoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">새 할 일 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">할 일</label>
                <input
                  type="text"
                  value={newTodo.text}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="할 일을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddTodoModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddTodo}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
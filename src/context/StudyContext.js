import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudyContext = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudyContext must be used within a StudyProvider');
  }
  return context;
};

export const StudyProvider = ({ children }) => {
  // 학습 과목 데이터
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: '알고리즘',
      category: 'major',
      color: 'blue',
      priority: 'high',
      difficulty: 4,
      totalChapters: 10,
      completedChapters: 6,
      targetCompletionDate: '2025-09-15',
      dailyGoal: 120,
      weeklyGoal: '2챕터 완료',
      totalStudyTime: 1240,
      currentStreak: 7,
      lastStudyDate: '2025-08-02',
      chapters: [
        { id: 1, name: '배열과 문자열', completed: true, memo: '기본 개념 완료', timeSpent: 180, difficulty: 3, lastStudied: '2025-07-28' },
        { id: 2, name: '연결 리스트', completed: true, memo: '구현 연습 완료', timeSpent: 240, difficulty: 4, lastStudied: '2025-07-30' },
        { id: 3, name: '스택과 큐', completed: true, memo: '', timeSpent: 150, difficulty: 3, lastStudied: '2025-07-31' },
        { id: 4, name: '트리 구조', completed: true, memo: '이진트리 중점 학습', timeSpent: 300, difficulty: 5, lastStudied: '2025-08-01' },
        { id: 5, name: '그래프', completed: true, memo: '', timeSpent: 280, difficulty: 5, lastStudied: '2025-08-02' },
        { id: 6, name: '정렬 알고리즘', completed: true, memo: '퀵정렬, 버블정렬 완료', timeSpent: 190, difficulty: 4, lastStudied: '2025-08-02' },
        { id: 7, name: '탐색 알고리즘', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 8, name: '동적 프로그래밍', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null },
        { id: 9, name: '그리디 알고리즘', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 10, name: '백트래킹', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null }
      ]
    },
    {
      id: 2,
      name: '캡스톤 프로젝트',
      category: 'project',
      color: 'green',
      priority: 'high',
      difficulty: 5,
      totalChapters: 8,
      completedChapters: 3,
      targetCompletionDate: '2025-12-01',
      dailyGoal: 180,
      weeklyGoal: '1단계 완료',
      totalStudyTime: 2160,
      currentStreak: 12,
      lastStudyDate: '2025-08-02',
      chapters: [
        { id: 1, name: '주제 선정', completed: true, memo: 'AI 챗봇 서비스로 결정', timeSpent: 120, difficulty: 2, lastStudied: '2025-07-25' },
        { id: 2, name: '요구사항 분석', completed: true, memo: '사용자 스토리 작성 완료', timeSpent: 480, difficulty: 4, lastStudied: '2025-07-27' },
        { id: 3, name: 'UI/UX 설계', completed: true, memo: 'Figma 프로토타입 완성', timeSpent: 360, difficulty: 4, lastStudied: '2025-07-29' },
        { id: 4, name: '백엔드 설계', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null },
        { id: 5, name: '프론트엔드 개발', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null },
        { id: 6, name: '백엔드 개발', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null },
        { id: 7, name: '테스트 및 배포', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 8, name: '최종 발표 준비', completed: false, memo: '', timeSpent: 0, difficulty: 3, lastStudied: null }
      ]
    },
    {
      id: 3,
      name: '토익 준비',
      category: 'certificate',
      color: 'purple',
      priority: 'medium',
      difficulty: 3,
      totalChapters: 12,
      completedChapters: 4,
      targetCompletionDate: '2025-10-20',
      dailyGoal: 90,
      weeklyGoal: '3파트 완료',
      totalStudyTime: 720,
      currentStreak: 5,
      lastStudyDate: '2025-08-01',
      chapters: [
        { id: 1, name: 'Part 1 사진 묘사', completed: true, memo: '기본 패턴 암기 완료', timeSpent: 120, difficulty: 2, lastStudied: '2025-07-22' },
        { id: 2, name: 'Part 2 응답 선택', completed: true, memo: 'WH 질문 연습', timeSpent: 150, difficulty: 3, lastStudied: '2025-07-24' },
        { id: 3, name: 'Part 3 대화 듣기', completed: true, memo: '키워드 파악 연습', timeSpent: 180, difficulty: 4, lastStudied: '2025-07-26' },
        { id: 4, name: 'Part 4 설명문 듣기', completed: true, memo: '', timeSpent: 160, difficulty: 4, lastStudied: '2025-07-28' },
        { id: 5, name: 'Part 5 문법', completed: false, memo: '', timeSpent: 0, difficulty: 3, lastStudied: null },
        { id: 6, name: 'Part 6 빈칸 추론', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 7, name: 'Part 7 독해', completed: false, memo: '', timeSpent: 0, difficulty: 5, lastStudied: null },
        { id: 8, name: '단어 암기 1000개', completed: false, memo: '', timeSpent: 0, difficulty: 2, lastStudied: null },
        { id: 9, name: '모의고사 1회', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 10, name: '모의고사 2회', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 11, name: '모의고사 3회', completed: false, memo: '', timeSpent: 0, difficulty: 4, lastStudied: null },
        { id: 12, name: '최종 정리', completed: false, memo: '', timeSpent: 0, difficulty: 3, lastStudied: null }
      ]
    }
  ]);

  // 학습 기록 데이터
  const [studyLogs, setStudyLogs] = useState([
    { id: 1, subjectId: 1, chapterId: 6, date: '2025-08-02', duration: 45, content: '정렬 알고리즘 복습 및 문제 풀이' },
    { id: 2, subjectId: 1, chapterId: 5, date: '2025-08-02', duration: 60, content: '그래프 알고리즘 학습' },
    { id: 3, subjectId: 2, chapterId: 3, date: '2025-07-29', duration: 120, content: 'UI/UX 설계 완료' },
    { id: 4, subjectId: 3, chapterId: 4, date: '2025-07-28', duration: 90, content: 'Part 4 설명문 듣기 연습' }
  ]);

  // 목표 데이터
  const [goals, setGoals] = useState([
    { id: 1, type: 'daily', target: 180, current: 105, description: '일일 학습 시간' },
    { id: 2, type: 'weekly', target: 2, current: 1, description: '완료할 챕터 수' },
    { id: 3, type: 'monthly', target: 8, current: 6, description: '완료할 챕터 수' }
  ]);

  // 학습 이벤트 데이터
  const [studyEvents, setStudyEvents] = useState([
    {
      id: 1,
      title: '알고리즘 7강 듣기',
      type: 'study',
      date: '2025-08-03',
      time: '14:00',
      duration: 2,
      repeat: 'none',
      memo: '중요 개념: 탐색 알고리즘',
      completed: false,
      subjectId: 1,
      chapterId: 7
    },
    {
      id: 2,
      title: '토익 Part 5 문법 연습',
      type: 'study',
      date: '2025-08-04',
      time: '10:00',
      duration: 1.5,
      repeat: 'none',
      memo: '문법 패턴 암기',
      completed: false,
      subjectId: 3,
      chapterId: 5
    },
    {
      id: 3,
      title: '캡스톤 백엔드 설계',
      type: 'study',
      date: '2025-08-05',
      time: '15:00',
      duration: 3,
      repeat: 'none',
      memo: 'API 설계 및 데이터베이스 설계',
      completed: false,
      subjectId: 2,
      chapterId: 4
    }
  ]);

  // 원서 학습 데이터 - localStorage의 'textbooks' 키와 동일하게 사용
  const [textbooks, setTextbooks] = useState([]);

  // 통계 계산 함수들
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

  const getTodayRecommendations = () => {
    const today = new Date().toISOString().split('T')[0];
    const recommendations = [];

    subjects.forEach(subject => {
      if (subject.lastStudyDate !== today) {
        const incompleteChapters = subject.chapters.filter(ch => !ch.completed);
        if (incompleteChapters.length > 0) {
          recommendations.push({
            subjectId: subject.id,
            subjectName: subject.name,
            chapterId: incompleteChapters[0].id,
            chapterName: incompleteChapters[0].name,
            priority: subject.priority === 'high' ? 3 : subject.priority === 'medium' ? 2 : 1,
            reason: `다음 챕터: ${incompleteChapters[0].name}`
          });
        }
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const getWeeklyStudyData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = studyLogs.filter(log => log.date === dateStr);
      const totalTime = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      
      weeklyData.push({
        day: ['일', '월', '화', '수', '목', '금', '토'][i],
        hours: Math.round((totalTime / 60) * 10) / 10
      });
    }
    
    return weeklyData;
  };

  // 데이터 업데이트 함수들
  const updateStudyTime = (subjectId, chapterId, duration, content) => {
    const today = new Date().toISOString().split('T')[0];
    
    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          totalStudyTime: subject.totalStudyTime + duration,
          lastStudyDate: today
        };
      }
      return subject;
    }));

    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        const updatedChapters = subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              timeSpent: chapter.timeSpent + duration,
              lastStudied: today
            };
          }
          return chapter;
        });
        return { ...subject, chapters: updatedChapters };
      }
      return subject;
    }));

    const newLog = {
      id: Date.now(),
      subjectId,
      chapterId,
      date: today,
      duration,
      content
    };
    setStudyLogs(prev => [...prev, newLog]);
  };

  const updateGoalProgress = (type, value) => {
    setGoals(prev => prev.map(goal => {
      if (goal.type === type) {
        return { ...goal, current: goal.current + value };
      }
      return goal;
    }));
  };

  const addStudyEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now()
    };
    setStudyEvents(prev => [...prev, newEvent]);
  };

  const updateStudyEvent = (eventId, updates) => {
    setStudyEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const deleteStudyEvent = (eventId) => {
    setStudyEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const addSubject = (subject) => {
    const newSubject = {
      ...subject,
      id: Date.now(),
      totalChapters: subject.chapters.length,
      completedChapters: 0,
      totalStudyTime: 0,
      currentStreak: 0,
      lastStudyDate: null,
      chapters: subject.chapters.map((name, index) => ({
        id: index + 1,
        name,
        completed: false,
        memo: '',
        timeSpent: 0,
        difficulty: 3,
        lastStudied: null
      }))
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (subjectId, updates) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId ? { ...subject, ...updates } : subject
    ));
  };

  const deleteSubject = (subjectId) => {
    setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
  };

  // 원서 학습 관련 함수들 - TextbookManagement와 호환
  const addTextbook = (textbook) => {
    const newTextbook = { ...textbook, id: Date.now() };
    setTextbooks(prev => [...prev, newTextbook]);
    // TextbookManagement와 동기화
    const savedBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
    localStorage.setItem('textbooks', JSON.stringify([...savedBooks, newTextbook]));
  };

  const updateTextbook = (textbookId, updates) => {
    setTextbooks(prev => prev.map(textbook => 
      textbook.id === textbookId ? { ...textbook, ...updates } : textbook
    ));
    // TextbookManagement와 동기화
    const savedBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
    const updatedBooks = savedBooks.map(book => 
      book.id === textbookId ? { ...book, ...updates } : book
    );
    localStorage.setItem('textbooks', JSON.stringify(updatedBooks));
  };

  const deleteTextbook = (textbookId) => {
    setTextbooks(prev => prev.filter(textbook => textbook.id !== textbookId));
    // TextbookManagement와 동기화
    const savedBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
    const updatedBooks = savedBooks.filter(book => book.id !== textbookId);
    localStorage.setItem('textbooks', JSON.stringify(updatedBooks));
  };

  const getTextbookProgress = (textbook) => {
    return Math.round((textbook.currentPage / textbook.totalPages) * 100);
  };

  const getTextbookDaysRemaining = (textbook) => {
    const today = new Date();
    const target = new Date(textbook.targetDate);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRecommendedDailyPages = (textbook) => {
    const remainingPages = textbook.totalPages - textbook.currentPage;
    const daysRemaining = getTextbookDaysRemaining(textbook);
    if (daysRemaining <= 0) return 0;
    return Math.ceil(remainingPages / daysRemaining);
  };

  // 로컬 스토리지 동기화
  useEffect(() => {
    const savedSubjects = localStorage.getItem('studySubjects');
    const savedStudyLogs = localStorage.getItem('studyLogs');
    const savedGoals = localStorage.getItem('studyGoals');
    const savedEvents = localStorage.getItem('studyEvents');
    const savedTextbooks = localStorage.getItem('textbooks'); // TextbookManagement와 동일한 키 사용

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedStudyLogs) setStudyLogs(JSON.parse(savedStudyLogs));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedEvents) setStudyEvents(JSON.parse(savedEvents));
    if (savedTextbooks) setTextbooks(JSON.parse(savedTextbooks));
  }, []);

  useEffect(() => {
    localStorage.setItem('studySubjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('studyLogs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('studyGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('studyEvents', JSON.stringify(studyEvents));
  }, [studyEvents]);

  useEffect(() => {
    localStorage.setItem('textbooks', JSON.stringify(textbooks)); // TextbookManagement와 동일한 키 사용
  }, [textbooks]);

  const value = {
    // 데이터
    subjects,
    studyLogs,
    goals,
    studyEvents,
    textbooks,
    
    // 상태 업데이트 함수들
    setSubjects,
    setStudyLogs,
    setGoals,
    setStudyEvents,
    setTextbooks,
    
    // 계산 함수들
    getTotalStudyTime,
    getCompletionRate,
    getCurrentStreak,
    getTodayRecommendations,
    getWeeklyStudyData,
    getTextbookProgress,
    getTextbookDaysRemaining,
    getRecommendedDailyPages,
    
    // 업데이트 함수들
    updateStudyTime,
    updateGoalProgress,
    addStudyEvent,
    updateStudyEvent,
    deleteStudyEvent,
    addSubject,
    updateSubject,
    deleteSubject,
    addTextbook,
    updateTextbook,
    deleteTextbook
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}; 
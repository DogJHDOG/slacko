import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, BookOpen, Code, RotateCcw, Flag, AlertCircle } from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { useStudyContext } from '../../context/StudyContext';
import { getCurrentDate, formatDate as formatDateUtil, isToday as isTodayUtil } from '../../utils/dateUtils';
import React from 'react';
import EventDetailModal from '../../components/study/EventDetailModal';

const StudyCalendar = () => {
  const { projects } = useProjectContext();
  const { subjects, textbooks, studyEvents } = useStudyContext();

  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [view, setView] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // 이벤트 타입 설정
  const eventTypes = {
    study: { label: '학습', color: 'bg-blue-500', icon: BookOpen },
    reading: { label: '독서', color: 'bg-green-500', icon: BookOpen },
    coding: { label: '코딩', color: 'bg-purple-500', icon: Code },
    project: { label: '프로젝트', color: 'bg-orange-500', icon: Flag },
    deadline: { label: '마감일', color: 'bg-red-500', icon: AlertCircle }
  };

  const repeatOptions = {
    none: '반복 없음',
    daily: '매일',
    weekly: '매주',
    monthly: '매월'
  };

  // 프로젝트 데이터를 캘린더 이벤트로 변환
  const getProjectEvents = () => {
    const projectEvents = [];
    
    projects.forEach(project => {
      // 마일스톤 이벤트 추가
      project.milestones?.forEach(milestone => {
        // 마일스톤 완료일 이벤트
        projectEvents.push({
          id: `milestone-${milestone.id}`,
          title: `${project.name}: ${milestone.title}`,
          type: 'project',
          date: milestone.dueDate,
          time: '',
          duration: 0,
          repeat: 'none',
          memo: milestone.description,
          completed: milestone.completed,
          projectColor: project.color,
          projectIcon: project.icon
        });
        
        // 마일스톤 준비 기간 이벤트 (마감일 3일 전부터 마감일까지)
        if (milestone.dueDate) {
          const startDate = new Date(milestone.dueDate);
          startDate.setDate(startDate.getDate() - 3);
          const endDate = new Date(milestone.dueDate);
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            projectEvents.push({
              id: `milestone-prep-${milestone.id}-${d.toISOString().split('T')[0]}`,
              title: `${project.name}: ${milestone.title} 준비`,
              type: 'project',
              date: d.toISOString().split('T')[0],
              time: '',
              duration: 0,
              repeat: 'daily',
              memo: milestone.description,
              completed: milestone.completed,
              projectColor: project.color,
              projectIcon: project.icon
            });
          }
        }
      });

      // 작업 이벤트 추가
      project.tasks?.forEach(task => {
        if (task.dueDate) {
          // 작업 기간 설정
          let startDate, endDate;
          
          if (task.startDate) {
            // 시작일이 있는 경우: 시작일부터 마감일까지
            startDate = new Date(task.startDate);
            endDate = new Date(task.dueDate);
          } else {
            // 시작일이 없는 경우: 마감일 7일 전부터 마감일까지
            startDate = new Date(task.dueDate);
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date(task.dueDate);
          }
          
          // 작업 기간 동안 매일 이벤트 생성
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          projectEvents.push({
              id: `task-${task.id}-${d.toISOString().split('T')[0]}`,
            title: `${project.name}: ${task.title}`,
              type: 'project',
              date: d.toISOString().split('T')[0],
            time: '',
            duration: 0,
              repeat: 'daily',
              memo: task.description || '',
            completed: task.status === 'completed',
            projectColor: project.color,
            projectIcon: project.icon,
            priority: task.priority
          });
          }
        }
      });
      
      // 프로젝트 시작/종료일 이벤트 추가
      if (project.startDate) {
        // 프로젝트 시작일 이벤트
        projectEvents.push({
          id: `project-start-${project.id}`,
          title: `${project.name} 시작`,
          type: 'project',
          date: project.startDate,
          time: '',
          duration: 0,
          repeat: 'none',
          memo: project.description,
          completed: false,
          projectColor: project.color,
          projectIcon: project.icon
        });
        
        // 프로젝트 시작 준비 기간 (시작일 3일 전부터 시작일까지)
        const prepStartDate = new Date(project.startDate);
        prepStartDate.setDate(prepStartDate.getDate() - 3);
        const startDate = new Date(project.startDate);
        
        for (let d = new Date(prepStartDate); d <= startDate; d.setDate(d.getDate() + 1)) {
          projectEvents.push({
            id: `project-prep-${project.id}-${d.toISOString().split('T')[0]}`,
            title: `${project.name} 시작 준비`,
            type: 'project',
            date: d.toISOString().split('T')[0],
            time: '',
            duration: 0,
            repeat: 'daily',
            memo: '프로젝트 시작 준비',
            completed: false,
            projectColor: project.color,
            projectIcon: project.icon
          });
        }
      }
      
      if (project.endDate) {
        // 프로젝트 마감일 이벤트
        projectEvents.push({
          id: `project-end-${project.id}`,
          title: `${project.name} 마감`,
          type: 'deadline',
          date: project.endDate,
          time: '',
          duration: 0,
          repeat: 'none',
          memo: project.description,
          completed: project.status === 'completed',
          projectColor: project.color,
          projectIcon: project.icon
        });
        
        // 프로젝트 마감 준비 기간 (마감일 7일 전부터 마감일까지)
        const prepStartDate = new Date(project.endDate);
        prepStartDate.setDate(prepStartDate.getDate() - 7);
        const endDate = new Date(project.endDate);
        
        for (let d = new Date(prepStartDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          projectEvents.push({
            id: `project-end-prep-${project.id}-${d.toISOString().split('T')[0]}`,
            title: `${project.name} 마감 준비`,
            type: 'deadline',
            date: d.toISOString().split('T')[0],
            time: '',
            duration: 0,
            repeat: 'daily',
            memo: '프로젝트 마감 준비',
            completed: project.status === 'completed',
            projectColor: project.color,
            projectIcon: project.icon
          });
        }
      }
    });
    
    return projectEvents;
  };

  // 학습 과목 데이터를 캘린더 이벤트로 변환
  const getStudySubjectEvents = () => {
    const studySubjectEvents = [];
    
    subjects.forEach(subject => {
      // 미완료 챕터들의 학습 기간 이벤트 추가
      const incompleteChapters = subject.chapters.filter(chapter => !chapter.completed);
      
      incompleteChapters.forEach((chapter, index) => {
        // 각 챕터별 학습 기간 설정
        let startDate, endDate;
        
        if (chapter.lastStudied) {
          // 마지막 학습일이 있는 경우: 마지막 학습일부터 7일간
          startDate = new Date(chapter.lastStudied);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
        } else {
          // 마지막 학습일이 없는 경우: 오늘부터 14일간
          startDate = new Date();
          endDate = new Date();
          endDate.setDate(endDate.getDate() + 14);
        }
        
        // 학습 기간 동안 매일 이벤트 생성
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          studySubjectEvents.push({
            id: `chapter-${subject.id}-${chapter.id}-${d.toISOString().split('T')[0]}`,
            title: `${subject.name}: ${chapter.name}`,
            type: 'study',
            date: d.toISOString().split('T')[0],
            time: '10:00',
            duration: 1.5,
            repeat: 'daily',
            memo: chapter.memo || '학습 예정',
            completed: false,
            subjectColor: subject.color,
            subjectIcon: '📚'
          });
        }
      });

      // 과목 완료 목표일 이벤트 추가
      if (subject.targetCompletionDate) {
        studySubjectEvents.push({
          id: `subject-complete-${subject.id}`,
          title: `${subject.name} 완료 목표`,
          type: 'study',
          date: subject.targetCompletionDate,
          time: '',
          duration: 0,
          repeat: 'none',
          memo: `${subject.completedChapters}/${subject.totalChapters} 챕터 완료`,
          completed: false,
          subjectColor: subject.color,
          subjectIcon: '🎯'
        });
      }
    });
    
    return studySubjectEvents;
  };

  // 원서 학습 데이터를 캘린더 이벤트로 변환
  const getTextbookEvents = () => {
    const textbookEvents = [];
    
    textbooks.forEach(textbook => {
      // 원서 완료 목표일 이벤트 추가
      if (textbook.targetDate) {
        textbookEvents.push({
          id: `textbook-complete-${textbook.id}`,
          title: `${textbook.title} 완료 목표`,
          type: 'reading',
          date: textbook.targetDate,
          time: '',
          duration: 0,
          repeat: 'none',
          memo: `${textbook.currentPage}/${textbook.totalPages}페이지 완료`,
          completed: false,
          textbookColor: textbook.priority === 'high' ? 'red' : textbook.priority === 'medium' ? 'orange' : 'green',
          textbookIcon: '📖'
        });
      }

      // 원서 학습 기간 이벤트 추가
      let startDate, endDate;
      
      if (textbook.lastReadDate && textbook.targetDate) {
        // 마지막 읽은 날짜부터 목표일까지
        startDate = new Date(textbook.lastReadDate);
        endDate = new Date(textbook.targetDate);
      } else if (textbook.targetDate) {
        // 목표일이 있는 경우: 오늘부터 목표일까지
        startDate = new Date();
        endDate = new Date(textbook.targetDate);
      } else if (textbook.lastReadDate) {
        // 마지막 읽은 날짜만 있는 경우: 마지막 읽은 날짜부터 30일간
        startDate = new Date(textbook.lastReadDate);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);
      } else {
        // 아무 정보도 없는 경우: 오늘부터 30일간
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }
      
      // 학습 기간 동안 매일 독서 이벤트 생성
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        textbookEvents.push({
          id: `textbook-daily-${textbook.id}-${d.toISOString().split('T')[0]}`,
          title: `${textbook.title} 독서`,
          type: 'reading',
          date: d.toISOString().split('T')[0],
          time: '20:00',
          duration: 1,
          repeat: 'daily',
          memo: `목표: ${textbook.dailyGoal || 10}페이지`,
          completed: false,
          textbookColor: textbook.priority === 'high' ? 'red' : textbook.priority === 'medium' ? 'orange' : 'green',
          textbookIcon: '📚'
        });
      }
    });
    
    return textbookEvents;
  };

  // 모든 이벤트 통합 (학습 이벤트 + 학습 과목 이벤트 + 원서 학습 이벤트 + 프로젝트 이벤트)
  const allEvents = [...studyEvents, ...getStudySubjectEvents(), ...getTextbookEvents(), ...getProjectEvents()];

  // 날짜 관련 유틸리티 함수들
  const formatDate = (date) => {
    return formatDateUtil(date);
  };

  const getMonthCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    let currentWeek = [];
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentWeek.push(currentDate);
      
      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return calendar;
  };

  const getWeekDays = (date) => {
    const weekDays = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return allEvents.filter(event => event.date === dateStr);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      default:
        break;
    }
    
    setCurrentDate(newDate);
  };

  // 일정 클릭 핸들러
  const handleDateClick = (date) => {
    const eventsForDate = getEventsForDate(date);
    setSelectedDate(date);
    setSelectedEvents(eventsForDate);
    setShowEventModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // 일정 추가/수정/삭제 기능 제거 - 기존 데이터만 표시

  // 월간 보기 렌더링
  const renderMonthView = () => {
    const calendar = getMonthCalendar(currentDate);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-7 border-b">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((date, dayIndex) => {
              const dayEvents = getEventsForDate(date);
              const isToday = isTodayUtil(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              
              return (
                <div 
                  key={dayIndex}
                   className={`min-h-24 p-2 border-r last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  }`}
                   onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                     {dayEvents.slice(0, 3).map(event => {
                      const typeConfig = eventTypes[event.type];
                      const Icon = typeConfig.icon;
                      
                      return (
                        <div 
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded flex items-center gap-1 ${
                            event.projectColor ? 'text-white' : `${typeConfig.color} text-white`
                          } ${event.completed ? 'opacity-60 line-through' : ''}`}
                          style={event.projectColor ? { backgroundColor: event.projectColor } : {}}
                        >
                          {event.projectIcon ? (
                            <span className="text-xs">{event.projectIcon}</span>
                          ) : (
                            <Icon size={10} />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                     {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                         +{dayEvents.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // 주간 보기 렌더링
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r"></div>
          {weekDays.map((date, index) => {
            const isToday = isTodayUtil(date);
            return (
              <div key={index} className="p-3 text-center border-r last:border-r-0">
                <div className="font-medium text-gray-600">
                  {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                </div>
                <div className={`text-lg font-bold mt-1 ${
                  isToday ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {Array.from({ length: 12 }, (_, hour) => hour + 9).map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-12">
            <div className="p-2 border-r text-sm text-gray-500 font-medium">
              {hour}:00
            </div>
            {weekDays.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                // 시간대별 필터링 (시간이 있는 일정만 해당 시간대에 표시)
                const timeFilteredEvents = dayEvents.filter(event => {
                  if (!event.time) return true; // 시간이 없는 일정은 모든 시간대에 표시
                const eventHour = parseInt(event.time?.split(':')[0] || '0');
                return eventHour === hour;
              });
              
              return (
                <div 
                  key={dayIndex}
                  className="p-1 border-r last:border-r-0 cursor-pointer hover:bg-gray-50"
                   onClick={() => handleDateClick(date)}
                >
                   {timeFilteredEvents.map(event => {
                    const typeConfig = eventTypes[event.type];
                    const Icon = typeConfig.icon;
                    
                    return (
                      <div 
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 mb-1 ${
                          event.projectColor ? 'text-white' : `${typeConfig.color} text-white`
                        } ${event.completed ? 'opacity-60 line-through' : ''}`}
                        style={event.projectColor ? { backgroundColor: event.projectColor } : {}}
                      >
                        {event.projectIcon ? (
                          <span className="text-xs">{event.projectIcon}</span>
                        ) : (
                          <Icon size={10} />
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                   {timeFilteredEvents.length === 0 && (
                     <div className="text-xs text-gray-400 text-center py-1">
                       -
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // 일간 보기 렌더링
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const today = new Date();
    const isToday = formatDate(currentDate) === formatDate(today);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
              {isToday && <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">오늘</span>}
            </h3>

          </div>
        </div>
        
        <div className="p-4">
          {dayEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar size={48} className="mx-auto mb-2 opacity-50" />
              <p>오늘 등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => {
                const typeConfig = eventTypes[event.type];
                const Icon = typeConfig.icon;
                
                return (
                  <div 
                    key={event.id}
                     className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                      event.projectColor ? 'border-l-4' : typeConfig.color.replace('bg-', 'border-')
                    } bg-gray-50 ${
                      event.completed ? 'opacity-60' : ''
                    }`}
                    style={event.projectColor ? { borderLeftColor: event.projectColor } : {}}
                     onClick={() => handleDateClick(currentDate)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {event.projectIcon ? (
                            <span className="text-lg">{event.projectIcon}</span>
                          ) : (
                            <Icon size={16} className={typeConfig.color.replace('bg-', 'text-')} />
                          )}
                          <h4 className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                            {event.title}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                            {typeConfig.label}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-4">
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {event.time} ({event.duration}시간)
                              </span>
                            )}
                            {event.repeat !== 'none' && (
                              <span className="flex items-center gap-1">
                                <RotateCcw size={12} />
                                {repeatOptions[event.repeat]}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {event.memo && (
                          <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                            {event.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 해더 - 카드 바깥 */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                학습 캘린더
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">체계적인 일정 관리로 학습 효과를 극대화하세요</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600">오늘 {getEventsForDate(new Date()).length}개 일정</span>
            </div>

          </div>
        </div>
      </div>
      
      {/* 메인 카드 */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-12">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {/* 캘린더 헤더/탭/네비게이션 등 */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateDate(-1)}
                    className="p-2 hover:bg-gray-200 rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-semibold min-w-48 text-center">
                    {view === 'month' && `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
                    {view === 'week' && `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 주`}
                    {view === 'day' && `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`}
                  </h2>
                  <button
                    onClick={() => navigateDate(1)}
                    className="p-2 hover:bg-gray-200 rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    오늘
                  </button>
                </div>
              </div>
              {/* 보기 모드 선택 */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                {[
                  { key: 'month', label: '월간' },
                  { key: 'week', label: '주간' },
                  { key: 'day', label: '일간' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      view === key 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 캘린더 본체 */}
          <div>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </div>
        </div>
      </div>
      
       {/* 일정 상세 모달 */}
       <EventDetailModal
         isOpen={showEventModal}
         onClose={handleCloseModal}
         events={selectedEvents}
         selectedDate={selectedDate}
       />
    </div>
  );
};

export default StudyCalendar;
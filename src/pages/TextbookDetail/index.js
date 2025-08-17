import Breadcrumb from '../../components/common/Breadcrumb';
import WeeklyGoalsWidget from '../../components/plan/WeeklyGoalsWidget';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, BarChart3, MoreHorizontal, Calendar, CheckCircle, Target, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { PdfThumbnail } from '../../utils/pdfAnalyzer';
import { useState, useEffect } from 'react';

// 원서 상세 페이지
const TextbookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 원서 데이터 상태
  const [textbook, setTextbook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 기존 학습 계획 데이터 (요일 정보 추가됨)
  const [studyPlans, setStudyPlans] = useState([]);

  // 데이터 로드
  useEffect(() => {
    const loadTextbookData = () => {
      try {
        const existingBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
        const foundTextbook = existingBooks.find(book => book.id === parseInt(id));
        
        if (!foundTextbook) {
          navigate('/textbook');
          return;
        }

        setTextbook(foundTextbook);
        // 기존 학습 계획 로드 (plan 또는 weeklyGoals)
        const plans = foundTextbook.plan || foundTextbook.weeklyGoals || [];
        setStudyPlans(plans);
      } catch (error) {
        console.error('원서 데이터 로드 실패:', error);
        navigate('/textbook');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadTextbookData();
    }
  }, [id, navigate]);

  // 학습 계획 업데이트 (요일 정보 포함)
  const updateStudyPlans = (updatedPlans) => {
    try {
      const books = JSON.parse(localStorage.getItem('textbooks') || '[]');
      const bookIndex = books.findIndex(book => book.id === parseInt(id));
      
      if (bookIndex !== -1) {
        books[bookIndex] = { 
          ...books[bookIndex], 
          plan: updatedPlans,
          weeklyGoals: updatedPlans // 호환성 유지
        };
        localStorage.setItem('textbooks', JSON.stringify(books));
        setTextbook(prev => ({ ...prev, plan: updatedPlans }));
      }
      
      setStudyPlans(updatedPlans);
    } catch (error) {
      console.error('학습 계획 업데이트 실패:', error);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">원서 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 원서가 없으면 리다이렉트
  if (!textbook) {
    return null;
  }

  // 진행률 계산
  const progress = textbook.totalPages > 0 ? Math.round((textbook.currentPage / textbook.totalPages) * 100) : 0;

  // 학습 시간 포맷팅
  const formatTime = (seconds) => {
    if (!seconds) return '0분';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  // 학습 계획 통계
  const completedChapters = studyPlans.filter(p => p.completed).length;
  const totalChapters = studyPlans.length;
  const todayPlan = studyPlans.find(p => p.date === new Date().toISOString().split('T')[0]);

  // 노트와 하이라이트 개수
  const notes = textbook.notes || [];
  const noteCount = notes.filter(n => n.content && n.content.trim() !== '').length;
  // const highlightCount = notes.filter(n => n.type === 'highlight' || (n.color && !n.content)).length;

  // 제목을 간단하게 표시하는 함수
  const getShortTitle = (title) => {
    if (!title) return '';
    const shortTitle = title.split(/[-–—]/)[0].trim();
    if (shortTitle.length > 25) {
      return shortTitle.substring(0, 25) + '...';
    }
    return shortTitle;
  };

  const handleStartStudy = () => {
    navigate(`/textbook/${id}/study`, { state: { textbookTitle: textbook.title } });
  };

  // 최근 노트 요약
  const getRecentNoteSummaries = () => {
    if (!notes || notes.length === 0) {
      return [
        {
          title: '아직 작성된 노트가 없습니다',
          summary: '학습을 시작하고 노트를 작성해보세요!',
          chapter: '',
          page: '',
          date: '',
          isEmpty: true
        }
      ];
    }

    return notes
      .filter(note => note.content && note.content.trim() !== '')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 2)
      .map(note => ({
        title: note.title || note.content.substring(0, 30) + '...',
        summary: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
        chapter: `페이지 ${note.page || 1}`,
        page: note.page || 1,
        date: new Date(note.updatedAt || note.createdAt).toLocaleDateString('ko-KR'),
        isEmpty: false
      }));
  };

  const noteSummaries = getRecentNoteSummaries();

  // 주간 진도 계산
  // const getWeeklyProgress = () => {
  //   const today = new Date();
  //   const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
  //   const weekDays = [];
  //   const completedDays = [];
    
  //   for (let i = 0; i < 7; i++) {
  //     const day = new Date(startOfWeek);
  //     day.setDate(startOfWeek.getDate() + i);
  //     const dayStr = day.toISOString().split('T')[0];
      
  //     weekDays.push(i);
      
  //     const dayPlan = studyPlans.find(p => p.date === dayStr && p.completed);
  //     if (dayPlan) {
  //       completedDays.push(i);
  //     }
  //   }
    
  //   return { selectedDays: weekDays, completedDays };
  // };

  // const weeklyProgress = getWeeklyProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 상단 바 */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* 페이지 제목 */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{getShortTitle(textbook.title)}</h1>
                  <div className='py-2 flex'>
                    <Breadcrumb />
                  </div>
                </div>

                {/* 우측 액션 버튼들 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <BarChart3 size={16} className="text-blue-500" />
                    <span className="text-xs text-slate-600">{progress}% 완료</span>
                  </div>
                  <button
                    onClick={handleStartStudy}
                    className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Play size={16} />
                    학습 시작
                  </button>
                  <button className="p-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* 통계 카드들 */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <BookOpen size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{progress}%</div>
                      <div className="text-sm text-slate-500">진행률</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{noteCount}</div>
                      <div className="text-sm text-blue-600">작성 노트</div>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Clock size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-900">{formatTime(textbook.studyTime || 0)}</div>
                      <div className="text-sm text-emerald-600">학습 시간</div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900">{completedChapters}/{totalChapters}</div>
                      <div className="text-sm text-orange-600">완료 챕터</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="p-4">
            
            {/* 원서 정보 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 mt-6">
              <div className="p-8">
                <div className="flex items-start space-x-8">
                  <div className="relative">
                    <PdfThumbnail 
                      pdfId={textbook.pdfId || textbook.id.toString()} 
                      width={192} 
                      height={256}
                      className="shadow-lg"
                    />
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {progress}%
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2" title={textbook.title}>
                        {textbook.title}
                      </h1>
                      <p className="text-xl text-gray-600 mb-4" title={textbook.author}>
                        {textbook.author}
                      </p>
                      <div className="flex items-center space-x-4 text-gray-500">
                        <span>출판사: {textbook.publisher}</span>
                        <span>•</span>
                        <span>총 {textbook.totalPages}페이지</span>
                        <span>•</span>
                        <span>현재 {textbook.currentPage}페이지</span>
                      </div>
                      <div className="text-sm text-gray-600 py-1">
                        목표 완료일: {textbook.targetDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 4분할 카드형 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 최근 노트 카드 */}
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">최근 노트</h3>
                  </div>
                  <div className="px-2 py-1 bg-white/80 rounded-full text-xs font-semibold text-blue-700">
                    {noteCount}개
                  </div>
                </div>
                
                <div className="space-y-3">
                  {noteSummaries.slice(0, 1).map((note, idx) => (
                    <div key={idx} className={`p-4 rounded-xl transition-all duration-200 ${
                      note.isEmpty 
                        ? 'bg-white/60 border-2 border-dashed border-blue-200' 
                        : 'bg-white/80 backdrop-blur-sm hover:bg-white/90'
                    }`}>
                      <h4 className={`font-bold mb-2 text-sm line-clamp-1 ${
                        note.isEmpty ? 'text-blue-400' : 'text-blue-900'
                      }`}>
                        {note.title}
                      </h4>
                      <p className={`text-xs mb-3 leading-relaxed line-clamp-3 ${
                        note.isEmpty ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        {note.summary.length > 80 ? note.summary.substring(0, 80) + '...' : note.summary}
                      </p>
                      {!note.isEmpty && (
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-700">
                            {note.chapter}
                          </span>
                          <span className="text-xs text-blue-500 font-medium">{note.date}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {noteCount > 1 && (
                    <button 
                      onClick={() => navigate(`/textbook/${id}/study?view=notes`)}
                      className="w-full mt-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200"
                    >
                      전체 {noteCount}개 노트 보기 →
                    </button>
                  )}
                </div>
              </div>
              
              {/* 학습 현황 카드 */}
              <div className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900">학습 현황</h3>
                  </div>
                  <div className="px-3 py-2 bg-white/80 rounded-full">
                    <span className="text-2xl font-bold text-emerald-700">{progress}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">전체 진도율</span>
                      <span className="text-sm font-bold text-emerald-800">{textbook.currentPage}p / {textbook.totalPages}p</span>
                    </div>
                    <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 shadow-sm" 
                           style={{ width: `${progress}%` }}>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700">{formatTime(textbook.studyTime || 0).split(' ')[0]}</div>
                        <div className="text-xs text-emerald-600 font-medium">학습시간</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700">{Math.ceil((textbook.totalPages - textbook.currentPage) / 20) || 0}</div>
                        <div className="text-xs text-emerald-600 font-medium">예상 남은일</div>
                      </div>
                    </div>
                  </div>

                  {todayPlan && (
                    <div className="bg-emerald-100/80 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">오늘의 목표</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium">{todayPlan.chapter}</p>
                      {todayPlan.completed && (
                        <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-emerald-200 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-700">완료!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 학습 계획 현황 카드 */}
              <div className="group bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 hover:border-violet-200 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-violet-100 rounded-xl group-hover:bg-violet-200 transition-colors">
                      <Target className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-bold text-violet-900">학습 계획</h3>
                  </div>
                  <div className="px-3 py-1 bg-white/80 rounded-full text-sm font-bold text-violet-700">
                    {completedChapters}/{totalChapters}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {totalChapters > 0 && (
                    <div className="relative">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-violet-700">완료율</span>
                        <span className="text-sm font-bold text-violet-800">
                          {Math.round((completedChapters / totalChapters) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-violet-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full transition-all duration-700 shadow-sm" 
                             style={{ width: `${(completedChapters / totalChapters) * 100}%` }}>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-violet-700">{completedChapters}</div>
                        <div className="text-xs text-violet-600 font-medium">완료</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-violet-700">{totalChapters - completedChapters}</div>
                        <div className="text-xs text-violet-600 font-medium">남은 계획</div>
                      </div>
                    </div>
                  </div>

                  {studyPlans.length > 0 && (
                    <div className="bg-violet-100/80 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs font-bold text-violet-700 mb-2">다음 계획</div>
                      {(() => {
                        const nextPlan = studyPlans.find(p => !p.completed);
                        if (nextPlan) {
                          return (
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-violet-800 line-clamp-1">
                                {nextPlan.title || nextPlan.chapter}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-violet-200 rounded-full text-xs font-medium text-violet-700">
                                  {nextPlan.week ? `${nextPlan.week}주차` : nextPlan.date}
                                </span>
                              </div>
                            </div>
                          );
                        } else if (studyPlans.length > 0) {
                          return (
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-200 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-bold text-emerald-700">모든 계획 완료!</span>
                            </div>
                          );
                        } else {
                          return (
                            <span className="text-sm text-violet-600">아직 계획이 없습니다</span>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 주간 학습 목표 카드 */}
              <WeeklyGoalsWidget
                studyPlans={studyPlans}
                onStudyPlansUpdate={updateStudyPlans}
                className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextbookDetailPage;
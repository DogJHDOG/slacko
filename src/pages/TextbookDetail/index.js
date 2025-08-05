import Breadcrumb from '../../components/common/Breadcrumb';
import WeeklyProgress from '../../components/common/WeeklyProgress';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Book, BarChart3, MoreHorizontal, Calendar, CheckCircle} from 'lucide-react';
import { PdfThumbnail } from '../../utils/pdfAnalyzer';
import { useState, useEffect } from 'react';

// 원서 상세 페이지
const TextbookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 원서 데이터 상태
  const [textbook, setTextbook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [id, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // 학습 계획 통계 (향상된 계산)
  const studyPlan = textbook.plan || [];
  const completedChapters = studyPlan.filter(p => p.completed).length;
  const totalChapters = studyPlan.length;
  const todayPlan = studyPlan.find(p => p.date === new Date().toISOString().split('T')[0]);

  // 노트와 하이라이트 개수 (정확한 계산)
  const notes = textbook.notes || [];
  const noteCount = notes.filter(n => n.content && n.content.trim() !== '').length;
  const highlightCount = notes.filter(n => n.type === 'highlight' || (n.color && !n.content)).length;

  // 제목을 간단하게 표시하는 함수
  const getShortTitle = (title) => {
    if (!title) return '';
    
    // 파일명에서 추출된 긴 제목을 간단하게 처리
    // 예: "컴파일러-Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman - Compilers - Principles, Techniques, and Tools (2006, Pearson_Addison Wesley) - libgen.li"
    // → "컴파일러"로 표시
    
    // 첫 번째 하이픈이나 대시 이전의 부분만 사용
    const shortTitle = title.split(/[-–—]/)[0].trim();
    
    // 25자 이상이면 "..." 추가 (더 적절한 길이)
    if (shortTitle.length > 25) {
      return shortTitle.substring(0, 25) + '...';
    }
    
    return shortTitle;
  };

  // 저자 정보도 간단하게 표시하는 함수
  const getShortAuthor = (author) => {
    if (!author) return '';
    
    // 저자가 여러 명인 경우 첫 번째 저자만 표시
    const firstAuthor = author.split(',')[0].trim();
    
    // 20자 이상이면 "..." 추가 (더 적절한 길이)
    if (firstAuthor.length > 20) {
      return firstAuthor.substring(0, 20) + '...';
    }
    
    return firstAuthor;
  };

  const handleStartStudy = () => {
    navigate(`/textbook/${id}/study`, { state: { textbookTitle: textbook.title } });
  };

  // 최근 노트 요약 (실제 데이터 기반)
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

    // 최근 2개의 노트만 표시
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

  // 주간 진도 계산 (실제 계획 기반)
  const getWeeklyProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // 일요일
    
    const weekDays = [];
    const completedDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      
      weekDays.push(i);
      
      // 해당 날짜의 계획이 완료되었는지 확인
      const dayPlan = studyPlan.find(p => p.date === dayStr && p.completed);
      if (dayPlan) {
        completedDays.push(i);
      }
    }
    
    return { selectedDays: weekDays, completedDays };
  };

  const weeklyProgress = getWeeklyProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 해더 */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Book size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                원서 상세
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">원서 학습 현황을 한눈에 확인하세요!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/50">
              <BarChart3 size={16} className="text-blue-500" />
              <span className="text-xs text-slate-600">{progress}% 완료</span>
            </div>
            <button className="p-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        {/* 원서 정보 카드: 가장 위로 이동 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start space-x-8">
              <div className="relative">
                {/* PDF 썸네일 컴포넌트 사용 */}
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
                    {getShortTitle(textbook.title)}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4" title={textbook.author}>
                    {getShortAuthor(textbook.author)}
                  </p>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span>출판사: {textbook.publisher}</span>
                    <span>•</span>
                    <span>총 {textbook.totalPages}페이지</span>
                    <span>•</span>
                    <span>현재 {textbook.currentPage}페이지</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{progress}%</div>
                    <div className="text-sm text-blue-700">진행률</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{noteCount}</div>
                    <div className="text-sm text-green-700">노트</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{formatTime(textbook.studyTime || 0)}</div>
                    <div className="text-sm text-purple-700">학습 시간</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{completedChapters}/{totalChapters}</div>
                    <div className="text-sm text-orange-700">완료 챕터</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleStartStudy}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>학습 시작하기</span>
                  </button>
                  <div className="text-sm text-gray-600">
                    목표 완료일: {textbook.targetDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3분할 카드형 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 노트 요약 카드 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">최근 노트</h3>
            {noteSummaries.map((note, idx) => (
              <div key={idx} className={`p-3 rounded-lg mb-2 ${note.isEmpty ? 'bg-gray-50 border-2 border-dashed border-gray-200' : 'bg-blue-50'}`}>
                <h4 className={`font-semibold mb-1 ${note.isEmpty ? 'text-gray-500' : 'text-blue-800'}`}>
                  {note.title}
                </h4>
                <p className={`text-sm mb-1 ${note.isEmpty ? 'text-gray-400' : 'text-blue-700'}`}>
                  {note.summary}
                </p>
                {!note.isEmpty && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-blue-600">{note.chapter}</span>
                    <span className="text-xs text-blue-400">{note.date}</span>
                  </div>
                )}
              </div>
            ))}
            {noteCount > 2 && (
              <div className="text-center">
                <button 
                  onClick={() => navigate(`/textbook/${id}/study?view=notes`)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  전체 노트 보기 ({noteCount}개)
                </button>
              </div>
            )}
          </div>
          
          {/* 학습 현황 카드 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">학습 현황</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-700 font-bold text-2xl">{progress}%</span>
                <span className="text-gray-600 text-sm">진도율</span>
              </div>
              <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>현재 페이지 <span className="font-bold text-green-700">{textbook.currentPage}</span> / {textbook.totalPages}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>시작일: {textbook.startDate}</span>
                <span>목표 완료일: {textbook.targetDate}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>학습 목적: {textbook.purpose}</span>
                <span>학습 강도: {textbook.intensity}</span>
              </div>
              {todayPlan && (
                <div className="bg-green-50 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">오늘의 계획</span>
                  </div>
                  <p className="text-sm text-green-700">{todayPlan.chapter}</p>
                  {todayPlan.completed && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">완료됨</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 학습 계획 현황 카드 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">학습 계획</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-purple-700 font-bold text-2xl">{completedChapters}</span>
                <span className="text-gray-600 text-sm">/ {totalChapters} 챕터</span>
              </div>
              
              {totalChapters > 0 && (
                <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(completedChapters / totalChapters) * 100}%` }}
                  ></div>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>완료: <span className="font-bold text-purple-700">{completedChapters}</span></span>
                <span>남은 계획: <span className="font-bold text-purple-700">{totalChapters - completedChapters}</span></span>
              </div>
              
              {studyPlan.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3 mt-2">
                  <div className="text-xs text-purple-700 mb-1">다음 학습 계획</div>
                  {(() => {
                    const nextPlan = studyPlan.find(p => !p.completed);
                    if (nextPlan) {
                      return (
                        <div>
                          <p className="text-sm font-medium text-purple-800">{nextPlan.chapter}</p>
                          <p className="text-xs text-purple-600 mt-1">목표일: {nextPlan.date}</p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">모든 계획 완료!</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 학습 현황 및 목표: 2분할로 다시 추가 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WeeklyProgress 
            selectedDays={weeklyProgress.selectedDays}
            completedDays={weeklyProgress.completedDays}
          />
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 목표 및 통계</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">목표 완료일</span>
                <span className="font-semibold text-blue-600">{textbook.targetDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">학습 강도</span>
                <span className="font-semibold">{textbook.intensity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">총 학습 시간</span>
                <span className="font-semibold">{formatTime(textbook.studyTime || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">학습 목적</span>
                <span className="font-semibold">{textbook.purpose}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">작성한 노트</span>
                <span className="font-semibold text-green-600">{noteCount}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">하이라이트</span>
                <span className="font-semibold text-yellow-600">{highlightCount}개</span>
              </div>
              {textbook.lastStudiedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">마지막 학습</span>
                  <span className="font-semibold text-gray-600">
                    {new Date(textbook.lastStudiedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextbookDetailPage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Plus, Book, Library } from 'lucide-react';
import { useStudyContext } from '../../context/StudyContext';

export default function TextbookManagement() {
  const navigate = useNavigate();
  const { textbooks, deleteTextbook } = useStudyContext();
  const [books, setBooks] = useState([]);

  // 제목을 간단하게 표시하는 함수
  const getShortTitle = (title) => {
    if (!title) return '';
    
    // 파일명에서 추출된 긴 제목을 간단하게 처리
    // 첫 번째 하이픈이나 대시 이전의 부분만 사용
    const shortTitle = title.split(/[-–—]/)[0].trim();
    
    // 25자 이상이면 "..." 추가
    if (shortTitle.length > 25) {
      return shortTitle.substring(0, 25) + '...';
    }
    
    return shortTitle;
  };

  // 컴포넌트 마운트 시 StudyContext의 textbooks 데이터 사용
  useEffect(() => {
    setBooks(textbooks);
  }, [textbooks]);

  const [filterStatus, setFilterStatus] = useState('전체');

  const openBookDetail = (book) => {
    // 상세 페이지로 이동
    navigate(`/textbook/${book.id}`);
  };

  const openAddBookPage = () => {
    // 새 원서 생성 페이지로 이동
    navigate('/textbook/add');
  };

  const getProgressPercentage = (currentPage, totalPages) => {
    return Math.round((currentPage / totalPages) * 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRecommendedDailyPages = (book) => {
    const remainingPages = book.totalPages - book.currentPage;
    const daysRemaining = getDaysRemaining(book.targetDate);
    if (daysRemaining <= 0) return 0;
    return Math.ceil(remainingPages / daysRemaining);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const filteredBooks = books.filter(book => {
    if (filterStatus === '전체') return true;
    return book.status === filterStatus;
  });

  const BookCard = ({ book }) => {
    const progressPercentage = getProgressPercentage(book.currentPage, book.totalPages);
    const recommendedPages = getRecommendedDailyPages(book);
    const statusColor = {
      '읽는 중': 'bg-blue-100 text-blue-800 border-blue-200',
      '완료': 'bg-green-100 text-green-800 border-green-200',
      '미시작': 'bg-gray-100 text-gray-800 border-gray-200'
    }[book.status];

    const statusIcon = {
      '읽는 중': '📖',
      '완료': '✅',
      '미시작': '📚'
    }[book.status];

    // 원서 삭제 핸들러
    const handleDelete = (e) => {
      e.stopPropagation();
      if (window.confirm('정말 이 원서를 삭제하시겠습니까?\n\n삭제된 원서는 복구할 수 없습니다.')) {
        try {
          // StudyContext의 deleteTextbook 함수 사용
          deleteTextbook(book.id);
          
          // 청크 데이터 삭제 (있는 경우)
          if (book.file && book.file.isChunked && book.file.totalChunks) {
            console.log('청크 데이터 삭제 시작:', {
              bookId: book.id,
              totalChunks: book.file.totalChunks
            });
            
            for (let i = 0; i < book.file.totalChunks; i++) {
              const chunkKey = `textbook_${book.id}_chunk_${i}`;
              localStorage.removeItem(chunkKey);
              console.log('청크 삭제:', chunkKey);
            }
            
            console.log('청크 데이터 삭제 완료');
          }
          
          // 성공 메시지
          alert('원서가 성공적으로 삭제되었습니다.');
          
        } catch (error) {
          console.error('원서 삭제 중 오류:', error);
          alert('원서 삭제 중 오류가 발생했습니다.');
        }
      }
    };

    return (
      <div 
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden hover:border-blue-200"
        onClick={() => openBookDetail(book)}
      >
        {/* 상단 이미지 영역 */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          <div className="relative z-10 text-center">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
              {book.publisher}
            </div>
          </div>
          {/* 상태 배지 */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
            <span className="mr-1">{statusIcon}</span>
            {book.status}
          </div>
          {/* 삭제 버튼 */}
          <button
            className="absolute top-3 left-3 bg-red-100 text-red-600 rounded-full px-2 py-1 text-xs font-semibold shadow hover:bg-red-200 transition"
            onClick={handleDelete}
            title="원서 삭제"
          >
            삭제
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-6">
          {/* 제목과 저자 */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={book.title}>
              {getShortTitle(book.title)}
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-2">✍️</span>
              {book.author}
            </p>
          </div>

          {/* 진행률 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">진행률</span>
              <span className="text-sm text-gray-500">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{book.currentPage}p</span>
              <span>{book.totalPages}p</span>
            </div>
          </div>

          {/* 학습 정보 */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">목표일</span>
              <span className="font-medium text-gray-700">{formatDate(book.targetDate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">남은 일수</span>
              <span className={`font-medium ${getDaysRemaining(book.targetDate) < 7 ? 'text-red-600' : 'text-gray-700'}`}>
                {getDaysRemaining(book.targetDate)}일
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">일일 권장</span>
              <span className="font-medium text-blue-600">{recommendedPages}p</span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openBookDetail(book);
              }}
            >
              📖 읽기
            </button>
            <button 
              className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // 노트 보기 기능
              }}
            >
              📝 노트
            </button>
        </div>
        </div>
      </div>
    );
  };

  // 전체 원서 삭제 핸들러
  const handleDeleteAll = () => {
    try {
      console.log('즉시 정리 시작');
      
      // localStorage 완전 초기화
      localStorage.clear();
      console.log('localStorage 완전 초기화 완료');
      
      // 상태 업데이트
      setBooks([]);
      
      console.log('즉시 정리 완료');
      alert('모든 데이터가 즉시 정리되었습니다.\nlocalStorage가 완전히 초기화되었습니다.');
      
    } catch (error) {
      console.error('즉시 정리 중 오류:', error);
      alert('즉시 정리 중 오류가 발생했습니다.');
    }
  };

  // localStorage 정리 (고아 청크 데이터 삭제)
  const cleanupOrphanedChunks = () => {
    try {
      console.log('고아 청크 데이터 정리 시작');
      
      // 현재 원서 ID 목록
      const savedBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
      const bookIds = savedBooks.map(book => book.id);
      
      // 모든 localStorage 키 확인
      const allKeys = Object.keys(localStorage);
      const chunkKeys = allKeys.filter(key => key.startsWith('textbook_') && key.includes('chunk_'));
      
      // 고아 청크 찾기 및 삭제
      let deletedCount = 0;
      chunkKeys.forEach(key => {
        const match = key.match(/textbook_(\d+)_chunk_(\d+)/);
        if (match) {
          const bookId = parseInt(match[1]);
          if (!bookIds.includes(bookId)) {
            localStorage.removeItem(key);
            deletedCount++;
            console.log('고아 청크 삭제:', key);
          }
        }
      });
      
      console.log(`고아 청크 ${deletedCount}개 삭제 완료`);
      return deletedCount;
      
    } catch (error) {
      console.error('고아 청크 정리 중 오류:', error);
      return 0;
    }
  };

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
                원서 관리
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">진행 중인 원서들을 한눈에 관리하세요!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200/50">
              <Library size={16} className="text-blue-500" />
              <span className="text-xs text-slate-600">총 {books.length}권</span>
            </div>
            
            {/* 정리 버튼 */}
            <button 
              className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
              onClick={() => {
                const deletedCount = cleanupOrphanedChunks();
                if (deletedCount > 0) {
                  alert(`${deletedCount}개의 고아 청크 데이터가 정리되었습니다.`);
                } else {
                  alert('정리할 고아 데이터가 없습니다.');
                }
              }}
              title="고아 청크 데이터 정리"
            >
              🧹 정리
            </button>
            
            {/* 즉시 정리 버튼 */}
            <button 
              className="px-3 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
              onClick={handleDeleteAll}
              title="모든 데이터 즉시 정리"
            >
              🗑️ 즉시 정리
            </button>
            
            <button 
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 font-medium"
              onClick={openAddBookPage}
            >
              <Plus size={18} /> 새 원서
            </button>
          </div>
        </div>
      </div>
      
      {/* 메인 컨테이너 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {/* 필터 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">상태별 필터:</span>
            </div>
            <div className="flex gap-3 flex-wrap">
            {['전체', '읽는 중', '완료', '미시작'].map(status => (
                <button
                key={status}
                onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterStatus === status 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                  }`}
              >
                {status}
                </button>
            ))}
            </div>
          </div>
          
          {/* 원서 카드 리스트 */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 등록된 원서가 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 원서를 추가하고 학습을 시작해보세요!</p>
              <Button 
                onClick={openAddBookPage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                첫 원서 추가하기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
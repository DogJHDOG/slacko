import React, { useState, useMemo } from 'react';
import { Search, Filter, StickyNote, MessageSquare, Calendar, ChevronDown, ChevronRight, X } from 'lucide-react';

const MemoListPanel = ({ 
  allNotes = [], 
  pdfAnnotations = [], 
  currentPage, 
  onNoteClick, 
  onAnnotationClick,
  tableOfContents = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, notes, annotations
  const [sortBy, setSortBy] = useState('recent'); // recent, page, alphabetical
  const [showFilters, setShowFilters] = useState(false);

  // 모든 메모 데이터 통합
  const allMemos = useMemo(() => {
    const notes = allNotes.map(note => ({
      ...note,
      type: 'note',
      displayType: '노트',
      icon: StickyNote,
      color: note.color || 'blue'
    }));

    const annotations = pdfAnnotations.map(annotation => ({
      ...annotation,
      type: 'annotation',
      displayType: 'PDF 메모',
      icon: MessageSquare,
      title: annotation.text,
      content: annotation.memo,
      color: annotation.colorName || 'yellow'
    }));

    return [...notes, ...annotations];
  }, [allNotes, pdfAnnotations]);

  // 필터링 및 정렬
  const filteredAndSortedMemos = useMemo(() => {
    let filtered = allMemos;

    // 타입 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(memo => memo.type === filterType);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(memo => 
        memo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'page':
          return (a.page || a.pageNumber || 0) - (b.page || b.pageNumber || 0);
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '');
        case 'recent':
        default:
          return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
    });

    return filtered;
  }, [allMemos, searchTerm, filterType, sortBy]);

  // 페이지별 그룹화
  const memosByPage = useMemo(() => {
    const grouped = {};
    filteredAndSortedMemos.forEach(memo => {
      const page = memo.page || memo.pageNumber || 1;
      if (!grouped[page]) {
        grouped[page] = [];
      }
      grouped[page].push(memo);
    });
    return grouped;
  }, [filteredAndSortedMemos]);

  // 챕터 정보 가져오기
  const getChapterForPage = (page) => {
    if (!tableOfContents || tableOfContents.length === 0) return null;
    
    for (let i = 0; i < tableOfContents.length; i++) {
      const item = tableOfContents[i];
      if (item.level === 0 && item.page && page >= item.page) {
        const nextChapter = tableOfContents.find((next, idx) => 
          idx > i && next.level === 0 && next.page
        );
        if (!nextChapter || page < nextChapter.page) {
          return item.title;
        }
      }
    }
    return null;
  };

  const handleMemoClick = (memo) => {
    if (memo.type === 'note' && onNoteClick) {
      onNoteClick(memo);
    } else if (memo.type === 'annotation' && onAnnotationClick) {
      onAnnotationClick(memo);
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  if (allMemos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">아직 작성된 메모가 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">텍스트를 선택하여 메모를 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">메모 목록</h3>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredAndSortedMemos.length}개
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="메모 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">타입</label>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: '전체' },
                  { value: 'note', label: '노트' },
                  { value: 'annotation', label: 'PDF 메모' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filterType === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">정렬</label>
              <div className="flex space-x-2">
                {[
                  { value: 'recent', label: '최신순' },
                  { value: 'page', label: '페이지순' },
                  { value: 'alphabetical', label: '가나다순' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      sortBy === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메모 목록 */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(memosByPage).length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(memosByPage)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([page, memos]) => (
                <div key={page} className="space-y-2">
                  {/* 페이지 헤더 */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      parseInt(page) === currentPage 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      P.{page}
                    </div>
                    {getChapterForPage(parseInt(page)) && (
                      <div className="text-xs text-gray-500 truncate">
                        {getChapterForPage(parseInt(page))}
                      </div>
                    )}
                  </div>

                  {/* 메모들 */}
                  {memos.map((memo) => {
                    const IconComponent = memo.icon;
                    return (
                      <div
                        key={memo.id}
                        onClick={() => handleMemoClick(memo)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getColorClass(memo.color)}`}
                      >
                        <div className="flex items-start space-x-2">
                          <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium opacity-75">
                                {memo.displayType}
                              </span>
                              <span className="text-xs opacity-60">
                                {memo.createdAt ? new Date(memo.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium mb-1 line-clamp-1">
                              {memo.title || '제목 없음'}
                            </h4>
                            <p className="text-xs opacity-75 line-clamp-2">
                              {memo.content || memo.memo || '내용 없음'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoListPanel;
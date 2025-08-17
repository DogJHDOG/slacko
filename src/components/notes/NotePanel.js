import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Edit3, Trash2, Hash, FileText, Lightbulb as LightbulbIcon, AlertCircle, Star, NotebookPen, Search} from 'lucide-react';

// 노트 에디터 컴포넌트
const NoteEditor = ({ note, onSave, onCancel, isNew = false, currentPage = 1, selectedText = '', getChapterInfo }) => {
  const [title, setTitle] = useState(note?.title || selectedText || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [color, setColor] = useState(note?.color || 'blue');
  const [tagInput, setTagInput] = useState('');
  const [noteType, setNoteType] = useState(note?.type || 'note');

  const noteColors = [
    { name: 'Blue', value: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    { name: 'Green', value: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
    { name: 'Red', value: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
    { name: 'Gray', value: 'gray', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' }
  ];

  const noteTypes = [
    { value: 'note', label: '일반 노트', icon: FileText },
    { value: 'concept', label: '개념 정리', icon: LightbulbIcon },
    { value: 'question', label: '질문', icon: AlertCircle },
    { value: 'important', label: '중요 내용', icon: Star },
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    const noteData = {
      ...note,
      title: title || '제목 없음',
      content,
      tags,
      color,
      type: noteType,
      page: currentPage,
      updatedAt: new Date().toISOString(),
      ...(isNew && { id: Date.now(), createdAt: new Date().toISOString() })
    };
    onSave(noteData);
  };

  const selectedColor = noteColors.find(c => c.value === color) || noteColors[0];

  // 페이지 정보 메모이제이션 - getChapterInfo 호출 최소화
  const pageInfo = useMemo(() => {
    if (getChapterInfo && typeof getChapterInfo === 'function') {
      try {
        return getChapterInfo(currentPage);
      } catch (error) {
        console.warn('챕터 정보 가져오기 실패:', error);
        return `P.${currentPage}`;
      }
    }
    return `P.${currentPage}`;
  }, [getChapterInfo, currentPage]);

  return (
    <div className={`${selectedColor.bg} ${selectedColor.border} border rounded-xl p-3 sm:p-4 mb-4`}>
      <div className="space-y-3 sm:space-y-4">
        {/* 페이지 정보 및 타입 선택 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm max-w-[100px] sm:max-w-[140px] truncate" title={pageInfo}>
              {pageInfo}
            </span>
            <select 
              value={noteType} 
              onChange={(e) => setNoteType(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm max-w-[120px] sm:max-w-none"
            >
              {noteTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {/* 색상 선택 - 더 작고 컴팩트하게 */}
          <div className="flex items-center justify-left">
            <div className="flex items-center space-x-1 bg-white bg-opacity-50 rounded-lg px-2 py-1">
              {noteColors.map(colorOption => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`w-4 h-4 rounded-full ${colorOption.bg} ${colorOption.border} border hover:scale-110 transition-transform shadow-sm ${
                    color === colorOption.value ? 'ring-1 ring-gray-400' : ''
                  }`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 제목 입력 */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="노트 제목을 입력하세요..."
            className="w-full text-base sm:text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-500"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            className="w-full h-32 sm:h-40 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-sm leading-relaxed"
          />
        </div>

        {/* 태그 */}
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-white bg-opacity-70 rounded-full shadow-sm">
                <Hash className="w-3 h-3 mr-1" />
                <span className="max-w-[80px] truncate">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="태그 추가..."
              className="flex-1 text-xs bg-white bg-opacity-60 border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:border-blue-300 shadow-sm"
            />
            <button
              onClick={addTag}
              className="px-3 py-1 text-xs bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              추가
            </button>
          </div>
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-white bg-opacity-90 hover:bg-opacity-100 text-sm font-medium py-2 rounded-lg transition-colors shadow-sm"
          >
            저장
          </button>
          <button
            onClick={onCancel}
            className="px-4 bg-white bg-opacity-70 hover:bg-opacity-90 text-sm py-2 rounded-lg transition-colors shadow-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

// 노트 카드 컴포넌트 - 메모이제이션 적용
const NoteCard = React.memo(({ note, onEdit, onDelete, getChapterInfo }) => {
  const noteColors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' }
  };

  const noteTypes = {
    note: { label: '일반 노트', icon: FileText, color: 'text-blue-500' },
    concept: { label: '개념 정리', icon: LightbulbIcon, color: 'text-yellow-500' },
    question: { label: '질문', icon: AlertCircle, color: 'text-red-500' },
    important: { label: '중요 내용', icon: Star, color: 'text-purple-500' },
  };

  const colorScheme = noteColors[note.color] || noteColors.blue;
  const typeInfo = noteTypes[note.type] || noteTypes.note;
  const TypeIcon = typeInfo.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${Math.floor(hours)}시간 전`;
    if (hours < 168) return `${Math.floor(hours / 24)}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 페이지 정보 메모이제이션
  const pageInfo = useMemo(() => {
    if (getChapterInfo && typeof getChapterInfo === 'function') {
      try {
        return getChapterInfo(note.page);
      } catch (error) {
        console.warn('챕터 정보 가져오기 실패:', error);
        return `P.${note.page}`;
      }
    }
    return `P.${note.page}`;
  }, [getChapterInfo, note.page]);

  return (
    <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-xl p-3 sm:p-4 mb-3 group hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <TypeIcon className={`w-4 h-4 ${typeInfo.color} flex-shrink-0`} />
          <span className={`text-xs font-medium ${colorScheme.text} opacity-75 truncate`}>
            {typeInfo.label}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1 hover:bg-white hover:bg-opacity-70 rounded transition-colors"
          >
            <Edit3 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 hover:bg-white hover:bg-opacity-70 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm max-w-[120px] sm:max-w-xs truncate" title={pageInfo}>
            {pageInfo}
          </span>
        </div>
        <h3 className={`font-semibold ${colorScheme.text} text-sm break-words`}>
          {note.title}
        </h3>
      </div>

      <p className={`${colorScheme.text} opacity-75 text-sm leading-relaxed mb-3 break-words`}>
        {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 text-xs bg-white bg-opacity-70 rounded-full shadow-sm">
              <Hash className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
              <span className="max-w-[60px] truncate">{tag}</span>
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className={`text-xs ${colorScheme.text} opacity-50`}>
        {formatDate(note.updatedAt || note.createdAt)}
      </div>
    </div>
  );
});

// 챕터 제목 포맷팅 유틸리티 함수 (컴포넌트 외부에 정의)
const formatChapterTitle = (title) => {
  if (!title) return '제목 없음';
  let formatted = title;
  if (formatted.length > 20) {
    formatted = formatted.substring(0, 17) + '...';
  }
  return formatted
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// 노트 패널 컴포넌트 - 메모이제이션 최적화
const NotePanel = ({ 
  isVisible, 
  onToggle, 
  notes: externalNotes = [], 
  selectedText = '', 
  currentPage = 1, 
  shouldOpenEditor = false, 
  onEditorOpened, 
  onNoteSave, 
  tableOfContents = [] 
}) => {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // 목차 데이터 변경 감지 (한 번만 로그)
  useEffect(() => {
    if (tableOfContents && tableOfContents.length > 0) {
      console.log('🎯 NotePanel 목차 데이터 업데이트:', {
        length: tableOfContents.length,
        firstChapter: tableOfContents[0]?.title,
        timestamp: new Date().toISOString()
      });
    }
  }, [tableOfContents]);

  // 챕터 정보 캐시 생성 - useMemo로 메모이제이션
  const chapterCache = useMemo(() => {
    console.log('🔄 챕터 캐시 생성 중...');
    if (!tableOfContents || !Array.isArray(tableOfContents) || tableOfContents.length === 0) {
      console.log('⚠️ 목차 데이터 없음, 캐시 생성 불가');
      return new Map();
    }

    const cache = new Map();
    const chapters = tableOfContents.filter(item => item.level === 0 || item.level === undefined);
    console.log('📚 캐시 생성용 챕터:', chapters.length, '개');

    // 각 챕터의 페이지 범위를 미리 계산
    for (let i = 0; i < chapters.length; i++) {
      const item = chapters[i];
      if (!item.page || typeof item.page !== 'number') continue;

      // 다음 챕터의 시작 페이지 찾기
      let nextChapterPage = Number.MAX_SAFE_INTEGER;
      for (let j = i + 1; j < chapters.length; j++) {
        if (chapters[j].page && typeof chapters[j].page === 'number') {
          nextChapterPage = chapters[j].page;
          break;
        }
      }

      // 이 챕터의 모든 페이지를 캐시에 추가
      const chapterTitle = formatChapterTitle(item.title);
      for (let page = item.page; page < nextChapterPage && page < item.page + 100; page++) {
        cache.set(page, `${chapterTitle}.P${page}`);
      }
    }

    console.log('✅ 챕터 캐시 생성 완료:', cache.size, '페이지');
    return cache;
  }, [tableOfContents]);

  // 최적화된 getChapterInfo 함수 - 캐시 사용
  const getChapterInfo = useCallback((page) => {
    // 캐시에서 먼저 확인
    if (chapterCache.has(page)) {
      return chapterCache.get(page);
    }
    // 캐시에 없으면 기본값 반환
    console.log('⚠️ 캐시에서 페이지를 찾을 수 없음:', page);
    return `P.${page}`;
  }, [chapterCache]);

  useEffect(() => {
    setNotes(externalNotes);
  }, [externalNotes]);

  useEffect(() => {
    if (shouldOpenEditor) {
      setIsCreating(true);
      onEditorOpened?.();
    }
  }, [shouldOpenEditor, onEditorOpened]);

  const handleSaveNote = useCallback((noteData) => {
    if (editingNote) {
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id ? { ...note, ...noteData } : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
    } else {
      const newNote = { ...noteData, id: Date.now() };
      setNotes([newNote, ...notes]);
      setIsCreating(false);
    }
    onNoteSave?.(noteData);
  }, [editingNote, notes, onNoteSave]);

  const handleDeleteNote = useCallback((noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  }, [notes]);

  const handleEditNote = useCallback((note) => {
    setEditingNote(note);
    setIsCreating(false);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingNote(null);
    setIsCreating(false);
  }, []);

  // 필터링된 노트 메모이제이션
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || note.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [notes, searchTerm, filterType]);

  // 정렬된 노트 메모이제이션
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === 'page') {
        return a.page - b.page;
      }
      return a.title.localeCompare(b.title);
    });
  }, [filteredNotes, sortBy]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
            <NotebookPen className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">노트</span>
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
              {notes.length}
            </span>
          </h2>
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="노트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="all">전체</option>
              <option value="note">노트</option>
              <option value="concept">개념</option>
              <option value="question">질문</option>
              <option value="important">중요</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="date">최신순</option>
              <option value="page">페이지순</option>
              <option value="title">제목순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 노트 목록 */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {editingNote && (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={cancelEditing}
            currentPage={currentPage}
            selectedText={selectedText}
            getChapterInfo={getChapterInfo}
          />
        )}

        {isCreating && (
          <NoteEditor
            onSave={handleSaveNote}
            onCancel={cancelEditing}
            isNew={true}
            currentPage={currentPage}
            selectedText={selectedText}
            getChapterInfo={getChapterInfo}
          />
        )}

        {!editingNote && !isCreating && (
          <>
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-4 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 group"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium transition-colors">
                새 노트 작성
              </span>
            </button>

            <div className="space-y-3">
              {sortedNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <NotebookPen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">
                    {searchTerm || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 노트가 없습니다'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 px-4">
                    {searchTerm || filterType !== 'all' 
                      ? '다른 검색어나 필터를 시도해보세요' 
                      : '텍스트를 선택하고 노트를 작성해보세요'}
                  </p>
                </div>
              ) : (
                sortedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    getChapterInfo={getChapterInfo}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotePanel;
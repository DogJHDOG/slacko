import React, { useState, useEffect } from 'react';
import { Plus, X, Edit3, Trash2, Hash, FileText, Lightbulb as LightbulbIcon, AlertCircle, Star, NotebookPen, Search} from 'lucide-react';

// 노트 에디터 컴포넌트
const NoteEditor = ({ note, onSave, onCancel, isNew = false, currentPage = 1, selectedText = '' }) => {
    const [title, setTitle] = useState(note?.title || selectedText || '');
    const [content, setContent] = useState(note?.content || '');
    const [tags, setTags] = useState(note?.tags || []);
    const [color, setColor] = useState(note?.color || 'blue');
    const [tagInput, setTagInput] = useState('');
    const [noteType, setNoteType] = useState(note?.type || 'memo');
  
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
  
    return (
      <div className={`${selectedColor.bg} ${selectedColor.border} border rounded-xl p-4 mb-4`}>
        <div className="space-y-4">
          {/* 페이지 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-block bg-gray-100 text-blue-700 px-2 py-0.5 rounded text-sm font-medium">
                P.{currentPage}
              </span>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {noteTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-1">
              {noteColors.map(colorOption => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`w-6 h-6 rounded-full ${colorOption.bg} ${colorOption.border} border-2 hover:scale-110 transition-transform ${
                    color === colorOption.value ? 'ring-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          {/* 제목 입력 */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="노트 제목을 입력하세요..."
              className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-500"
            />
          </div>
          {/* 내용 입력 */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요..."
              className="w-full h-40 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-sm leading-relaxed"
            />
          </div>
          {/* 태그 입력 */}
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-white bg-opacity-70 rounded-full"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
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
                className="flex-1 text-xs bg-white bg-opacity-50 border border-white border-opacity-50 rounded-lg px-2 py-1 focus:ring-1 focus:ring-white focus:border-transparent"
              />
              <button
                onClick={addTag}
                className="px-3 py-1 text-xs bg-white bg-opacity-70 hover:bg-opacity-90 rounded-lg transition-colors"
              >
                추가
              </button>
            </div>
          </div>
          {/* 액션 버튼 */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              저장
            </button>
            <button
              onClick={onCancel}
              className="px-4 bg-white bg-opacity-60 hover:bg-opacity-80 text-sm py-2 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 노트 카드 컴포넌트
  const NoteCard = ({ note, onEdit, onDelete }) => {
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
  
    return (
      <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-xl p-4 mb-3 group hover:shadow-sm transition-shadow`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
            <span className={`text-xs font-medium ${colorScheme.text} opacity-75`}>
              {typeInfo.label}
            </span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            >
              <Edit3 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <h3 className={`font-semibold ${colorScheme.text} mb-2 text-sm`}>
          <span className="inline-block bg-gray-100 text-blue-700 px-2 py-0.5 rounded mr-2">P.{note.page}</span>
          {note.title}
        </h3>
        <p className={`${colorScheme.text} opacity-75 text-sm leading-relaxed mb-3 line-clamp-3`}>
          {note.content}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-white bg-opacity-60 rounded-full"
              >
                <Hash className="w-2.5 h-2.5 mr-0.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className={`text-xs ${colorScheme.text} opacity-50`}>
          {formatDate(note.updatedAt || note.createdAt)}
        </div>
      </div>
    );
  };
  
  // 노트 패널 컴포넌트 (개선된 버전)
  const NotePanel = ({
    isVisible,
    onToggle,
    notes: externalNotes = [],
    selectedText = '',
    currentPage = 1,
    shouldOpenEditor = false,
    onEditorOpened,
    onNoteSave
  }) => {
    const [notes, setNotes] = useState([]);
    const [editingNote, setEditingNote] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
      setNotes(externalNotes);
    }, [externalNotes]);

    useEffect(() => {
      if (shouldOpenEditor) {
        setIsCreating(true);
        onEditorOpened?.();
      }
    }, [shouldOpenEditor, onEditorOpened]);

    const handleSaveNote = (noteData) => {
      if (editingNote) {
        // 기존 노트 수정
        const updatedNotes = notes.map(note => 
          note.id === editingNote.id ? { ...note, ...noteData } : note
        );
        setNotes(updatedNotes);
        setEditingNote(null);
      } else {
        // 새 노트 생성
        const newNote = { ...noteData, id: Date.now() };
        setNotes([newNote, ...notes]);
        setIsCreating(false);
      }
      onNoteSave?.(noteData);
    };

    const handleDeleteNote = (noteId) => {
      setNotes(notes.filter(note => note.id !== noteId));
    };

    const handleEditNote = (note) => {
      setEditingNote(note);
      setIsCreating(false);
    };

    const cancelEditing = () => {
      setEditingNote(null);
      setIsCreating(false);
    };

    // 필터링된 노트
    const filteredNotes = notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || note.type === filterType;
      return matchesSearch && matchesType;
    });

    // 정렬된 노트
    const sortedNotes = [...filteredNotes].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === 'page') {
        return a.page - b.page;
      }
      return a.title.localeCompare(b.title);
    });

    return (
      <div className="h-full flex flex-col bg-white">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <NotebookPen className="w-5 h-5" />
              <span>노트</span>
              <span className="text-sm text-gray-500 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            </h2>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">최신순</option>
                <option value="page">페이지순</option>
                <option value="title">제목순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 노트 목록 */}
        <div className="flex-1 overflow-auto p-4">
          {editingNote && (
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={cancelEditing}
              currentPage={currentPage}
              selectedText={selectedText}
            />
          )}
          
          {isCreating && (
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={cancelEditing}
              isNew={true}
              currentPage={currentPage}
              selectedText={selectedText}
            />
          )}
          
          {!editingNote && !isCreating && (
            <>
              <button
                onClick={() => setIsCreating(true)}
                className="w-full mb-4 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">새 노트 작성</span>
              </button>
              
              <div className="space-y-3">
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <NotebookPen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">아직 노트가 없습니다</p>
                    <p className="text-xs text-gray-400 mt-1">텍스트를 선택하고 노트를 작성해보세요</p>
                  </div>
                ) : (
                  sortedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
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
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Tag, Calendar, Plus, Save, X } from 'lucide-react';

const NoteBookView = ({ textbookData, allNotes, setAllNotes, currentPage, highlights }) => {
  const [page, setPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  // const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    page: currentPage,
    color: 'blue',
    tags: []
  });
  
  // 실제 노트 데이터 사용
  const noteData = allNotes || [];
  
  const handlePageChange = (newPage) => {
    if (newPage === page || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setPage(newPage);
      setTimeout(() => setIsFlipping(false), 300);
    }, 150);
  };

  const handleAddNote = () => {
    setNewNote({
      title: '',
      content: '',
      page: currentPage,
      color: 'blue',
      tags: []
    });
    setShowAddNote(true);
  };

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const noteToAdd = {
      id: `note-${Date.now()}-${Math.random()}`,
      title: newNote.title,
      content: newNote.content,
      page: newNote.page,
      color: newNote.color,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'note'
    };

    setAllNotes(prev => [...prev, noteToAdd]);
    setShowAddNote(false);
    setNewNote({ title: '', content: '', page: currentPage, color: 'blue', tags: [] });
  };

  // const handleEditNote = (note) => {
  //   setEditingNote(note);
  //   setNewNote({
  //     title: note.title,
  //     content: note.content,
  //     page: note.page,
  //     color: note.color,
  //     tags: note.tags || []
  //   });
  // };

  // const handleUpdateNote = () => {
  //   if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) return;

  //   const updatedNote = {
  //     ...editingNote,
  //     title: newNote.title,
  //     content: newNote.content,
  //     page: newNote.page,
  //     color: newNote.color,
  //     tags: newNote.tags,
  //     updatedAt: new Date().toISOString()
  //   };

  //   setAllNotes(prev => prev.map(note => 
  //     note.id === editingNote.id ? updatedNote : note
  //   ));
  //   setEditingNote(null);
  //   setNewNote({ title: '', content: '', page: currentPage, color: 'blue', tags: [] });
  // };

  // const handleDeleteNote = (noteId) => {
  //   if (window.confirm('이 노트를 삭제하시겠습니까?')) {
  //     setAllNotes(prev => prev.filter(note => note.id !== noteId));
  //   }
  // };

  const colorOptions = [
    { name: '파랑', value: 'blue', class: 'bg-blue-200' },
    { name: '초록', value: 'green', class: 'bg-green-200' },
    { name: '보라', value: 'purple', class: 'bg-purple-200' },
    { name: '노랑', value: 'yellow', class: 'bg-yellow-200' },
    { name: '빨강', value: 'red', class: 'bg-red-200' }
  ];

  // const getColorClass = (color) => {
  //   const colorOption = colorOptions.find(c => c.value === color);
  //   return colorOption ? colorOption.class : 'bg-blue-200';
  // };
  
  if (!noteData || noteData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="relative">
          {/* 노트북 커버 */}
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg shadow-2xl border border-amber-200 p-12 text-center transform rotate-1">
            <div className="absolute top-4 left-8">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
            <div className="absolute top-4 left-14">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
            <div className="absolute top-4 left-20">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
            
            <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-800 mb-3" style={{fontFamily: 'cursive'}}>
              My Learning Notebook
            </h3>
            <p className="text-amber-600 mb-6" style={{fontFamily: 'cursive'}}>
              아직 작성된 노트가 없습니다<br/>
              학습하면서 중요한 내용들을 노트로 정리해보세요!
            </p>
            <button
              onClick={handleAddNote}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>첫 번째 노트 작성하기</span>
            </button>
          </div>
        </div>

        {/* 노트 추가 모달 */}
        {showAddNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">새 노트 작성</h3>
                <button onClick={() => setShowAddNote(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="노트 제목을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">페이지</label>
                  <input
                    type="number"
                    value={newNote.page}
                    onChange={(e) => setNewNote(prev => ({ ...prev, page: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
                  <div className="flex space-x-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewNote(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full ${color.class} border-2 ${
                          newNote.color === color.value ? 'border-gray-800' : 'border-transparent'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                    placeholder="노트 내용을 입력하세요..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>저장</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const note = noteData[page];
  const colorMap = {
    blue: { 
      accent: '#3b82f6', 
      light: '#dbeafe', 
      highlight: '#93c5fd',
      ink: '#1e40af'
    },
    green: { 
      accent: '#10b981', 
      light: '#d1fae5', 
      highlight: '#6ee7b7',
      ink: '#047857'
    },
    purple: { 
      accent: '#8b5cf6', 
      light: '#ede9fe', 
      highlight: '#c4b5fd',
      ink: '#6d28d9'
    },
    orange: { 
      accent: '#f59e0b', 
      light: '#fed7aa', 
      highlight: '#fdba74',
      ink: '#d97706'
    },
    red: { 
      accent: '#ef4444', 
      light: '#fecaca', 
      highlight: '#f87171',
      ink: '#dc2626'
    }
  };
  
  const currentColor = colorMap[note.color] || colorMap.blue;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Permanent+Marker&display=swap');
        
        .notebook-paper {
          background-image: 
            linear-gradient(to right, #f8f9fa 20px, transparent 20px),
            repeating-linear-gradient(
              transparent,
              transparent 30px,
              #e2e8f0 30px,
              #e2e8f0 32px
            );
          background-size: 100% 32px;
        }
        
        .handwritten {
          font-family: 'Kalam', cursive;
          line-height: 2.2;
        }
        
        .title-handwritten {
          font-family: 'Permanent Marker', cursive;
        }
        
        .page-flip {
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
        }
        
        .page-flip.flipping {
          transform: rotateY(-15deg);
        }
        
        .paper-shadow {
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.1),
            0 4px 6px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .hole-punch {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 50%;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .hole-punch:nth-child(2) { top: 30%; }
        .hole-punch:nth-child(3) { top: 70%; }
        
        .highlight-marker {
          background: linear-gradient(120deg, transparent 0%, ${currentColor.highlight}40 10%, ${currentColor.highlight}80 50%, ${currentColor.highlight}40 90%, transparent 100%);
          padding: 2px 4px;
          margin: 0 -4px;
          transform: rotate(-0.5deg);
          display: inline-block;
        }
        
        .underline-wavy {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            ${currentColor.accent} 2px,
            ${currentColor.accent} 4px
          );
          background-size: 8px 3px;
          background-repeat: repeat-x;
          background-position: 0 100%;
          padding-bottom: 4px;
        }
      `}</style>

      <div className="relative">
        
        {/* 메인 노트북 */}
        <div className={`bg-white rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300 ${isFlipping ? 'page-flip flipping' : 'page-flip'} hover:shadow-3xl`}>
          {/* 구멍 */}
          <div className="hole-punch"></div>
          <div className="hole-punch"></div>
          <div className="hole-punch"></div>
          
          {/* 헤더 - 노트북 상단 */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePageChange(Math.max(0, page - 1))}
                  disabled={page === 0 || isFlipping}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-700 handwritten">
                    Page {page + 1} of {noteData.length}
                  </div>
                  <div className="text-sm text-slate-500 handwritten">Learning Notes</div>
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(noteData.length - 1, page + 1))}
                  disabled={page === noteData.length - 1 || isFlipping}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 handwritten">{note.date}</span>
              </div>
            </div>
          </div>

          {/* 노트 페이지 */}
          <div className="notebook-paper min-h-[600px] p-8 pl-12">
            {/* 제목 영역 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 
                  className="text-3xl font-bold title-handwritten transform -rotate-1"
                  style={{ color: currentColor.ink }}
                >
                  <span className="highlight-marker">{note.title}</span>
                </h1>
                <div 
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border transform rotate-1"
                  style={{ borderColor: currentColor.accent }}
                >
                  <BookOpen className="w-4 h-4" style={{ color: currentColor.accent }} />
                  <span className="text-sm font-bold handwritten" style={{ color: currentColor.ink }}>
                    p.{note.page}
                  </span>
                </div>
              </div>
              
              {/* 구분선 - 손으로 그은 듯한 */}
              <div 
                className="h-1 rounded-full transform -rotate-1"
                style={{ 
                  background: `linear-gradient(90deg, transparent 0%, ${currentColor.accent} 10%, ${currentColor.accent} 90%, transparent 100%)`,
                  filter: 'blur(0.5px)'
                }}
              ></div>
            </div>
            
            {/* 내용 영역 */}
            <div className="mb-8">
              <div 
                className="handwritten text-lg leading-relaxed whitespace-pre-line"
                style={{ color: '#374151' }}
              >
                {note.content.split('\n').map((line, idx) => {
                  if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return (
                      <div key={idx} className="flex items-start ml-8 mb-2">
                        <span 
                          className="text-2xl mr-3 transform -rotate-12"
                          style={{ color: currentColor.accent }}
                        >
                          ✓
                        </span>
                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    );
                  } else if (line.match(/^\d+\./)) {
                    return (
                      <div key={idx} className="flex items-start ml-8 mb-2">
                        <span 
                          className="font-bold mr-3 px-2 py-1 rounded-full text-sm"
                          style={{ 
                            backgroundColor: currentColor.light,
                            color: currentColor.ink 
                          }}
                        >
                          {line.match(/^\d+/)[0]}
                        </span>
                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    );
                  } else if (line.trim() && !line.includes(':')) {
                    // 중요한 문장에 밑줄 효과
                    const isImportant = line.length > 30;
                    return (
                      <p key={idx} className={`mb-3 ${isImportant ? 'underline-wavy font-semibold' : ''}`}>
                        {line}
                      </p>
                    );
                  }
                  return <p key={idx} className="mb-3">{line}</p>;
                })}
              </div>
            </div>
            
            {/* 태그 영역 */}
            {note.tags && note.tags.length > 0 && (
              <div className="border-t-2 border-dashed border-slate-300 pt-6 mt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-5 h-5 text-slate-400 transform rotate-12" />
                  <span className="text-lg font-bold handwritten text-slate-600">Tags</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {note.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-bold handwritten shadow-sm transform hover:scale-105 transition-transform cursor-default border-2"
                      style={{ 
                        backgroundColor: currentColor.light,
                        color: currentColor.ink,
                        borderColor: currentColor.accent,
                        transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * 2}deg)`
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 페이지 하단 - 낙서 영역 */}
            <div className="mt-12 pt-6 border-t border-dashed border-slate-300">
              <div className="flex justify-between items-center opacity-60">
                <div 
                  className="text-xs handwritten transform rotate-2"
                  style={{ color: currentColor.accent }}
                >
                  ★ Keep Learning! ★
                </div>
                <div 
                  className="text-xs handwritten transform -rotate-1"
                  style={{ color: currentColor.accent }}
                >
                  {note.date}
                </div>
              </div>
            </div>
          </div>
          
          {/* 하단 페이지 인디케이터 */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-4">
            <div className="flex justify-center space-x-3">
              {noteData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  disabled={isFlipping}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    idx === page 
                      ? 'shadow-lg transform scale-110' 
                      : 'hover:opacity-80'
                  }`}
                  style={{ 
                    backgroundColor: idx === page ? currentColor.accent : '#cbd5e1'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* 노트북 그림자 */}
        <div className="absolute -bottom-4 -right-4 w-full h-full bg-slate-200/30 rounded-lg -z-10 transform rotate-1"></div>
      </div>
    </div>
  );
};

export default NoteBookView;
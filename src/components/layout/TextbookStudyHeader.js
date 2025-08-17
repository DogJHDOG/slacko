import React, { useState } from 'react';
import { 
  Search, Settings, NotebookPen, Eye, BookOpen, FileDown, 
  ZoomIn, ZoomOut, RotateCw, List, ChevronLeft, ChevronRight,
  Play, Pause, Timer, Target, Star, Menu, X
} from 'lucide-react';

const TextbookStudyHeader = () => {
  const [isStudying, setIsStudying] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isNotePanelVisible, setIsNotePanelVisible] = useState(false);
  const [viewMode, setViewMode] = useState('pdf');
  const [currentPage, setCurrentPage] = useState(4);
  const [numPages, setNumPages] = useState(1035);
  const [scale, setScale] = useState(180);
  const [studyTimer, setStudyTimer] = useState(3847); // 1시간 4분 7초
  
  // 샘플 데이터
  const textbookData = {
    title: "컴파일러 - Compilers: Principles, Techniques, and Tools",
    author: "Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman",
    publisher: "Pearson",
    progress: Math.round((currentPage / numPages) * 100)
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getShortTitle = (title) => {
    if (!title) return '';
    const shortTitle = title.split(/[-–—]/)[0].trim();
    if (shortTitle.length > 25) {
      return shortTitle.substring(0, 25) + '...';
    }
    return shortTitle;
  };

  const getChapterInfo = (page) => {
    return `chap1.p${page}`;
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 10, 300));
  const zoomOut = () => setScale(prev => Math.max(prev - 10, 50));

  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      {/* 메인 헤더 - 모든 정보를 한 줄에 통합 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 원서 정보 및 학습 상태 */}
          <div className="flex items-center space-x-6">
            {/* 원서 기본 정보 */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900" title={textbookData.title}>
                  {getShortTitle(textbookData.title)}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {getChapterInfo(currentPage)}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {textbookData.progress}% 완료
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="truncate max-w-[200px]" title={textbookData.author}>
                  {textbookData.author.split(',')[0].trim()}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 truncate max-w-[120px]" title={textbookData.publisher}>
                  {textbookData.publisher}
                </span>
              </div>
            </div>

            {/* 학습 타이머 */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2.5 rounded-xl border border-green-200">
              <div className={`w-2 h-2 rounded-full ${isStudying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <Timer className="w-4 h-4 text-green-600" />
              <span className="text-sm font-mono text-green-700">
                {formatTime(studyTimer)}
              </span>
              <button
                onClick={() => setIsStudying(!isStudying)}
                className="ml-2 p-1 hover:bg-green-100 rounded-md transition-colors"
                title={isStudying ? "학습 일시정지" : "학습 시작"}
              >
                {isStudying ? (
                  <Pause className="w-4 h-4 text-green-600" />
                ) : (
                  <Play className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
          </div>

          {/* 오른쪽: 컨트롤 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* PDF 컨트롤 그룹 */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <button 
                onClick={zoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2 py-1 bg-white rounded-md font-mono min-w-[45px] text-center">
                {scale}%
              </span>
              <button 
                onClick={zoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* 페이지 네비게이션 */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                disabled={currentPage <= 1}
                title="이전 페이지"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1 bg-white rounded-md px-3 py-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="w-12 text-xs text-center border-none outline-none font-mono"
                  min="1"
                  max={numPages}
                />
                <span className="text-xs text-gray-400">/</span>
                <span className="text-xs text-gray-600 font-mono">{numPages}</span>
              </div>
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                disabled={currentPage >= numPages}
                title="다음 페이지"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 구분선 */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* 기능 버튼 그룹 */}
            <div className="flex items-center space-x-1">
              <button 
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="검색"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setViewMode(viewMode === 'toc' ? 'pdf' : 'toc')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'toc' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="목차"
              >
                <List className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setIsNotePanelVisible(!isNotePanelVisible)}
                className={`p-2.5 rounded-lg transition-colors ${
                  isNotePanelVisible 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="노트 패널"
              >
                <NotebookPen className="w-5 h-5" />
              </button>

              {/* 설정 메뉴 */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="설정"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <FileDown className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">PDF 다운로드</div>
                          <div className="text-xs text-gray-500">메모와 노트 포함</div>
                        </div>
                      </button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Target className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">학습 목표 설정</div>
                          <div className="text-xs text-gray-500">일일 학습량 조정</div>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Star className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">북마크 관리</div>
                          <div className="text-xs text-gray-500">중요 페이지 저장</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 프로그레스 바 - 매우 얇게 */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-300"
          style={{ width: `${textbookData.progress}%` }}
        />
      </div>

      {/* 설정 메뉴 백그라운드 클릭으로 닫기 */}
      {showSettingsMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSettingsMenu(false)}
        />
      )}
    </div>
  );
};

export default TextbookStudyHeader;
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { BookOpen, Target, Bookmark, PenTool, ChevronLeft, ChevronRight, NotebookPen, MessageSquare, X, Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw, List, StickyNote } from 'lucide-react';
import NotePanel from '../notes/NotePanel';
import { 
  getPDFFromIndexedDB,
  checkPDFExists,
  extractTableOfContents,
  extractStructTree
} from '../../utils/pdfAnalyzer';

// TextLayer와 AnnotationLayer CSS 스타일 import
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// PDF.js 워커 설정
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('✅ TextbookContentView PDF.js 워커 설정 완료: 로컬 워커 사용');
  } catch (error) {
    console.error('❌ TextbookContentView PDF.js 워커 설정 실패:', error);
    try {
      const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      console.log('✅ TextbookContentView PDF.js 워커 fallback 설정 완료:', workerSrc);
    } catch (fallbackError) {
      console.error('❌ TextbookContentView PDF.js 워커 fallback도 실패:', fallbackError);
    }
  }
}

// 메모 색상 정의
const memoColors = [
  { name: 'Yellow', class: 'bg-yellow-200 hover:bg-yellow-300', preview: 'bg-yellow-200', color: '#fef08a' },
  { name: 'Green', class: 'bg-green-200 hover:bg-green-300', preview: 'bg-green-200', color: '#bbf7d0' },
  { name: 'Blue', class: 'bg-blue-200 hover:bg-blue-300', preview: 'bg-blue-200', color: '#bfdbfe' },
  { name: 'Pink', class: 'bg-pink-200 hover:bg-pink-300', preview: 'bg-pink-200', color: '#f9a8d4' }
];

const TextbookContentView = ({
  pdfId,
  textbookData,
  highlights,
  onTextSelect,
  onHighlightClick,
  currentPage,
  setCurrentPage,
  isNotePanelVisible,
  toggleNotePanel,
  allNotes,
  selectedText,
  shouldOpenEditor,
  handleNotePanelSave,
  onEditorOpened,
  showQuickActions,
  selectionPosition,
  highlightColors,
  handleAddHighlight,
  handleAddNote,
  handleOpenNotePanel,
  setShowQuickActions,
  showNoteDialog,
  setShowNoteDialog,
  noteContent,
  setNoteContent,
  highlightColor,
  setHighlightColor,
  handleSaveNote
}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState('pdf');
  const [tableOfContents, setTableOfContents] = useState([]);
  const [tocLoading, setTocLoading] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // 새로운 PDF 메모 관련 상태
  const [pdfAnnotations, setPdfAnnotations] = useState([]);
  // const [isSelecting, setIsSelecting] = useState(false);
  const [selectionData, setSelectionData] = useState(null);
  const [showPdfMemoDialog, setShowPdfMemoDialog] = useState(false);
  const [pdfMemoText, setPdfMemoText] = useState('');
  const [selectedPdfColor, setSelectedPdfColor] = useState(memoColors[0]);
  const [editingPdfAnnotation, setEditingPdfAnnotation] = useState(null);
  // const [clickPosition, setClickPosition] = useState(null);
  const [showMemoList, setShowMemoList] = useState(false);
  
  // const pageRef = useRef(null);
  const textLayerRef = useRef(null);
  const pdfPageRef = useRef(null);

  // PDF 메모 데이터 불러오기
  const loadPdfAnnotations = useCallback(() => {
    try {
      const savedAnnotations = localStorage.getItem(`pdf_annotations_${pdfId}`);
      if (savedAnnotations) {
        const annotations = JSON.parse(savedAnnotations);
        setPdfAnnotations(annotations);
        console.log('✅ PDF 메모 데이터 로드됨:', annotations.length, '개');
      }
    } catch (error) {
      console.error('❌ PDF 메모 데이터 로드 실패:', error);
    }
  }, [pdfId]);

  // PDF 로드
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfId) {
        console.log('❌ PDF ID가 제공되지 않았습니다.');
        setPdfError('PDF ID가 제공되지 않았습니다.');
        setPdfLoading(false);
        return;
      }
      
      console.log('📤 PDF 로드 시작, ID:', pdfId);
      setPdfLoading(true);
      setPdfError(null);
      
      try {
        const exists = await checkPDFExists(pdfId);
        if (!exists) {
          console.log('❌ PDF가 IndexedDB에 존재하지 않습니다:', pdfId);
          setPdfError(`PDF 파일을 찾을 수 없습니다. (ID: ${pdfId})`);
          setPdfLoading(false);
          return;
        }
        
        const url = await getPDFFromIndexedDB(pdfId);
        if (url) {
          setPdfUrl(url);
          console.log('✅ PDF URL 로드 완료:', url);
          
          // 저장된 PDF 메모 불러오기
          loadPdfAnnotations();
        } else {
          throw new Error('PDF 파일을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('❌ PDF 로드 실패:', error);
        setPdfError(error.message);
      } finally {
        setPdfLoading(false);
      }
    };
    
    loadPDF();
  }, [pdfId, loadPdfAnnotations]);

  // PDF URL cleanup을 위한 별도 useEffect
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // PDF 메모 데이터 저장
  const savePdfAnnotations = useCallback((annotations) => {
    try {
      const key = `pdf_annotations_${pdfId}`;
      const data = JSON.stringify(annotations);
      localStorage.setItem(key, data);
      
      console.log('✅ PDF 메모 데이터 저장됨:', annotations.length, '개');
    } catch (error) {
      console.error('❌ PDF 메모 데이터 저장 실패:', error);
    }
  }, [pdfId]);

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateContainerWidth = () => {
      const container = document.querySelector('.pdf-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, [isNotePanelVisible]);

  // PDF 문서 로드 성공 시 목차 추출
  const handleDocumentLoadSuccess = ({ numPages }, pdf) => {
    console.log('✅ PDF 문서 로드 성공, 페이지 수:', numPages);
    setNumPages(numPages);
    setPdfDocument(pdf);
    
    // 목차 추출 시도
    extractTableOfContentsFromPDF(pdf);
  };

  // PDF에서 목차 추출
  const extractTableOfContentsFromPDF = async (pdf) => {
    if (!pdf) return;
    
    setTocLoading(true);
    try {
      let toc = await extractTableOfContents(pdf);
      
      if (!toc || toc.length === 0) {
        console.log('📚 북마크가 없어서 구조 트리에서 목차 추출 시도');
        toc = await extractStructTree(pdf);
      }
      
      setTableOfContents(toc);
      console.log('📚 최종 추출된 목차:', toc);
    } catch (error) {
      console.error('❌ 목차 추출 실패:', error);
      setTableOfContents([]);
    } finally {
      setTocLoading(false);
    }
  };

  // PDF 페이지 클릭 처리 - 단어 기준 텍스트 선택
  const handlePdfPageClick = useCallback((e) => {
    if (!textLayerRef.current || !pdfPageRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    const pageRect = pdfPageRef.current.getBoundingClientRect();
    const clickX = e.clientX - pageRect.left;
    const clickY = e.clientY - pageRect.top;
    
    console.log('📍 PDF 페이지 클릭:', { clickX, clickY, pageRect });

    // 단어 기준으로 텍스트 선택하는 함수
    const selectWordAtPosition = (clickX, clickY, pageRect) => {
      if (!textLayerRef.current) return null;
    
      const textLayer = textLayerRef.current;
      const textSpans = textLayer.querySelectorAll('span');
      
      if (textSpans.length === 0) return null;
    
      let bestSpan = null;
      let bestDistance = Infinity;
    
      // 1단계: 클릭 위치와 겹치는 span들 찾기 (더 엄격한 조건)
      const overlappingSpans = [];
      textSpans.forEach(span => {
        const spanRect = span.getBoundingClientRect();
        const relativeSpanRect = {
          left: spanRect.left - pageRect.left,
          top: spanRect.top - pageRect.top,
          right: spanRect.right - pageRect.left,
          bottom: spanRect.bottom - pageRect.top
        };
    
        // 클릭 위치가 span 영역 내에 있는지 확인 (더 엄격한 여유 공간)
        const margin = 3; // 3px로 줄임 (기존 10px)
        if (clickX >= relativeSpanRect.left - margin && 
            clickX <= relativeSpanRect.right + margin &&
            clickY >= relativeSpanRect.top - margin && 
            clickY <= relativeSpanRect.bottom + margin &&
            span.textContent.trim()) {
          
          // 중심점까지의 거리 계산
          const centerX = (relativeSpanRect.left + relativeSpanRect.right) / 2;
          const centerY = (relativeSpanRect.top + relativeSpanRect.bottom) / 2;
          const distance = Math.sqrt(
            Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
          );
          
          overlappingSpans.push({ span, distance, rect: relativeSpanRect });
        }
      });
    
      // 2단계: 겹치는 span이 없으면 가장 가까운 span 찾기 (더 엄격한 임계값)
      if (overlappingSpans.length === 0) {
        textSpans.forEach(span => {
          if (!span.textContent.trim()) return;
          
          const spanRect = span.getBoundingClientRect();
          const relativeSpanRect = {
            left: spanRect.left - pageRect.left,
            top: spanRect.top - pageRect.top,
            right: spanRect.right - pageRect.left,
            bottom: spanRect.bottom - pageRect.top
          };
    
          const centerX = (relativeSpanRect.left + relativeSpanRect.right) / 2;
          const centerY = (relativeSpanRect.top + relativeSpanRect.bottom) / 2;
          const distance = Math.sqrt(
            Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
          );
          
          if (distance < bestDistance && distance < 20) { // 20px로 줄임 (기존 50px)
            bestDistance = distance;
            bestSpan = span;
          }
        });
      } else {
        // 겹치는 span 중에서 가장 가까운 것 선택
        overlappingSpans.sort((a, b) => a.distance - b.distance);
        bestSpan = overlappingSpans[0].span;
      }
    
      if (!bestSpan) {
        console.log('❌ 선택 가능한 텍스트를 찾을 수 없음');
        return null;
      }
    
      // 3단계: 선택된 span에서 정확한 단어 추출
      const spanText = bestSpan.textContent;
      const spanRect = bestSpan.getBoundingClientRect();
      const relativeSpanRect = {
        left: spanRect.left - pageRect.left,
        top: spanRect.top - pageRect.top,
        right: spanRect.right - pageRect.left,
        bottom: spanRect.bottom - pageRect.top
      };
    
      // span 내에서의 클릭 위치 계산 (더 정확한 방법)
      let clickedCharIndex = 0;
      if (spanText.length > 1) {
        const relativeClickX = clickX - relativeSpanRect.left;
        const spanWidth = relativeSpanRect.right - relativeSpanRect.left;
        const charRatio = relativeClickX / spanWidth;
        clickedCharIndex = Math.max(0, Math.min(spanText.length - 1, Math.floor(charRatio * spanText.length)));
      }
    
      // 4단계: 단어 경계 찾기 (더 엄격한 정규식)
      const wordRegex = /[\w가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+|[+\-×÷=<>≤≥≠∞∑∫∂√π∆∇α-ωΑ-Ω]+/g;
      let match;
      let selectedWord = '';
      let wordStart = 0;
      let wordEnd = 0;
      let found = false;
    
      // 클릭된 위치의 문자가 포함된 단어 찾기
      while ((match = wordRegex.exec(spanText)) !== null) {
        if (clickedCharIndex >= match.index && clickedCharIndex < match.index + match[0].length) {
          selectedWord = match[0];
          wordStart = match.index;
          wordEnd = match.index + match[0].length;
          found = true;
          break;
        }
      }
    
      // 단어를 찾지 못한 경우 주변 단어 찾기 (더 엄격한 조건)
      if (!found && spanText.trim()) {
        wordRegex.lastIndex = 0; // 정규식 리셋
        let closestMatch = null;
        let closestDistance = Infinity;
    
        while ((match = wordRegex.exec(spanText)) !== null) {
          const wordCenter = match.index + match[0].length / 2;
          const distance = Math.abs(clickedCharIndex - wordCenter);
          
          if (distance < closestDistance && distance < 5) { // 5글자 이내의 단어만 선택
            closestDistance = distance;
            closestMatch = match;
          }
        }
    
        if (closestMatch) {
          selectedWord = closestMatch[0];
          wordStart = closestMatch.index;
          wordEnd = closestMatch.index + closestMatch[0].length;
        } else {
          // 단어를 찾지 못한 경우 null 반환 (전체 텍스트 사용하지 않음)
          console.log('❌ 클릭 위치에서 적절한 단어를 찾을 수 없음');
          return null;
        }
      }
    
      // 5단계: 선택된 단어의 정확한 위치 계산
      const spanWidth = relativeSpanRect.right - relativeSpanRect.left;
      const charWidth = spanWidth / spanText.length;
      
      const wordStartX = relativeSpanRect.left + (wordStart * charWidth);
      const wordEndX = relativeSpanRect.left + (wordEnd * charWidth);
      const wordY = relativeSpanRect.top;
      const wordHeight = relativeSpanRect.bottom - relativeSpanRect.top;
    
      const relativeRect = {
        left: wordStartX / pageRect.width,
        top: wordY / pageRect.height,
        width: (wordEndX - wordStartX) / pageRect.width,
        height: wordHeight / pageRect.height
      };
    
      console.log('✅ 텍스트 선택 성공:', {
        text: selectedWord,
        spanText: spanText,
        clickedCharIndex: clickedCharIndex,
        wordBounds: [wordStart, wordEnd],
        rect: relativeRect
      });
    
      return {
        text: selectedWord.trim(),
        rect: relativeRect,
        pageNumber: currentPage
      };
    };
    
    // 단어 기준으로 텍스트 선택
    const selectedWordData = selectWordAtPosition(clickX, clickY, pageRect);
    
    if (selectedWordData) {
      console.log('📝 단어 선택됨:', selectedWordData.text);
      
      // 선택된 텍스트 데이터 저장
      setSelectionData(selectedWordData);
      
      // 큰 다이얼로그는 표시하지 않고, 상위 컴포넌트의 빠른 액션 툴팁만 표시
      onTextSelect(selectedWordData.text, {
        x: e.clientX,
        y: e.clientY
      });
      
      // 선택 영역 해제
      window.getSelection().removeAllRanges();
    } else {
      console.log('❌ 선택 가능한 텍스트 없음');
      // 빠른 액션 툴팁 숨기기
      setShowQuickActions(false);
    }
  }, [currentPage, textLayerRef, pdfPageRef, onTextSelect, setShowQuickActions]);

  // 3. PDF 메모 다이얼로그를 여는 함수
  const handleOpenPdfMemoDialog = useCallback(() => {
    if (selectionData) {
      setShowPdfMemoDialog(true);
      setShowQuickActions(false); // 빠른 액션 툴팁 숨기기
    }
  }, [selectionData, setShowQuickActions]);

  // 4. 빠른 액션 툴팁에서 PDF 메모 추가 버튼 클릭 핸들러 
  const handlePdfMemoFromQuickAction = useCallback(() => {
    handleOpenPdfMemoDialog();
  }, [handleOpenPdfMemoDialog]);

  // 5. 텍스트 선택 해제 함수 
  const clearTextSelection = useCallback(() => {
    setSelectionData(null);
    setShowQuickActions(false);
    window.getSelection().removeAllRanges();
  }, [setShowQuickActions]);

  // 6. PDF 페이지 컨테이너에 클릭 외부 영역 처리
  const handlePdfContainerClick = useCallback((e) => {
    // PDF 페이지 외부 클릭 시 선택 해제
    if (e.target === e.currentTarget) {
      clearTextSelection();
    }
  }, [clearTextSelection]);

  // PDF 텍스트 선택 처리 
  const handlePdfTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0 && textLayerRef.current && pdfPageRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const pageRect = pdfPageRef.current.getBoundingClientRect();
      
      // PDF 페이지 내의 상대적 위치 계산
      const relativeRect = {
        left: (rect.left - pageRect.left) / pageRect.width,
        top: (rect.top - pageRect.top) / pageRect.height,
        width: rect.width / pageRect.width,
        height: rect.height / pageRect.height
      };
      
      setSelectionData({
        text: selectedText,
        rect: relativeRect,
        pageNumber: currentPage
      });
      
      // 큰 다이얼로그는 표시하지 않고, 빠른 액션 툴팁만 표시
      console.log('📝 텍스트 선택됨:', selectedText);
      
      // 상위 컴포넌트로 선택된 텍스트 전달
      onTextSelect(selectedText, {
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  }, [currentPage, onTextSelect]);

  // PDF 어노테이션 추가
  const addPdfAnnotation = useCallback(() => {
    if (!selectionData || !pdfMemoText.trim()) return;
    
    const newAnnotation = {
      id: Date.now().toString(),
      pageNumber: currentPage,
      text: selectionData.text,
      memo: pdfMemoText.trim(),
      rect: selectionData.rect,
      color: selectedPdfColor.color,
      colorName: selectedPdfColor.name,
      colorClass: selectedPdfColor.class,
      createdAt: new Date().toISOString()
    };
    
    const updatedAnnotations = [...pdfAnnotations, newAnnotation];
    setPdfAnnotations(updatedAnnotations);
    savePdfAnnotations(updatedAnnotations);
    
    setShowPdfMemoDialog(false);
    setPdfMemoText('');
    setSelectionData(null);
    
    // 선택 해제
    window.getSelection().removeAllRanges();
    console.log('✅ PDF 메모 추가됨:', newAnnotation);
  }, [selectionData, pdfMemoText, selectedPdfColor, currentPage, pdfAnnotations, savePdfAnnotations]);

  // PDF 어노테이션 수정
  const updatePdfAnnotation = useCallback((id, newMemo) => {
    const updatedAnnotations = pdfAnnotations.map(ann => 
      ann.id === id ? { ...ann, memo: newMemo, updatedAt: new Date().toISOString() } : ann
    );
    setPdfAnnotations(updatedAnnotations);
    savePdfAnnotations(updatedAnnotations);
  }, [pdfAnnotations, savePdfAnnotations]);

  // PDF 어노테이션 삭제
  const deletePdfAnnotation = useCallback((id) => {
    const updatedAnnotations = pdfAnnotations.filter(ann => ann.id !== id);
    setPdfAnnotations(updatedAnnotations);
    savePdfAnnotations(updatedAnnotations);
  }, [pdfAnnotations, savePdfAnnotations]);

  // PDF 어노테이션 오버레이 렌더링
  const renderPdfAnnotationOverlay = () => {
    const pageAnnotations = pdfAnnotations.filter(ann => ann.pageNumber === currentPage);
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {pageAnnotations.map(annotation => (
          <div
            key={annotation.id}
            className="absolute pointer-events-auto group cursor-pointer transition-all duration-200 hover:shadow-lg z-10"
            style={{
              left: `${annotation.rect.left * 100}%`,
              top: `${annotation.rect.top * 100}%`,
              width: `${annotation.rect.width * 100}%`,
              height: `${annotation.rect.height * 100}%`,
              backgroundColor: annotation.color,
              borderRadius: '2px',
              opacity: 0.6,
              minWidth: '20px',
              minHeight: '15px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingPdfAnnotation(annotation);
            }}
          >
            {/* 메모 툴팁 */}
            <div className="absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 min-w-[200px] max-w-[300px] pointer-events-none">
              <div className="font-medium mb-1">선택된 텍스트:</div>
              <div className="text-gray-300 mb-2 italic">"{annotation.text}"</div>
              <div className="font-medium mb-1">메모:</div>
              <div className="whitespace-pre-wrap">{annotation.memo}</div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(annotation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 메모 목록 렌더링
  const renderMemoList = () => {
    if (!showMemoList) return null;

    const sortedAnnotations = [...pdfAnnotations].sort((a, b) => a.pageNumber - b.pageNumber);

    return (
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 max-h-96 overflow-hidden z-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">PDF 메모 목록</h3>
            <button
              onClick={() => setShowMemoList(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">총 {pdfAnnotations.length}개</p>
        </div>
        <div className="overflow-y-auto max-h-80">
          {sortedAnnotations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <StickyNote className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>아직 작성된 메모가 없습니다</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sortedAnnotations.map(annotation => (
                <div
                  key={annotation.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (annotation.pageNumber !== currentPage) {
                      setCurrentPage(annotation.pageNumber);
                    }
                    setShowMemoList(false);
                    setTimeout(() => {
                      setEditingPdfAnnotation(annotation);
                    }, 100);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">페이지 {annotation.pageNumber}</span>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: annotation.color }}
                    />
                  </div>
                  <div className="text-sm text-gray-700 mb-1 font-medium line-clamp-2">
                    "{annotation.text.length > 30 ? annotation.text.substring(0, 30) + '...' : annotation.text}"
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {annotation.memo.length > 50 ? annotation.memo.substring(0, 50) + '...' : annotation.memo}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(annotation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 편집된 PDF 다운로드 기능
  const downloadAnnotatedPDF = async () => {
    if (!pdfUrl || pdfAnnotations.length === 0) {
      alert('다운로드할 메모가 없습니다.');
      return;
    }

    try {
      console.log('📥 PDF 다운로드 시작...');
      
      // PDF-lib를 사용하여 PDF에 메모 추가
      const { PDFDocument, rgb } = await import('pdf-lib');
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      console.log('📄 PDF 문서 로드 완료, 페이지 수:', pdfDoc.getPageCount());
      console.log('📝 추가할 메모 수:', pdfAnnotations.length);
      
      // 각 페이지별로 메모 추가
      for (const annotation of pdfAnnotations) {
        const pageIndex = annotation.pageNumber - 1;
        const page = pdfDoc.getPages()[pageIndex];
        
        if (page) {
          const { width, height } = page.getSize();
          
          // 메모 텍스트 추가
          const memoText = `📝 ${annotation.text}\n💭 ${annotation.memo}`;
          
          // 색상 설정
          let color = rgb(1, 1, 0); // 기본 노란색
          switch (annotation.colorName) {
            case 'Green': color = rgb(0.7, 1, 0.8); break;
            case 'Blue': color = rgb(0.7, 0.8, 1); break;
            case 'Pink': color = rgb(1, 0.7, 0.8); break;
            default: color = rgb(1, 1, 0); break; // 기본 노란색
          }
          
          // 메모 박스 그리기
          const x = annotation.rect.left * width;
          const y = height - (annotation.rect.top * height) - (annotation.rect.height * height);
          const boxWidth = Math.max(annotation.rect.width * width, 200);
          const boxHeight = Math.max(annotation.rect.height * height, 60);
          
          // 배경 박스
          page.drawRectangle({
            x: x,
            y: y - 40,
            width: boxWidth,
            height: boxHeight + 40,
            color: color,
            opacity: 0.3,
          });
          
          // 메모 텍스트
          page.drawText(memoText, {
            x: x + 5,
            y: y + boxHeight - 15,
            size: 10,
            color: rgb(0, 0, 0),
            maxWidth: boxWidth - 10,
          });
          
          console.log(`📝 페이지 ${annotation.pageNumber}에 메모 추가 완료`);
        }
      }
      
      // PDF 저장
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // 다운로드
      const link = document.createElement('a');
      link.href = url;
      link.download = `${textbookData?.title || 'textbook'}_with_notes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ 메모가 포함된 PDF 다운로드 완료');
    } catch (error) {
      console.error('❌ PDF 다운로드 실패:', error);
      alert('PDF 다운로드에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  // 목차 항목 클릭 핸들러
  const handleTocItemClick = async (item) => {
    console.log('📚 목차 클릭:', item);
    
    let targetPage = item.page;
    
    if (!targetPage || targetPage <= 0) {
      console.log('❌ 유효하지 않은 페이지 번호:', targetPage);
      return;
    }
    
    if (targetPage > numPages) {
      console.log('⚠️ 페이지 번호가 총 페이지 수 초과, 조정:', targetPage, '->', numPages);
      targetPage = numPages;
    }
    
    if (typeof item.dest === 'string' && pdfDocument) {
      try {
        const dest = await pdfDocument.getDestination(item.dest);
        if (dest && dest[0]) {
          if (typeof dest[0] === 'object' && dest[0].num !== undefined) {
            targetPage = dest[0].num + 1;
          } else if (typeof dest[0] === 'number') {
            targetPage = dest[0] + 1;
          }
        }
      } catch (error) {
        console.log('Named destination 해결 실패:', error);
      }
    }
    
    if (targetPage >= 1 && targetPage <= numPages) {
      setCurrentPage(targetPage);
      setViewMode('pdf');
      console.log(`📚 목차 이동 완료: "${item.title}" -> 페이지 ${targetPage}`);
    } else {
      console.log('❌ 최종 페이지 번호가 유효하지 않음:', targetPage);
    }
  };

  // 목차 렌더링 컴포넌트
  const renderTableOfContents = () => {
    if (tocLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">목차 추출 중...</p>
          </div>
        </div>
      );
    }

    if (!tableOfContents || tableOfContents.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <List className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">목차 정보가 없습니다</p>
            <p className="text-xs text-gray-400">PDF에 북마크가 설정되어 있지 않습니다</p>
          </div>
        </div>
      );
    }

    const renderTocItem = (item) => {
      const isCurrentPage = item.page === currentPage || 
        (item.page && Math.abs(item.page - currentPage) <= 1);
      
      return (
        <div key={item.id} className="mb-2">
          <button
            onClick={() => handleTocItemClick(item)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-blue-50 hover:text-blue-700 ${
              isCurrentPage 
                ? 'bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-500' 
                : 'text-gray-700 hover:border-l-4 hover:border-blue-300'
            }`}
            style={{ paddingLeft: `${(item.level * 16) + 12}px` }}
          >
            <div className="flex items-center justify-between">
              <span className="truncate" title={item.title}>
                {item.title}
              </span>
              {item.page && (
                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                  isCurrentPage 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  p.{item.page}
                </span>
              )}
            </div>
          </button>
          {item.children && item.children.length > 0 && (
            <div className="ml-4">
              {item.children.map(child => renderTocItem(child))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">목차</h3>
            <button
              onClick={() => setViewMode('pdf')}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PDF로 돌아가기</span>
            </button>
          </div>
          <div className="space-y-1">
            {tableOfContents.map(item => renderTocItem(item))}
          </div>
        </div>
      </div>
    );
  };

  // PDF 렌더링 에러 핸들러
  const handleDocumentLoadError = (error) => {
    console.error('❌ PDF 문서 로드 실패:', error);
    setPdfError('PDF 문서를 로드할 수 없습니다. 워커 초기화 문제일 수 있습니다.');
  };

  const handlePageLoadError = (error) => {
    console.error('❌ PDF 페이지 로드 실패:', error);
    setPdfError('PDF 페이지를 로드할 수 없습니다.');
  };

  const handlePageLoadSuccess = ({ pageNumber }) => {
    console.log('✅ PDF 페이지 로드 성공:', pageNumber);
  };

  // 페이지 네비게이션
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  // 확대/축소
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // 회전
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 페이지 입력 핸들러
  const handlePageInput = (e) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  };

  // 현재 챕터 정보 추출
  const getCurrentChapterInfo = () => {
    if (!textbookData?.tableOfContents || textbookData.tableOfContents.length === 0) {
      return {
        title: textbookData?.title || '원서 학습',
        description: `Page ${currentPage}`,
        estimatedTime: '10-15분'
      };
    }

    const currentChapter = textbookData.tableOfContents
      .slice()
      .reverse()
      .find(chapter => chapter.page <= currentPage);

    if (currentChapter) {
      return {
        title: `${currentChapter.number}. ${currentChapter.title}`,
        description: `Page ${currentPage}`,
        estimatedTime: '20-30분'
      };
    }

    return {
      title: textbookData?.title || '원서 학습',
      description: `Page ${currentPage}`,
      estimatedTime: '10-15분'
    };
  };

  const chapterInfo = getCurrentChapterInfo();

  // Document options 메모이제이션
  const documentOptions = useMemo(() => ({
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
  }), []);

  // 로딩 상태 렌더링
  if (pdfLoading) {
    return (
      <div className={`transition-all duration-300 ${isNotePanelVisible ? 'w-3/5' : 'w-full'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">PDF 로딩 중...</p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (pdfError) {
    return (
      <div className={`transition-all duration-300 ${isNotePanelVisible ? 'w-3/5' : 'w-full'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">PDF 로딩 실패</p>
                <p className="text-sm text-gray-500 mb-4">{pdfError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 원서 본문/노트패널 영역 */}
      <div className="flex h-screen bg-gray-50">
        {/* 원서 본문 영역 */}
        <div className={`transition-all duration-300 ${isNotePanelVisible ? 'w-2/3 lg:w-3/4 xl:w-4/5' : 'w-full'} p-2 sm:p-4`}>
          <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 챕터 헤더 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-3 sm:p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 line-clamp-1" title={textbookData?.title || chapterInfo.title}>
                    {textbookData?.title || chapterInfo.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>페이지 {currentPage}</span>
                      {numPages > 0 && (
                        <span className="text-gray-400">/ {numPages}</span>
                      )}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>예상 학습시간 {chapterInfo.estimatedTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>PDF 메모 {pdfAnnotations.length}개</span>
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 ml-2 sm:ml-4">
                  {/* 목차 보기 버튼 */}
                  <button 
                    onClick={() => setViewMode(viewMode === 'toc' ? 'pdf' : 'toc')}
                    className={`px-2 sm:px-3 py-2 rounded-xl border transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                      viewMode === 'toc' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={tocLoading}
                  >
                    <List className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{viewMode === 'toc' ? '목차 닫기' : '목차'}</span>
                    {tocLoading ? (
                      <Loader2 className="w-2 h-2 sm:w-3 sm:h-3 animate-spin" />
                    ) : tableOfContents.length > 0 ? (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded-full">
                        {tableOfContents.length}
                      </span>
                    ) : (
                      <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1 py-0.5 rounded-full">
                        0
                      </span>
                    )}
                  </button>
                  
                  {/* 메모 목록 버튼 */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowMemoList(!showMemoList)}
                      className={`px-2 sm:px-3 py-2 rounded-xl border transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 ${
                        showMemoList 
                          ? 'bg-yellow-500 text-white border-yellow-500' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <StickyNote className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">메모</span>
                      {pdfAnnotations.length > 0 && (
                        <span className="ml-1 text-xs bg-yellow-100 text-yellow-600 px-1 py-0.5 rounded-full">
                          {pdfAnnotations.length}
                        </span>
                      )}
                    </button>
                    {renderMemoList()}
                  </div>
                  
                  <button className="p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <PenTool className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* PDF 뷰어 컨트롤 */}
            {viewMode === 'pdf' && (
              <div className="bg-gray-50 border-b border-gray-100 px-3 sm:px-4 py-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={zoomOut} className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900">
                      <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900">
                      <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button onClick={rotate} className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900">
                      <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={currentPage}
                      onChange={handlePageInput}
                      className="w-12 sm:w-16 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded text-center"
                      min="1"
                      max={numPages || 1}
                    />
                    <span className="text-xs sm:text-sm text-gray-500">/ {numPages || '?'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* PDF 렌더링 영역 */}
            <div className="flex-1 bg-gray-100 overflow-hidden">
              {viewMode === 'pdf' ? (
                <div 
                  className="pdf-container h-full flex justify-center items-start overflow-auto p-2 sm:p-4"
                  onClick={handlePdfContainerClick}
                >
                  <div className="pdf-wrapper" style={{ 
                    minHeight: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '100%'
                  }}>
                    {pdfUrl && (
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        onLoadError={handleDocumentLoadError}
                        loading={
                          <div className="flex items-center justify-center h-96 w-full">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          </div>
                        }
                        error={
                          <div className="flex items-center justify-center h-96 w-full">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <p className="text-sm text-red-600">PDF 문서 로드 실패</p>
                            </div>
                          </div>
                        }
                        options={documentOptions}
                      >
                        <div 
                          ref={pdfPageRef} 
                          className="pdf-page-wrapper shadow-lg rounded-lg overflow-hidden bg-white relative cursor-pointer"
                          onClick={handlePdfPageClick}
                          style={{
                            maxWidth: '100%',
                            width: 'fit-content'
                          }}
                        >
                          <Page
                            pageNumber={currentPage}
                            scale={scale}
                            rotate={rotation}
                            width={Math.min(
                              Math.max(
                                containerWidth > 0 ? containerWidth - 40 : 800,
                                300 // 최소 너비
                              ),
                              1200 // 최대 너비
                            )}
                            onLoadSuccess={handlePageLoadSuccess}
                            onLoadError={handlePageLoadError}
                            onRenderTextLayerSuccess={() => {
                              if (pdfPageRef.current) {
                                textLayerRef.current = pdfPageRef.current.querySelector('.react-pdf__Page__textContent');
                                
                                // 텍스트 선택 이벤트 리스너 추가
                                if (textLayerRef.current) {
                                  textLayerRef.current.addEventListener('mouseup', handlePdfTextSelection);
                                  
                                  // 텍스트 레이어 디버깅 정보
                                  const textSpans = textLayerRef.current.querySelectorAll('span');
                                  console.log('📄 텍스트 레이어 로드 완료:', {
                                    pageNumber: currentPage,
                                    spanCount: textSpans.length,
                                    hasTextContent: textSpans.length > 0
                                  });
                                  
                                  // 첫 번째 span의 텍스트 샘플 출력 (디버깅용)
                                  if (textSpans.length > 0) {
                                    const firstSpan = textSpans[0];
                                    console.log('📝 첫 번째 텍스트 span:', {
                                      text: firstSpan.textContent.substring(0, 50),
                                      rect: firstSpan.getBoundingClientRect()
                                    });
                                  }
                                } else {
                                  console.warn('⚠️ 텍스트 레이어를 찾을 수 없음');
                                }
                              }
                            }}
                            loading={
                              <div className="flex items-center justify-center h-96 w-full">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                              </div>
                            }
                            error={
                              <div className="flex items-center justify-center h-96 w-full">
                                <div className="text-center">
                                  <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                  <p className="text-sm text-red-600">페이지 렌더링 실패</p>
                                </div>
                              </div>
                            }
                          />
                          {/* PDF 어노테이션 오버레이 */}
                          {renderPdfAnnotationOverlay()}
                        </div>
                      </Document>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  {renderTableOfContents()}
                </div>
              )}
            </div>
            
            {/* 페이지 네비게이션 */}
            <div className="bg-gray-50 border-t border-gray-100 px-3 sm:px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">이전</span>
                </button>
                
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-xs sm:text-sm text-gray-500">
                    페이지 {currentPage} of {numPages || '?'}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300" 
                      style={{width: numPages > 0 ? `${(currentPage/numPages)*100}%` : '0%'}}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= numPages}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xs sm:text-sm font-medium">다음</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 노트 패널 - 오른쪽에 표시 */}
        {isNotePanelVisible && (
          <div className="w-1/3 p-4">
            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <NotePanel
                isVisible={true}
                onToggle={toggleNotePanel}
                notes={allNotes}
                selectedText={selectedText}
                currentPage={currentPage}
                shouldOpenEditor={shouldOpenEditor}
                onEditorOpened={onEditorOpened}
                onNoteSave={handleNotePanelSave}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* PDF 메모 추가 다이얼로그 - 반응형 */}
      {showPdfMemoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">PDF 메모 추가</h3>
              <button
                onClick={() => {
                  setShowPdfMemoDialog(false);
                  setPdfMemoText('');
                  setSelectionData(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 콘텐츠 */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택된 텍스트</label>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-sm text-gray-700 border max-h-32 overflow-y-auto">
                  "{selectionData?.text}"
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">하이라이트 색상</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {memoColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedPdfColor(color)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 transition-colors ${
                        selectedPdfColor.name === color.name ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={pdfMemoText}
                  onChange={(e) => setPdfMemoText(e.target.value)}
                  className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="이 부분에 대한 메모를 작성하세요..."
                  autoFocus
                />
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addPdfAnnotation}
                  disabled={!pdfMemoText.trim()}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowPdfMemoDialog(false);
                    setPdfMemoText('');
                    setSelectionData(null);
                  }}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF 메모 편집 다이얼로그 - 반응형 */}
      {editingPdfAnnotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">PDF 메모 편집</h3>
              <button
                onClick={() => setEditingPdfAnnotation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 콘텐츠 */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택된 텍스트</label>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-sm text-gray-700 border max-h-32 overflow-y-auto">
                  "{editingPdfAnnotation.text}"
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={editingPdfAnnotation.memo}
                  onChange={(e) => setEditingPdfAnnotation(prev => ({ ...prev, memo: e.target.value }))}
                  className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="메모를 수정하세요..."
                  autoFocus
                />
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    updatePdfAnnotation(editingPdfAnnotation.id, editingPdfAnnotation.memo);
                    setEditingPdfAnnotation(null);
                  }}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    deletePdfAnnotation(editingPdfAnnotation.id);
                    setEditingPdfAnnotation(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                >
                  삭제
                </button>
                <button
                  onClick={() => setEditingPdfAnnotation(null)}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 기존 빠른 액션 툴팁 (텍스트 뷰어용) */}
      {showQuickActions && selectionPosition && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2"
          style={{
            left: selectionPosition.x,
            top: selectionPosition.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center space-x-2">
            {/* PDF 메모 추가 버튼 - MessageSquare 클릭 시 큰 다이얼로그 열기 */}
            <button
              onClick={handlePdfMemoFromQuickAction}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="PDF 메모 추가"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenNotePanel}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="노트 추가"
            >
              <NotebookPen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQuickActions(false)}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* 기존 메모 추가 모달 (텍스트 뷰어용) - 반응형 */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">텍스트 메모 추가</h3>
              <button
                onClick={() => setShowNoteDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 콘텐츠 */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택한 텍스트</label>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-sm text-gray-700 border border-gray-200 max-h-32 overflow-y-auto">
                  "{selectedText}"
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">하이라이트 색상</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {memoColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setHighlightColor(color.class)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${color.preview} border-2 transition-colors ${
                        highlightColor === color.class ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                  placeholder="이 부분에 대한 메모를 작성하세요..."
                />
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveNote}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowNoteDialog(false)}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF 다운로드 버튼 (숨겨진 상태, Settings 버튼에서 호출) */}
      <div style={{ display: 'none' }}>
        <button onClick={downloadAnnotatedPDF} id="download-pdf-btn">
          PDF 다운로드
        </button>
      </div>
    </>
  );
};

// downloadAnnotatedPDF 함수를 외부에서 접근할 수 있도록 export
// export { downloadAnnotatedPDF };
export default TextbookContentView;
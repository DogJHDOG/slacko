import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, MessageSquare, X, Loader2, AlertCircle, List } from 'lucide-react';
import NotePanel from '../notes/NotePanel';
import { 
  getPDFFromIndexedDB,
  checkPDFExists
} from '../../utils/pdfAnalyzer';

// 개선된 PDF 목차 추출기 import
import { 
  debugPDFStructure 
} from '../../utils/PDFTocExtractor';

import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// PDF.js 워커 설정 - 안정적인 버전으로 통일
if (typeof window !== 'undefined') {
  try {
    const pdfjsVersion = pdfjs.version || '3.11.174';
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
    console.log('✅ TextbookContentView PDF.js 워커 설정 완료:', pdfjsVersion);
  } catch (error) {
    console.error('❌ TextbookContentView PDF.js 워커 설정 실패:', error);
  }
}

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
  handleSaveNote,
  viewMode = 'pdf',
  setViewMode,
  scale = 1.8,
  setScale,
  rotation = 0,
  setRotation,
  numPages,
  onDocumentLoadSuccess,
  setNumPages,
  tableOfContents = [],
  setTableOfContents,
  tocLoading = false,
  setTocLoading
}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  
  // PDF 메모 관련 상태
  const [pdfAnnotations, setPdfAnnotations] = useState([]);
  const [selectionData, setSelectionData] = useState(null);
  const [showPdfMemoDialog, setShowPdfMemoDialog] = useState(false);
  const [pdfMemoText, setPdfMemoText] = useState('');
  const [selectedPdfColor, setSelectedPdfColor] = useState({ 
    name: 'Yellow', 
    color: '#fef08a', 
    class: 'bg-yellow-200 hover:bg-yellow-300' 
  });
  const [editingPdfAnnotation, setEditingPdfAnnotation] = useState(null);
  
  // 개선된 선택 상태 관리
  const [activeSelection, setActiveSelection] = useState(null);
  
  // 목차 추출 상태 관리 개선
  const [toc, setToc] = useState([]);
  
  // TextLayer 관리를 위한 ref와 상태
  const textLayerRef = useRef(null);
  const pdfPageRef = useRef(null);
  const textLayerCleanupRef = useRef(null);
  const [textLayerReady, setTextLayerReady] = useState(false);
  const currentPageRef = useRef(currentPage); // 현재 페이지 추적

  // 메모 색상 정의
  const memoColors = [
    { name: 'Yellow', class: 'bg-yellow-200 hover:bg-yellow-300', preview: 'bg-yellow-200', color: '#fef08a' },
    { name: 'Green', class: 'bg-green-200 hover:bg-green-300', preview: 'bg-green-200', color: '#bbf7d0' },
    { name: 'Blue', class: 'bg-blue-200 hover:bg-blue-300', preview: 'bg-blue-200', color: '#bfdbfe' },
    { name: 'Pink', class: 'bg-pink-200 hover:bg-pink-300', preview: 'bg-pink-200', color: '#f9a8d4' }
  ];

  // 현재 페이지 업데이트 추적
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

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

  // TextLayer cleanup 함수
  const cleanupTextLayer = useCallback(() => {
    if (textLayerCleanupRef.current) {
      try {
        textLayerCleanupRef.current();
        textLayerCleanupRef.current = null;
      } catch (error) {
        // cleanup 오류는 무시
      }
    }
    setTextLayerReady(false);
  }, []);

  // 페이지 변경 시 TextLayer cleanup
  useEffect(() => {
    return cleanupTextLayer;
  }, [currentPage, cleanupTextLayer]);

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
          console.log('✅ PDF URL 로드 완료');
          
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

  // PDF URL cleanup
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      cleanupTextLayer();
    };
  }, [pdfUrl, cleanupTextLayer]);

  // 목차 추출 함수 - 독립적으로 실행
  const extractTableOfContents = useCallback(async (pdf) => {
    console.log('🔍 목차 추출 함수 시작');
    
    // PDF 객체 유효성 검증 강화
    if (!pdf || typeof pdf !== 'object' || !pdf.numPages || pdf.numPages <= 0) {
      console.error('❌ 유효하지 않은 PDF 객체');
      return;
    }

    if (typeof pdf.getOutline !== 'function') {
      console.error('❌ PDF getOutline 메서드 없음');
      return;
    }

    if (tocLoading) {
      console.log('⏸️ 이미 목차 추출 중...');
      return;
    }

    console.log('✅ PDF 객체 검증 통과, 목차 추출 시작');
    
    // 상태 설정
    if (setTocLoading) setTocLoading(true);

    try {
      // PDF 객체 안정성 재확인
      console.log('🔄 PDF 객체 안정성 재확인...');
      
      try {
        const testPage = await pdf.getPage(1);
        console.log('✅ PDF 페이지 접근 가능:', !!testPage);
        // 테스트 페이지 메모리 정리
        if (testPage && typeof testPage.cleanup === 'function') {
          testPage.cleanup();
        }
      } catch (testError) {
        console.error('❌ PDF 페이지 접근 실패:', testError);
        throw new Error('PDF 객체가 불안정합니다: ' + testError.message);
      }

      // PDFTocExtractor 동적 import 및 사용
      console.log('📚 PDFTocExtractor 로딩...');
      const { 
        extractPDFTableOfContents
      } = await import('../../utils/PDFTocExtractor');
      
      // 상세 디버깅 정보 출력
      console.log('🔍 PDF 구조 분석 시작...');
      await debugPDFStructure(pdf);
      
      // 목차 추출 실행
      console.log('📖 목차 데이터 추출 시작...');
      const extractedToc = await extractPDFTableOfContents(pdf);
      
      console.log('📖 목차 추출 결과:', {
        success: !!extractedToc,
        isArray: Array.isArray(extractedToc),
        count: extractedToc?.length || 0,
        data: extractedToc
      });
      
      if (extractedToc && Array.isArray(extractedToc) && extractedToc.length > 0) {
        console.log('✅ 목차 추출 성공:', extractedToc.length, '개 항목');
        
        // 상태 업데이트
        if (setTableOfContents) {
          console.log('📋 목차 상태 업데이트 중...');
          setTableOfContents(extractedToc);
          console.log('✅ 목차 상태 업데이트 완료');
        } else {
          console.error('❌ setTableOfContents 함수가 없습니다!');
        }
        
        // 로컬 상태도 업데이트
        setToc(extractedToc);
        
      } else {
        console.log('ℹ️ 추출된 목차가 없거나 빈 배열');
        if (setTableOfContents) {
          setTableOfContents([]);
        }
        setToc([]);
      }
    } catch (tocError) {
      console.error('❌ 목차 추출 실패:', tocError);
      if (setTableOfContents) {
        setTableOfContents([]);
      }
      setToc([]);
    } finally {
      if (setTocLoading) setTocLoading(false);
    }
  }, [tocLoading, setTocLoading, setTableOfContents]);

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

  // PDF 문서 로드 성공 처리 - 개선됨
  const handleDocumentLoadSuccess = useCallback((pdf) => {
    console.log('✅ PDF 문서 로드 성공:', {
      numPages: pdf.numPages,
      fingerprint: pdf.fingerprint?.substring(0, 8)
    });
    
    try {
      // 상태 업데이트
      setPdfDocument(pdf);
      if (setNumPages) {
        setNumPages(pdf.numPages);
      }
      
      // currentPage 초기화 (1페이지부터 시작)
      if (!currentPage || currentPage < 1) {
        setCurrentPage(1);
      }
      
      console.log('🔄 목차 추출 예약...');
      
      // 목차 추출을 약간의 지연 후 실행 (PDF가 완전히 로드된 후)
      setTimeout(() => {
        extractTableOfContents(pdf);
      }, 100);
      
    } catch (error) {
      console.error('❌ PDF 문서 로드 성공 처리 중 오류:', error);
    }
  }, [extractTableOfContents, currentPage, setCurrentPage, setNumPages]);

  // 텍스트 선택 처리 - 내부 함수
  const handleTextSelectionInternal = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length === 0) {
      setActiveSelection(null);
      if (setShowQuickActions) {
        setShowQuickActions(false);
      }
      return;
    }

    if (selectedText.length > 0 && textLayerRef.current && pdfPageRef.current) {
      try {
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
        
        const selectionInfo = {
          text: selectedText,
          rect: relativeRect,
          pageNumber: currentPage,
          range: range.cloneRange()
        };
        
        setActiveSelection(selectionInfo);
        setSelectionData(selectionInfo);
        
        // 메모 다이얼로그 표시
        setShowPdfMemoDialog(true);
        
        console.log('✅ 텍스트 드래그 선택됨:', selectedText);
      } catch (error) {
        console.error('❌ 텍스트 선택 처리 실패:', error);
      }
    }
  }, [currentPage, setShowQuickActions]);

  // 개선된 텍스트 레이어 처리
  const handleTextLayerReady = useCallback(() => {
    // 현재 페이지와 일치하는지 확인
    if (currentPageRef.current !== currentPage) {
      console.log('⏭️ 페이지 변경으로 인한 TextLayer 무시');
      return;
    }

    try {
      if (pdfPageRef.current) {
        const newTextLayer = pdfPageRef.current.querySelector('.react-pdf__Page__textContent');
        
        if (newTextLayer && newTextLayer !== textLayerRef.current) {
          // 이전 TextLayer cleanup
          cleanupTextLayer();
          
          textLayerRef.current = newTextLayer;
          
          // 새로운 이벤트 리스너 등록
          const handleTextSelection = () => {
            // 현재 페이지 재확인
            if (currentPageRef.current === currentPage) {
              handleTextSelectionInternal();
            }
          };

          textLayerRef.current.addEventListener('mouseup', handleTextSelection);
          
          // cleanup 함수 저장
          textLayerCleanupRef.current = () => {
            if (textLayerRef.current) {
              textLayerRef.current.removeEventListener('mouseup', handleTextSelection);
            }
          };
          
          setTextLayerReady(true);
          
          const textSpans = newTextLayer.querySelectorAll('span');
          console.log('📄 텍스트 레이어 준비 완료:', {
            pageNumber: currentPage,
            spanCount: textSpans.length
          });
        }
      }
    } catch (error) {
      console.error('❌ TextLayer 처리 오류:', error);
    }
  }, [currentPage, cleanupTextLayer, handleTextSelectionInternal]);

  // 텍스트 선택 해제
  const clearTextSelection = useCallback(() => {
    setActiveSelection(null);
    setSelectionData(null);
    if (setShowQuickActions) {
      setShowQuickActions(false);
    }
    setShowPdfMemoDialog(false);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, [setShowQuickActions]);

  // 단어 선택 함수 분리
  const selectWordAtPosition = useCallback((clickX, clickY, pageRect) => {
    if (!textLayerRef.current) return null;

    const textLayer = textLayerRef.current;
    const textSpans = textLayer.querySelectorAll('span');
    
    if (textSpans.length === 0) return null;

    let bestSpan = null;
    let bestDistance = Infinity;

    // 클릭 위치와 겹치는 span 찾기
    const overlappingSpans = [];
    textSpans.forEach(span => {
      const spanRect = span.getBoundingClientRect();
      const relativeSpanRect = {
        left: spanRect.left - pageRect.left,
        top: spanRect.top - pageRect.top,
        right: spanRect.right - pageRect.left,
        bottom: spanRect.bottom - pageRect.top
      };

      const margin = 3;
      if (clickX >= relativeSpanRect.left - margin && 
          clickX <= relativeSpanRect.right + margin &&
          clickY >= relativeSpanRect.top - margin && 
          clickY <= relativeSpanRect.bottom + margin &&
          span.textContent.trim()) {
        
        const centerX = (relativeSpanRect.left + relativeSpanRect.right) / 2;
        const centerY = (relativeSpanRect.top + relativeSpanRect.bottom) / 2;
        const distance = Math.sqrt(
          Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
        );
        
        overlappingSpans.push({ span, distance, rect: relativeSpanRect });
      }
    });

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
        
        if (distance < bestDistance && distance < 20) {
          bestDistance = distance;
          bestSpan = span;
        }
      });
    } else {
      overlappingSpans.sort((a, b) => a.distance - b.distance);
      bestSpan = overlappingSpans[0].span;
    }

    if (!bestSpan) {
      console.log('❌ 선택 가능한 텍스트를 찾을 수 없음');
      return null;
    }

    const spanText = bestSpan.textContent;
    const spanRect = bestSpan.getBoundingClientRect();
    const relativeSpanRect = {
      left: spanRect.left - pageRect.left,
      top: spanRect.top - pageRect.top,
      right: spanRect.right - pageRect.left,
      bottom: spanRect.bottom - pageRect.top
    };

    let clickedCharIndex = 0;
    if (spanText.length > 1) {
      const relativeClickX = clickX - relativeSpanRect.left;
      const spanWidth = relativeSpanRect.right - relativeSpanRect.left;
      const charRatio = relativeClickX / spanWidth;
      clickedCharIndex = Math.max(0, Math.min(spanText.length - 1, Math.floor(charRatio * spanText.length)));
    }

    const wordRegex = /[\w가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+|[+\-×÷=<>≤≥≠∞∑∫∂√π∆∇α-ωΑ-Ω]+/g;
    let match;
    let selectedWord = '';
    let wordStart = 0;
    let wordEnd = 0;
    let found = false;

    while ((match = wordRegex.exec(spanText)) !== null) {
      if (clickedCharIndex >= match.index && clickedCharIndex < match.index + match[0].length) {
        selectedWord = match[0];
        wordStart = match.index;
        wordEnd = match.index + match[0].length;
        found = true;
        break;
      }
    }

    if (!found && spanText.trim()) {
      wordRegex.lastIndex = 0;
      let closestMatch = null;
      let closestDistance = Infinity;

      while ((match = wordRegex.exec(spanText)) !== null) {
        const wordCenter = match.index + match[0].length / 2;
        const distance = Math.abs(clickedCharIndex - wordCenter);
        
        if (distance < closestDistance && distance < 5) {
          closestDistance = distance;
          closestMatch = match;
        }
      }

      if (closestMatch) {
        selectedWord = closestMatch[0];
        wordStart = closestMatch.index;
        wordEnd = closestMatch.index + closestMatch[0].length;
      } else {
        console.log('❌ 클릭 위치에서 적절한 단어를 찾을 수 없음');
        return null;
      }
    }

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
      pageNumber: currentPageRef.current // ref를 사용하여 현재 페이지 참조
    };
  }, []); // currentPage 의존성 제거하고 currentPageRef.current 사용

  // PDF 페이지 클릭 처리
  const handlePdfPageClick = useCallback((e) => {
    if (!textLayerRef.current || !pdfPageRef.current || !textLayerReady) return;
    
    if (activeSelection && e.target === e.currentTarget) {
      clearTextSelection();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const pageRect = pdfPageRef.current.getBoundingClientRect();
    const clickX = e.clientX - pageRect.left;
    const clickY = e.clientY - pageRect.top;
    
    console.log('📍 PDF 페이지 클릭:', { clickX, clickY, pageRect });

    // 단어 선택 로직은 동일하게 유지
    const selectedWordData = selectWordAtPosition(clickX, clickY, pageRect);
    
    if (selectedWordData) {
      console.log('📝 단어 선택됨:', selectedWordData.text);
      setSelectionData(selectedWordData);
      setActiveSelection(selectedWordData);
      setShowPdfMemoDialog(true);
    } else {
      console.log('❌ 선택 가능한 텍스트 없음');
    }
  }, [textLayerRef, pdfPageRef, activeSelection, clearTextSelection, textLayerReady, selectWordAtPosition]);

  // PDF 컨테이너 클릭 처리
  const handlePdfContainerClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      clearTextSelection();
    }
  }, [clearTextSelection]);

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
    clearTextSelection();
    
    console.log('✅ PDF 메모 추가됨:', newAnnotation);
  }, [selectionData, pdfMemoText, selectedPdfColor, currentPage, pdfAnnotations, savePdfAnnotations, clearTextSelection]);

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

  // 활성 선택 영역 렌더링
  const renderActiveSelection = () => {
    if (!activeSelection || !activeSelection.rect) return null;

    return (
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: `${activeSelection.rect.left * 100}%`,
          top: `${activeSelection.rect.top * 100}%`,
          width: `${activeSelection.rect.width * 100}%`,
          height: `${activeSelection.rect.height * 100}%`,
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderRadius: '2px',
          border: '2px solid #3b82f6',
          minWidth: '20px',
          minHeight: '15px'
        }}
      />
    );
  };

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
    
    // Named destination 처리 개선
    if (typeof item.dest === 'string' && pdfDocument) {
      try {
        const dest = await pdfDocument.getDestination(item.dest);
        if (dest && dest[0]) {
          if (typeof dest[0] === 'object' && dest[0].num !== undefined) {
            const pageIndex = await pdfDocument.getPageIndex(dest[0]);
            targetPage = pageIndex + 1;
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

  // 목차 렌더링
  const renderTableOfContents = () => {
    console.log('🎨 목차 렌더링 시작:', {
      tocLoading,
      tableOfContents: tableOfContents,
      tocLength: tableOfContents?.length,
      localTocLength: toc?.length,
      tocArray: Array.isArray(tableOfContents),
      localTocArray: Array.isArray(toc)
    });

    if (tocLoading) {
      console.log('⏳ 목차 로딩 중 표시');
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">목차 추출 중...</p>
            <p className="text-xs text-gray-400">PDF 구조를 분석하고 있습니다</p>
          </div>
        </div>
      );
    }

    // tableOfContents와 toc 모두 체크
    const tocData = tableOfContents && tableOfContents.length > 0 ? tableOfContents : toc;
    
    console.log('📊 사용할 목차 데이터:', {
      source: tableOfContents && tableOfContents.length > 0 ? 'tableOfContents' : 'toc',
      data: tocData,
      length: tocData?.length
    });

    if (!tocData || tocData.length === 0) {
      console.log('📋 목차 없음 표시');
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <List className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">목차를 찾을 수 없습니다</p>
            <p className="text-xs text-gray-400">PDF에 북마크나 목차 정보가 없습니다</p>
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
              <div className="flex items-center space-x-2">
                {item.source && (
                  <span className="text-xs px-1 py-0.5 bg-gray-200 text-gray-600 rounded">
                    {item.source === 'bookmark' ? '북마크' : 
                    item.source === 'contents-page' ? '목차' :
                    item.source === 'text-structure' ? '텍스트' : '기본'}
                  </span>
                )}
                {item.page && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isCurrentPage 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    p.{item.page}
                  </span>
                )}
              </div>
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

    console.log('✅ 목차 렌더링 진행:', tocData.length, '개 항목');

    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              목차 ({tocData.length}개 항목)
            </h3>
            <button
              onClick={() => setViewMode('pdf')}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PDF로 돌아가기</span>
            </button>
          </div>
          <div className="space-y-1">
            {tocData.map(item => renderTocItem(item))}
          </div>
        </div>
      </div>
    );
  };

  // 렌더링 에러 핸들러들
  const handleDocumentLoadError = (error) => {
    console.error('❌ PDF 문서 로드 실패:', error);
    setPdfError('PDF 문서를 로드할 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.');
  };

  const handlePageLoadError = (error) => {
    console.error('❌ PDF 페이지 로드 실패:', error);
    setPdfError('PDF 페이지를 로드할 수 없습니다.');
  };

  const handlePageLoadSuccess = ({ pageNumber }) => {
    console.log('✅ PDF 페이지 로드 성공:', pageNumber);
  };

  // Document options 메모이제이션
  const documentOptions = useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/standard_fonts/`,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0
  }), []);

  // 로딩 상태
  if (pdfLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">PDF 로딩 중...</p>
          <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (pdfError) {
    return (
      <div className="h-full flex items-center justify-center">
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
    );
  }

  return (
    <>
      {/* 메인 컨텐츠 영역 */}
      <div className="flex h-full bg-gray-50">
        {/* PDF 뷰어 영역 */}
        <div className={`transition-all duration-300 ${isNotePanelVisible ? 'w-2/3 lg:w-3/4 xl:w-4/5' : 'w-full'} h-full`}>
          <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* PDF 렌더링 영역 */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              {viewMode === 'pdf' ? (
                <div 
                  className="pdf-container min-h-full w-full overflow-auto p-4"
                  onClick={handlePdfContainerClick}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}
                >
                  <div className="pdf-wrapper" style={{ 
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 'auto',
                    maxWidth: 'none'
                  }}>
                    {pdfUrl && (
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        onLoadError={handleDocumentLoadError}
                        loading={
                          <div className="flex items-center justify-center h-96 w-full">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-600">PDF 로딩 중...</p>
                            </div>
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
                          className="pdf-page-wrapper shadow-lg rounded-lg overflow-visible bg-white relative cursor-pointer"
                          onClick={handlePdfPageClick}
                          style={{
                            width: 'auto',
                            maxWidth: 'none'
                          }}
                        >
                          <Page
                            pageNumber={currentPage}
                            scale={scale}
                            rotate={rotation}
                            width={undefined}
                            height={undefined}
                            onLoadSuccess={handlePageLoadSuccess}
                            onLoadError={handlePageLoadError}
                            onRenderTextLayerSuccess={handleTextLayerReady}
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
                          {/* 활성 선택 영역 */}
                          {renderActiveSelection()}
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
          </div>
        </div>
        
        {/* 노트 패널 */}
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
                tableOfContents={tableOfContents && tableOfContents.length > 0 ? tableOfContents : toc}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* PDF 메모 추가 다이얼로그 */}
      {showPdfMemoDialog && selectionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">메모 추가</h3>
              </div>
              <button
                onClick={() => {
                  setShowPdfMemoDialog(false);
                  setPdfMemoText('');
                  clearTextSelection();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택된 텍스트</label>
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 border border-blue-200 max-h-32 overflow-y-auto">
                  <span className="font-medium text-blue-800">"{selectionData.text}"</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">페이지 {selectionData.pageNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">하이라이트 색상</label>
                <div className="flex gap-3">
                  {memoColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedPdfColor(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                        selectedPdfColor.name === color.name 
                          ? 'border-gray-900 ring-2 ring-gray-300 scale-110' 
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">선택된 색상: {selectedPdfColor.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모 내용</label>
                <textarea
                  value={pdfMemoText}
                  onChange={(e) => setPdfMemoText(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base placeholder-gray-400"
                  placeholder="이 텍스트에 대한 메모를 작성하세요..."
                  autoFocus
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{pdfMemoText.length}/500 글자</p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-6">
              <div className="flex gap-3">
                <button
                  onClick={addPdfAnnotation}
                  disabled={!pdfMemoText.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>메모 저장</span>
                </button>
                <button
                  onClick={() => {
                    setShowPdfMemoDialog(false);
                    setPdfMemoText('');
                    clearTextSelection();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF 메모 편집 다이얼로그 */}
      {editingPdfAnnotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">메모 편집</h3>
              </div>
              <button
                onClick={() => setEditingPdfAnnotation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선택된 텍스트</label>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border max-h-32 overflow-y-auto">
                  <span className="font-medium">"{editingPdfAnnotation.text}"</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  페이지 {editingPdfAnnotation.pageNumber} | 
                  {new Date(editingPdfAnnotation.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모 내용</label>
                <textarea
                  value={editingPdfAnnotation.memo}
                  onChange={(e) => setEditingPdfAnnotation(prev => ({ ...prev, memo: e.target.value }))}
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                  placeholder="메모를 수정하세요..."
                  autoFocus
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{editingPdfAnnotation.memo.length}/500 글자</p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updatePdfAnnotation(editingPdfAnnotation.id, editingPdfAnnotation.memo);
                    setEditingPdfAnnotation(null);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>수정 완료</span>
                </button>
                <button
                  onClick={() => {
                    deletePdfAnnotation(editingPdfAnnotation.id);
                    setEditingPdfAnnotation(null);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  삭제
                </button>
                <button
                  onClick={() => setEditingPdfAnnotation(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TextbookContentView;
// utils/pdfExportUtils.js - 개선된 PDF 내보내기 유틸리티

/**
 * PDF에 메모와 노트를 추가하여 새로운 PDF를 생성하는 함수
 * @param {string} pdfId - PDF ID
 * @param {Array} pdfAnnotations - PDF 메모 데이터
 * @param {Array} highlights - 하이라이트 노트 데이터
 * @param {Object} textbookData - 원서 정보
 * @returns {Promise<Blob>} - 생성된 PDF Blob
 */
export async function createAnnotatedPDF(pdfId, pdfAnnotations = [], highlights = [], textbookData) {
  try {
    console.log('📄 PDF 어노테이션 시작:', {
      pdfId,
      pdfAnnotations: pdfAnnotations.length,
      highlights: highlights.length,
      title: textbookData?.title
    });

    // 필요한 라이브러리들을 동적으로 import
    const pdfLib = await import('pdf-lib');
    const { PDFDocument, StandardFonts } = pdfLib;
    
    // PDF 분석기에서 PDF 가져오기
    let pdfUrl;
    try {
      const { getPDFFromIndexedDB } = await import('./pdfAnalyzer');
      pdfUrl = await getPDFFromIndexedDB(pdfId);
    } catch (error) {
      console.error('❌ PDF 분석기 import 실패:', error);
      throw new Error('PDF 분석기를 불러올 수 없습니다.');
    }

    if (!pdfUrl) {
      throw new Error('원본 PDF를 찾을 수 없습니다.');
    }

    // 원본 PDF 로드
    let existingPdfBytes;
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`PDF 로드 실패: ${response.status}`);
      }
      existingPdfBytes = await response.arrayBuffer();
    } catch (error) {
      console.error('❌ PDF 파일 로드 실패:', error);
      throw new Error('PDF 파일을 불러올 수 없습니다.');
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 폰트 임베드
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    // 하이라이트 노트를 PDF 어노테이션 형식으로 변환
    const highlightAnnotations = highlights
      .filter(h => h.note && h.note.trim() !== '') // 메모가 있는 것만
      .map((h, index) => ({
        id: h.id,
        pageNumber: h.page,
        text: h.text || h.title || '선택된 텍스트',
        memo: h.note,
        rect: {
          left: 0.65, // 오른쪽에 배치
          top: 0.1 + ((index % 5) * 0.15), // 인덱스 기반 위치로 겹치지 않게
          width: 0.3,
          height: 0.15
        },
        color: getColorFromClass(h.color),
        colorName: getColorNameFromClass(h.color),
        colorClass: h.color,
        createdAt: h.createdAt || new Date().toISOString(),
        type: 'highlight_note'
      }));

    // 모든 어노테이션 합치기
    const allAnnotations = [...pdfAnnotations, ...highlightAnnotations];
    
    console.log(`📝 총 ${allAnnotations.length}개의 메모/노트 처리 중 (PDF 메모: ${pdfAnnotations.length}개, 하이라이트 노트: ${highlightAnnotations.length}개)`);

    if (allAnnotations.length === 0) {
      console.log('📄 메모가 없어 원본 PDF 반환');
      const blob = new Blob([existingPdfBytes], { type: 'application/pdf' });
      URL.revokeObjectURL(pdfUrl);
      return blob;
    }

    // 페이지별로 어노테이션 그룹화
    const annotationsByPage = groupAnnotationsByPage(allAnnotations);

    // 각 페이지에 메모 추가
    for (const [pageNumber, pageAnnotations] of Object.entries(annotationsByPage)) {
      const pageIndex = parseInt(pageNumber) - 1;
      
      if (pageIndex >= 0 && pageIndex < pages.length) {
        const page = pages[pageIndex];
        await addAnnotationsToPage(page, pageAnnotations, font);
        console.log(`📄 페이지 ${pageNumber}에 ${pageAnnotations.length}개 메모 추가 완료`);
      }
    }

    // PDF 바이트 생성
    const pdfBytes = await pdfDoc.save();
    
    // URL 정리
    URL.revokeObjectURL(pdfUrl);
    
    console.log('✅ PDF 어노테이션 완료');
    return new Blob([pdfBytes], { type: 'application/pdf' });

  } catch (error) {
    console.error('❌ PDF 어노테이션 실패:', error);
    throw error;
  }
}

/**
 * 페이지별로 어노테이션을 그룹화하는 함수
 */
function groupAnnotationsByPage(annotations) {
  const grouped = {};
  
  annotations.forEach(annotation => {
    const pageNumber = annotation.pageNumber || 1;
    if (!grouped[pageNumber]) {
      grouped[pageNumber] = [];
    }
    grouped[pageNumber].push(annotation);
  });

  return grouped;
}

/**
 * 페이지에 어노테이션들을 추가하는 함수
 */
async function addAnnotationsToPage(page, annotations, font) {
  const { width, height } = page.getSize();
  
  // 어노테이션을 타입별로 정렬 (PDF 메모 먼저, 하이라이트 노트 나중에)
  const sortedAnnotations = annotations.sort((a, b) => {
    if (a.type === 'highlight_note' && b.type !== 'highlight_note') return 1;
    if (a.type !== 'highlight_note' && b.type === 'highlight_note') return -1;
    return 0;
  });
  
  for (let i = 0; i < sortedAnnotations.length; i++) {
    const annotation = sortedAnnotations[i];
    try {
      // 하이라이트 노트의 경우 인덱스를 이용해 위치 조정
      if (annotation.type === 'highlight_note') {
        const highlightIndex = sortedAnnotations.filter((a, idx) => 
          idx <= i && a.type === 'highlight_note'
        ).length - 1;
        
        await addHighlightAnnotation(page, annotation, font, width, height, highlightIndex);
      } else {
        await addSingleAnnotation(page, annotation, font, width, height);
      }
    } catch (error) {
      console.error('어노테이션 추가 실패:', error, annotation.id);
      // 개별 어노테이션 실패 시에도 계속 진행
    }
  }
}

/**
 * 하이라이트 노트를 페이지에 추가하는 함수
 */
async function addHighlightAnnotation(page, annotation, font, pageWidth, pageHeight, index) {
  const { rgb } = await import('pdf-lib');
  
  // 메모 위치 계산 (오른쪽에 세로로 배치)
  const padding = 8;
  const maxWidth = 250;
  const x = pageWidth * 0.68; // 오른쪽에서 68% 위치
  const baseY = pageHeight - 80; // 상단에서 80px 아래
  const spacing = 130; // 메모 간 간격
  const y = baseY - (index * spacing);
  
  // 페이지 아래쪽으로 넘어가면 건너뛰기
  if (y < 100) {
    return;
  }

  // 색상 설정
  const colors = await getAnnotationColors(annotation.colorName);
  
  // 텍스트 준비
  const selectedText = annotation.text && annotation.text.length > 30 
    ? annotation.text.substring(0, 30) + '...' 
    : annotation.text || '선택된 텍스트';
  
  const memoLines = (annotation.memo || '').split('\n').filter(line => line.trim());
  const lineHeight = 12;
  const titleHeight = 16;
  
  // 박스 크기 계산
  const boxHeight = Math.max(
    70,
    titleHeight + (Math.min(memoLines.length, 4) * lineHeight) + (padding * 3) + 20
  );
  
  // 배경 박스 그리기
  page.drawRectangle({
    x: x,
    y: y - boxHeight,
    width: maxWidth,
    height: boxHeight,
    color: colors.background,
    borderColor: colors.border,
    borderWidth: 1.5,
    opacity: 0.95,
  });

  // 하이라이트 아이콘
  page.drawText('📚', {
    x: x + padding,
    y: y - padding - 12,
    size: 10,
  });

  // 선택된 텍스트 표시
  page.drawText(`"${selectedText}"`, {
    x: x + padding + 20,
    y: y - padding - 12,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
    maxWidth: maxWidth - (padding * 2) - 20,
  });

  // 구분선
  page.drawLine({
    start: { x: x + padding, y: y - padding - 22 },
    end: { x: x + maxWidth - padding, y: y - padding - 22 },
    thickness: 0.5,
    color: colors.border,
    opacity: 0.6,
  });

  // 메모 내용 표시 (최대 4줄)
  let currentY = y - padding - 35;
  for (const line of memoLines.slice(0, 4)) {
    if (currentY > y - boxHeight + 20 && line.trim()) {
      page.drawText(line.trim(), {
        x: x + padding,
        y: currentY,
        size: 9,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: maxWidth - (padding * 2),
      });
      currentY -= lineHeight;
    }
  }

  // 더 많은 내용이 있으면 표시
  if (memoLines.length > 4) {
    page.drawText('...', {
      x: x + padding,
      y: currentY,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // 날짜 표시
  const createdDate = new Date(annotation.createdAt).toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
  
  page.drawText(`📅 ${createdDate}`, {
    x: x + padding,
    y: y - boxHeight + 8,
    size: 7,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
    maxWidth: maxWidth - (padding * 2),
  });
}

/**
 * PDF 메모를 페이지에 추가하는 함수
 */
async function addSingleAnnotation(page, annotation, font, pageWidth, pageHeight) {
  const { rgb } = await import('pdf-lib');
  
  // 메모 위치 계산 (원래 위치 사용)
  const padding = 8;
  const minX = 10;
  const minY = 50;
  const maxWidth = 280;
  
  let x = Math.max(minX, (annotation.rect?.left || 0.1) * pageWidth);
  let y = Math.max(minY, pageHeight - ((annotation.rect?.top || 0.1) * pageHeight) - ((annotation.rect?.height || 0.15) * pageHeight));
  
  // 페이지 경계 확인
  if (x + maxWidth > pageWidth - 10) {
    x = pageWidth - maxWidth - 10;
  }

  // 색상 설정
  const colors = await getAnnotationColors(annotation.colorName);
  
  // 텍스트 준비
  const selectedText = annotation.text && annotation.text.length > 40 
    ? annotation.text.substring(0, 40) + '...' 
    : annotation.text || '선택된 텍스트';
  
  const memoLines = (annotation.memo || '').split('\n').filter(line => line.trim());
  const lineHeight = 12;
  const titleHeight = 16;
  
  // 박스 크기 계산
  const boxHeight = Math.max(
    60,
    titleHeight + (memoLines.length * lineHeight) + (padding * 3) + 15
  );
  
  // 배경 박스 그리기
  page.drawRectangle({
    x: x,
    y: y - boxHeight,
    width: maxWidth,
    height: boxHeight,
    color: colors.background,
    borderColor: colors.border,
    borderWidth: 1.5,
    opacity: 0.95,
  });

  // PDF 메모 아이콘
  page.drawText('📝', {
    x: x + padding,
    y: y - padding - 12,
    size: 10,
  });

  // 선택된 텍스트 표시
  page.drawText(`"${selectedText}"`, {
    x: x + padding + 20,
    y: y - padding - 12,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
    maxWidth: maxWidth - (padding * 2) - 20,
  });

  // 구분선
  page.drawLine({
    start: { x: x + padding, y: y - padding - 22 },
    end: { x: x + maxWidth - padding, y: y - padding - 22 },
    thickness: 0.5,
    color: colors.border,
    opacity: 0.6,
  });

  // 메모 내용 표시
  let currentY = y - padding - 35;
  for (const line of memoLines) {
    if (currentY > minY && line.trim()) {
      page.drawText(line.trim(), {
        x: x + padding,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: maxWidth - (padding * 2),
      });
      currentY -= lineHeight;
    }
  }

  // 날짜 표시
  const createdDate = new Date(annotation.createdAt).toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
  
  page.drawText(`📅 ${createdDate}`, {
    x: x + padding,
    y: y - boxHeight + 8,
    size: 7,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
    maxWidth: maxWidth - (padding * 2),
  });
}

/**
 * 어노테이션 색상을 가져오는 함수
 */
async function getAnnotationColors(colorName) {
  const { rgb } = await import('pdf-lib');
  
  const colorMap = {
    'Yellow': {
      background: rgb(1, 0.98, 0.8),
      border: rgb(0.9, 0.8, 0)
    },
    'Green': {
      background: rgb(0.85, 0.98, 0.85),
      border: rgb(0.2, 0.8, 0.2)
    },
    'Blue': {
      background: rgb(0.85, 0.92, 1),
      border: rgb(0.2, 0.5, 1)
    },
    'Pink': {
      background: rgb(1, 0.85, 0.9),
      border: rgb(1, 0.3, 0.6)
    },
    'Purple': {
      background: rgb(0.9, 0.85, 1),
      border: rgb(0.6, 0.3, 1)
    }
  };

  return colorMap[colorName] || colorMap['Yellow'];
}

/**
 * 색상 클래스에서 실제 색상값으로 변환하는 헬퍼 함수
 */
function getColorFromClass(colorClass) {
  const colorMap = {
    'bg-yellow-200': '#fef08a',
    'bg-green-200': '#bbf7d0',
    'bg-blue-200': '#bfdbfe',
    'bg-pink-200': '#f9a8d4',
    'bg-purple-200': '#e9d5ff'
  };
  return colorMap[colorClass] || '#fef08a';
}

/**
 * 색상 클래스에서 색상 이름으로 변환하는 헬퍼 함수
 */
function getColorNameFromClass(colorClass) {
  const nameMap = {
    'bg-yellow-200': 'Yellow',
    'bg-green-200': 'Green',
    'bg-blue-200': 'Blue',
    'bg-pink-200': 'Pink',
    'bg-purple-200': 'Purple'
  };
  return nameMap[colorClass] || 'Yellow';
}

/**
 * PDF 파일을 다운로드하는 함수
 */
export function downloadPDFBlob(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL 정리 (약간의 지연 후)
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    console.log('✅ PDF 다운로드 완료:', filename);
  } catch (error) {
    console.error('❌ PDF 다운로드 실패:', error);
    throw error;
  }
}

/**
 * 파일명을 안전하게 생성하는 함수
 */
export function generateSafeFilename(title, suffix = 'with_notes') {
  if (!title) {
    title = 'textbook';
  }
  
  // 파일명에서 안전하지 않은 문자 제거
  const safeTitle = title
    .replace(/[<>:"/\\|?*]/g, '') // 윈도우에서 금지된 문자들
    .replace(/\s+/g, '_') // 공백을 언더스코어로
    .substring(0, 50); // 길이 제한
  
  return `${safeTitle}_${suffix}.pdf`;
}
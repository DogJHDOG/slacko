// 수정된 PDFTocExtractor.js
import { pdfjs } from 'react-pdf';

// PDF.js 워커 설정
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  const pdfjsVersion = pdfjs.version || '3.11.174';
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
  console.log('✅ PDF.js 워커 설정 완료:', pdfjsVersion);
}

/**
 * PDF 파일에서 목차(TOC) 추출 - 수정된 버전
 * 이미 로드된 PDF 객체를 받아서 처리
 */
export const extractPDFTableOfContents = async (pdfSource) => {
  console.log('🔍 PDF 목차 추출 시작:', typeof pdfSource);
  
  try {
    let pdf = null;
    
    // PDF 소스가 이미 로드된 객체인지 확인
    if (pdfSource && typeof pdfSource === 'object' && pdfSource.numPages) {
      console.log('📄 이미 로드된 PDF 객체 사용:', pdfSource.numPages, '페이지');
      pdf = pdfSource;
    } else {
      console.log('📄 새 PDF 문서 로드 시도');
      pdf = await loadPDFDocumentWithRetry(pdfSource, 3);
      if (!pdf) {
        throw new Error('PDF 문서 로드 실패');
      }
    }
    
    console.log(`📄 PDF 준비 완료: ${pdf.numPages}페이지`);
    
    // PDF 안정화 대기
    await ensurePDFStability(pdf);
    
    // 1차: PDF 북마크(outline) 추출
    console.log('🔖 PDF 북마크 추출 시도...');
    const bookmarkToc = await extractFromBookmarksImproved(pdf);
    if (bookmarkToc.length > 0) {
      console.log(`✅ 북마크에서 ${bookmarkToc.length}개 목차 추출 성공`);
      return bookmarkToc;
    }
    
    // 2차: 목차 전용 페이지 검색
    console.log('📋 목차 페이지 검색 시도...');
    const contentsPageToc = await extractFromContentsPageImproved(pdf);
    if (contentsPageToc.length > 0) {
      console.log(`✅ 목차 페이지에서 ${contentsPageToc.length}개 목차 추출 성공`);
      return contentsPageToc;
    }
    
    // 3차: 텍스트 구조 분석
    console.log('📝 텍스트 구조 분석 시도...');
    const textStructureToc = await extractFromTextStructure(pdf);
    if (textStructureToc.length > 0) {
      console.log(`✅ 텍스트 구조에서 ${textStructureToc.length}개 목차 추출 성공`);
      return textStructureToc;
    }
    
    // 4차: 기본 구조 생성
    console.log('🔧 기본 구조 생성...');
    const basicToc = await generateBasicStructure(pdf);
    console.log(`✅ 기본 구조 ${basicToc.length}개 항목 생성`);
    
    return basicToc;
    
  } catch (error) {
    console.error('❌ PDF 목차 추출 실패:', error);
    throw error;
  }
};

/**
 * PDF 문서 로드 - 수정된 버전
 */
const loadPDFDocumentWithRetry = async (source, maxRetries = 3) => {
  // 이미 로드된 PDF 객체인 경우 바로 반환
  if (source && typeof source === 'object' && source.numPages) {
    console.log('✅ 이미 로드된 PDF 객체 감지');
    return source;
  }
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📄 PDF 로드 시도 ${attempt}/${maxRetries}`);
      
      let data;
      
      // 소스 타입별 처리
      if (source instanceof File) {
        console.log('📁 File 객체 → ArrayBuffer 변환');
        data = await source.arrayBuffer();
      } else if (source instanceof ArrayBuffer) {
        console.log('📦 ArrayBuffer 직접 사용');
        data = source;
      } else if (source instanceof Uint8Array) {
        console.log('🔢 Uint8Array 직접 사용');
        data = source;
      } else if (typeof source === 'string') {
        console.log('🔗 URL 문자열 사용');
        data = source;
      } else if (source && source.url) {
        console.log('🌐 URL 객체 사용');
        data = source.url;
      } else {
        throw new Error(`지원하지 않는 PDF 소스 타입: ${typeof source}`);
      }
      
      // PDF 로드 옵션 최적화
      const loadingTask = pdfjs.getDocument({
        data: data,
        // 기본 설정
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        verbosity: 0,
        
        // 스트리밍 설정
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        
        // 리소스 설정
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/standard_fonts/`,
        
        // 보안 설정
        stopAtErrors: false,
        maxImageSize: -1,
        password: ''
      });
      
      // 타임아웃 설정
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF 로드 타임아웃 (30초)')), 30000)
        )
      ]);
      
      console.log('✅ PDF 로드 완료:', {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint?.substring(0, 8) + '...'
      });
      
      return pdf;
      
    } catch (error) {
      console.error(`❌ PDF 로드 시도 ${attempt} 실패:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`PDF 로드 실패 (${maxRetries}회 시도): ${error.message}`);
      }
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * PDF 안정화 대기 함수
 */
const ensurePDFStability = async (pdf) => {
  try {
    console.log('⏳ PDF 안정화 대기...');
    
    // 첫 페이지 접근성 테스트
    const firstPage = await pdf.getPage(1);
    
    // 간단한 텍스트 컨텐츠 로드 테스트
    try {
      await firstPage.getTextContent();
    } catch (textError) {
      console.warn('⚠️ 텍스트 컨텐츠 로드 실패:', textError.message);
    }
    
    // 안정화 대기
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ PDF 안정화 완료');
  } catch (error) {
    console.warn('⚠️ PDF 안정화 실패:', error.message);
    // 실패해도 계속 진행
  }
};

/**
 * 개선된 북마크 추출 - 더 안전한 버전
 */
const extractFromBookmarksImproved = async (pdf) => {
  try {
    console.log('🔖 북마크 추출 시도...');
    
    let outline = null;
    
    // 여러 번 시도로 안정성 확보
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔖 북마크 추출 시도 ${attempt}/3`);
        
        // getOutline 호출 전 대기
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
        
        outline = await Promise.race([
          pdf.getOutline(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getOutline 타임아웃')), 5000)
          )
        ]);
        
        if (outline !== null) {
          break;
        }
      } catch (outlineError) {
        console.warn(`⚠️ 북마크 추출 시도 ${attempt} 실패:`, outlineError.message);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      }
    }
    
    // 결과 검증
    console.log('📚 북마크 추출 결과:', {
      outline: !!outline,
      isArray: Array.isArray(outline),
      length: outline ? outline.length : 0,
      type: typeof outline
    });
    
    if (!outline || !Array.isArray(outline) || outline.length === 0) {
      console.log('ℹ️ PDF에 유효한 북마크가 없음');
      return [];
    }
    
    // 북마크 구조 검증
    const validBookmarks = outline.filter(bookmark => 
      bookmark && bookmark.title && typeof bookmark.title === 'string'
    );
    
    if (validBookmarks.length === 0) {
      console.log('ℹ️ 유효한 북마크가 없음');
      return [];
    }
    
    console.log(`📋 ${validBookmarks.length}개 유효한 북마크 발견`);
    
    // 북마크를 목차로 변환
    const toc = await convertBookmarksToTocSafe(pdf, validBookmarks);
    
    return toc;
    
  } catch (error) {
    console.error('❌ 북마크 추출 실패:', error);
    return [];
  }
};

/**
 * 안전한 북마크 변환 함수
 */
const convertBookmarksToTocSafe = async (pdf, bookmarks, level = 0) => {
  const toc = [];
  let idCounter = Date.now() + Math.random();
  
  console.log(`📖 북마크 변환 시작 - 레벨 ${level}, 개수: ${bookmarks.length}`);
  
  for (let i = 0; i < bookmarks.length && i < 50; i++) { // 최대 50개로 제한
    const bookmark = bookmarks[i];
    
    if (!bookmark || !bookmark.title || typeof bookmark.title !== 'string') {
      continue;
    }
    
    const title = bookmark.title.trim();
    if (!title || title.length < 2 || title.length > 200) {
      continue;
    }
    
    let pageNumber = 1;
    
    // 안전한 페이지 번호 추출
    if (bookmark.dest) {
      try {
        pageNumber = await getPageNumberSafe(pdf, bookmark.dest);
      } catch (destError) {
        console.warn(`⚠️ 페이지 번호 추출 실패 for "${title}":`, destError.message);
        
        // 제목에서 숫자 추출 시도
        const pageMatch = title.match(/(\d+)\s*$/);
        if (pageMatch) {
          const extractedPage = parseInt(pageMatch[1]);
          if (extractedPage > 0 && extractedPage <= pdf.numPages) {
            pageNumber = extractedPage;
          }
        }
      }
    }
    
    const tocItem = {
      id: `bookmark-${idCounter++}`,
      title: title,
      page: pageNumber,
      level: level,
      children: [],
      source: 'bookmark'
    };
    
    // 하위 항목 처리 (재귀 깊이 제한)
    if (bookmark.items && bookmark.items.length > 0 && level < 5) {
      try {
        const childToc = await convertBookmarksToTocSafe(pdf, bookmark.items, level + 1);
        tocItem.children = childToc;
      } catch (childError) {
        console.warn(`⚠️ 하위 북마크 처리 실패 for "${title}":`, childError.message);
      }
    }
    
    toc.push(tocItem);
  }
  
  console.log(`✅ 북마크 변환 완료 - 레벨 ${level}: ${toc.length}개`);
  return toc;
};

/**
 * 안전한 페이지 번호 추출
 */
const getPageNumberSafe = async (pdf, dest) => {
  try {
    let resolvedDest = dest;
    
    // Named destination 처리
    if (typeof dest === 'string') {
      try {
        resolvedDest = await pdf.getDestination(dest);
      } catch (namedDestError) {
        console.warn(`⚠️ Named destination 해결 실패: ${namedDestError.message}`);
        return 1;
      }
    }
    
    if (!resolvedDest || !Array.isArray(resolvedDest) || resolvedDest.length === 0) {
      return 1;
    }
    
    const pageRef = resolvedDest[0];
    
    // getPageIndex 시도
    if (pageRef && typeof pageRef === 'object' && 'num' in pageRef) {
      try {
        const pageIndex = await pdf.getPageIndex(pageRef);
        const pageNumber = pageIndex + 1;
        
        if (pageNumber >= 1 && pageNumber <= pdf.numPages) {
          return pageNumber;
        }
      } catch (pageIndexError) {
        console.warn(`⚠️ getPageIndex 실패: ${pageIndexError.message}`);
      }
    }
    
    // 직접 num 사용
    if (pageRef && typeof pageRef.num === 'number') {
      const estimatedPage = Math.min(Math.max(1, pageRef.num), pdf.numPages);
      return estimatedPage;
    }
    
    return 1;
    
  } catch (error) {
    console.error('❌ 안전한 페이지 번호 추출 실패:', error);
    return 1;
  }
};

/**
 * 목차 페이지에서 추출 - 개선된 버전
 */
const extractFromContentsPageImproved = async (pdf) => {
  const toc = [];
  let idCounter = Date.now();
  const maxPagesToCheck = Math.min(15, pdf.numPages);
  
  console.log(`📋 목차 페이지 검색: ${maxPagesToCheck}페이지`);
  
  for (let pageNum = 1; pageNum <= maxPagesToCheck; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (!textContent || !textContent.items || textContent.items.length === 0) {
        continue;
      }
      
      const pageText = textContent.items
        .map(item => item.str || '')
        .join(' ')
        .toLowerCase();
      
      // 목차 페이지 감지 패턴
      const tocIndicators = [
        /목차|차례|table\s*of\s*contents|contents(?!\s+of)/i,
        /(chapter|section)\s+\d+.*\d+/i,
        /\.{3,}.*\d+/
      ];
      
      const isContentsPage = tocIndicators.some(pattern => pattern.test(pageText));
      
      if (!isContentsPage) continue;
      
      console.log(`📋 목차 페이지 발견: ${pageNum}페이지`);
      
      // 텍스트 아이템 정렬 및 라인 그룹화
      const lines = groupTextIntoLines(textContent.items);
      
      // 목차 항목 추출
      const extractedCount = extractTocFromLines(lines, toc, idCounter, pdf.numPages, pageNum);
      
      console.log(`📋 페이지 ${pageNum}에서 ${extractedCount}개 목차 추출`);
      
    } catch (pageError) {
      console.warn(`⚠️ 페이지 ${pageNum} 처리 실패:`, pageError.message);
    }
  }
  
  // 정리 및 정렬
  const cleanedToc = toc
    .filter(item => item.title && item.page > 0 && item.page <= pdf.numPages)
    .sort((a, b) => a.page - b.page)
    .slice(0, 30); // 최대 30개로 제한
  
  return removeDuplicates(cleanedToc);
};

/**
 * 텍스트 아이템을 라인별로 그룹화
 */
const groupTextIntoLines = (textItems) => {
  const sortedItems = textItems
    .filter(item => item.str && item.str.trim())
    .sort((a, b) => {
      const yDiff = (b.transform[5] || 0) - (a.transform[5] || 0);
      if (Math.abs(yDiff) > 5) return yDiff;
      return (a.transform[4] || 0) - (b.transform[4] || 0);
    });
  
  const lines = [];
  let currentLine = [];
  let currentY = null;
  
  for (const item of sortedItems) {
    const y = Math.round((item.transform[5] || 0) / 5) * 5;
    
    if (currentY === null || Math.abs(y - currentY) <= 5) {
      currentLine.push(item.str.trim());
      currentY = y;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      currentLine = [item.str.trim()];
      currentY = y;
    }
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }
  
  return lines;
};

/**
 * 라인에서 목차 추출
 */
const extractTocFromLines = (lines, toc, idCounter, totalPages, sourcePage) => {
  const tocPatterns = [
    // 기본 패턴들
    /^(chapter|ch\.?)\s+(\d+)\s*[:\-.]?\s*(.+?)\s*\.{2,}\s*(\d+)\s*$/i,
    /^(\d+)\s*[.-]\s*(.+?)\s*\.{2,}\s*(\d+)\s*$/,
    /^(\d+\.\d+)\s+(.+?)\s*\.{2,}\s*(\d+)\s*$/,
    /(.+?)\s*\.{3,}\s*(\d+)\s*$/,
    // 한국어 패턴
    /^(제\s*\d+\s*장)\s*[:\-.]?\s*(.+?)\s*\.{2,}\s*(\d+)\s*$/,
    // 간단한 패턴
    /(.+?)\s+(\d+)\s*$/
  ];
  
  let extractedCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5 || trimmed.length > 150) continue;
    
    // 불필요한 라인 필터링
    if (/^(page|목차|차례|contents|table|index|\d+\s*$)/i.test(trimmed)) continue;
    
    for (const pattern of tocPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let title = '';
        let pageRef = 0;
        
        if (match.length >= 4) {
          title = (match[3] || match[1]).trim();
          pageRef = parseInt(match[4] || match[2]);
        } else if (match.length >= 3) {
          title = match[1].trim();
          pageRef = parseInt(match[2]);
        }
        
        title = title.replace(/^[-.\s]+|\.{2,}.*$/g, '').trim();
        
        if (title && 
            title.length >= 3 && 
            title.length <= 100 &&
            pageRef > 0 && 
            pageRef <= totalPages &&
            !/^\d+$/.test(title)) {
          
          toc.push({
            id: `contents-${idCounter++}`,
            title: title,
            page: pageRef,
            level: 0,
            children: [],
            source: 'contents-page',
            sourcePage: sourcePage
          });
          
          extractedCount++;
        }
        break;
      }
    }
  }
  
  return extractedCount;
};

/**
 * 텍스트 구조 분석
 */
const extractFromTextStructure = async (pdf) => {
  console.log('📝 텍스트 구조 분석 시작');
  
  const toc = [];
  const maxPages = Math.min(20, pdf.numPages);
  
  // 샘플 페이지에서 폰트 정보 수집
  const fontAnalysis = await analyzeFontStructure(pdf, maxPages);
  
  if (!fontAnalysis.hasStructure) {
    console.log('📝 텍스트 구조가 명확하지 않음');
    return [];
  }
  
  // 제목 후보 추출
  const titleCandidates = await extractTitleCandidates(pdf, maxPages, fontAnalysis);
  
  // 목차 항목 생성
  titleCandidates.forEach((candidate, index) => {
    toc.push({
      id: `text-${Date.now()}-${index}`,
      title: candidate.title,
      page: candidate.page,
      level: candidate.level,
      children: [],
      source: 'text-structure',
      confidence: candidate.confidence
    });
  });
  
  console.log(`📝 텍스트 구조 분석 완료: ${toc.length}개 항목`);
  return toc.slice(0, 20); // 최대 20개
};

/**
 * 폰트 구조 분석
 */
const analyzeFontStructure = async (pdf, maxPages) => {
  const fontSizes = [];
  const fontNames = new Set();
  
  for (let pageNum = 1; pageNum <= Math.min(5, maxPages); pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      textContent.items.forEach(item => {
        if (item.str && item.str.trim()) {
          const fontSize = Math.abs(item.transform[0] || 12);
          fontSizes.push(fontSize);
          if (item.fontName) {
            fontNames.add(item.fontName);
          }
        }
      });
    } catch (error) {
      console.warn(`폰트 분석 페이지 ${pageNum} 오류:`, error.message);
    }
  }
  
  if (fontSizes.length === 0) {
    return { hasStructure: false };
  }
  
  const avgSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
  const uniqueSizes = [...new Set(fontSizes)].sort((a, b) => b - a);
  
  return {
    hasStructure: uniqueSizes.length >= 3,
    avgSize,
    largeSize: uniqueSizes[0],
    mediumSize: uniqueSizes[Math.floor(uniqueSizes.length * 0.3)] || avgSize,
    fontCount: fontNames.size
  };
};

/**
 * 제목 후보 추출
 */
const extractTitleCandidates = async (pdf, maxPages, fontAnalysis) => {
  const candidates = [];
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      textContent.items.forEach(item => {
        if (!item.str || !item.str.trim()) return;
        
        const text = item.str.trim();
        const fontSize = Math.abs(item.transform[0] || 12);
        const fontName = item.fontName || '';
        
        // 제목 패턴 검사
        let confidence = 0;
        let level = 2;
        
        // 폰트 크기 기반 점수
        if (fontSize >= fontAnalysis.largeSize * 0.95) {
          confidence += 3;
          level = 0;
        } else if (fontSize >= fontAnalysis.mediumSize * 0.95) {
          confidence += 2;
          level = 1;
        } else if (fontSize > fontAnalysis.avgSize * 1.2) {
          confidence += 1;
          level = 2;
        }
        
        // 볼드체 검사
        if (fontName.toLowerCase().includes('bold')) {
          confidence += 1;
        }
        
        // 제목 패턴 검사
        const titlePatterns = [
          /^(chapter|section|part)\s+\d+/i,
          /^제\s*\d+\s*장\s*[.-]?\s*(.+?)\s*\.{2,}\s*(\d+)\s*$/,
          /^[A-Z][A-Z\s]{5,30}$/
        ];
        
        if (titlePatterns.some(pattern => pattern.test(text))) {
          confidence += 2;
        }
        
        // 유효한 제목인지 검사
        if (confidence >= 2 && isValidTitle(text)) {
          candidates.push({
            title: text,
            page: pageNum,
            level,
            confidence,
            fontSize
          });
        }
      });
    } catch (error) {
      console.warn(`제목 추출 페이지 ${pageNum} 오류:`, error.message);
    }
  }
  
  // 중복 제거 및 정렬
  return removeDuplicates(candidates)
    .filter(c => c.confidence >= 2)
    .sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return b.confidence - a.confidence;
    })
    .slice(0, 15);
};

/**
 * 기본 구조 생성
 */
const generateBasicStructure = async (pdf) => {
  const toc = [];
  const totalPages = pdf.numPages;
  const sectionCount = Math.min(6, Math.max(2, Math.floor(totalPages / 20)));
  
  console.log(`🔧 기본 구조 생성: ${sectionCount}개 섹션`);
  
  for (let i = 0; i < sectionCount; i++) {
    const startPage = Math.floor((totalPages / sectionCount) * i) + 1;
    const endPage = Math.min(Math.floor((totalPages / sectionCount) * (i + 1)), totalPages);
    
    let sectionTitle = `Section ${i + 1}`;
    
    // 첫 페이지에서 제목 추출 시도
    try {
      const page = await pdf.getPage(startPage);
      const textContent = await page.getTextContent();
      
      const topItems = textContent.items
        .filter(item => item.str && item.str.trim() && (item.transform[5] || 0) > 700)
        .sort((a, b) => (b.transform[5] || 0) - (a.transform[5] || 0))
        .slice(0, 2);
      
      const topText = topItems.map(item => item.str.trim()).join(' ');
      
      if (topText && topText.length > 3 && topText.length < 60) {
        const cleanTitle = topText.replace(/[^\w\s가-힣]/g, ' ').trim();
        if (cleanTitle && isValidTitle(cleanTitle)) {
          sectionTitle = cleanTitle;
        }
      }
    } catch (pageError) {
      console.warn(`구간 ${i + 1} 제목 추출 실패:`, pageError.message);
    }
    
    toc.push({
      id: `basic-${Date.now()}-${i}`,
      title: sectionTitle,
      page: startPage,
      level: 0,
      children: [],
      source: 'basic-structure',
      pageRange: `${startPage}-${endPage}`
    });
  }
  
  return toc;
};

/**
 * 유효한 제목인지 검증
 */
const isValidTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  
  const trimmed = title.trim();
  if (trimmed.length < 2 || trimmed.length > 150) return false;
  
  // 숫자만 있는 경우 제외
  if (/^\d+\.?\s*$/.test(trimmed)) return false;
  
  // 무효한 패턴들
  const invalidPatterns = [
    /^page\s*\d*$/i,
    /^pdf$/i,
    /^document$/i,
    /^copyright/i,
    /^www\./i,
    /^http/i,
    /^email/i,
    /^\.{3,}$/,
    /^_{3,}$/,
    /^-{3,}$/,
    /^blank$/i,
    /intentionally/i,
    /^\s*$/
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(trimmed))) {
    return false;
  }
  
  // 의미있는 문자 포함 여부
  const hasValidChars = /[a-zA-Z가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,}/.test(trimmed);
  
  return hasValidChars;
};

/**
 * 중복 제거 함수
 */
const removeDuplicates = (items, key = 'title') => {
  const seen = new Map();
  const unique = [];
  
  items.forEach(item => {
    if (!item || !item[key]) return;
    
    const keyValue = item[key].toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s가-힣]/g, '')
      .trim();
    
    if (!keyValue) return;
    
    const existing = seen.get(keyValue);
    if (!existing || (item.confidence && item.confidence > (existing.confidence || 0))) {
      if (existing) {
        const existingIndex = unique.findIndex(u => u === existing);
        if (existingIndex >= 0) unique.splice(existingIndex, 1);
      }
      seen.set(keyValue, item);
      unique.push(item);
    }
  });
  
  return unique;
};

/**
 * PDF 메타데이터 추출
 */
export const extractPDFMetadata = async (pdf) => {
  try {
    console.log('📋 PDF 메타데이터 추출');
    
    const metadata = await pdf.getMetadata();
    const info = {
      title: '',
      author: '',
      subject: '',
      producer: '',
      creator: '',
      creationDate: null,
      modificationDate: null
    };
    
    if (metadata?.info) {
      const meta = metadata.info;
      info.title = meta.Title || '';
      info.author = meta.Author || '';
      info.subject = meta.Subject || '';
      info.producer = meta.Producer || '';
      info.creator = meta.Creator || '';
      info.creationDate = meta.CreationDate || null;
      info.modificationDate = meta.ModDate || null;
    }
    
    return info;
  } catch (error) {
    console.error('❌ 메타데이터 추출 실패:', error);
    return {
      title: '', author: '', subject: '', producer: '', 
      creator: '', creationDate: null, modificationDate: null
    };
  }
};

/**
 * 파일에서 직접 목차 추출
 */
export const extractFromPDFFile = async (file) => {
  try {
    console.log('📁 파일에서 목차 추출:', file.name);
    
    if (!file || file.type !== 'application/pdf') {
      throw new Error('유효한 PDF 파일이 아닙니다');
    }
    
    const pdf = await loadPDFDocumentWithRetry(file);
    const toc = await extractPDFTableOfContents(pdf);
    const metadata = await extractPDFMetadata(pdf);
    
    return {
      toc,
      metadata,
      numPages: pdf.numPages
    };
  } catch (error) {
    console.error('❌ 파일 목차 추출 실패:', error);
    throw error;
  }
};

/**
 * 디버깅용 PDF 구조 분석
 */
export const debugPDFStructure = async (pdf) => {
  try {
    console.log('🔍 PDF 구조 디버깅');
    console.log(`📄 총 페이지: ${pdf.numPages}`);
    
    // 북마크 체크
    try {
      const outline = await pdf.getOutline();
      console.log('🔖 북마크 상태:', {
        exists: !!outline,
        count: outline ? outline.length : 0
      });
    } catch (outlineError) {
      console.log('❌ 북마크 확인 실패:', outlineError.message);
    }
    
    // 첫 페이지 텍스트 샘플
    try {
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      console.log('📝 첫 페이지 텍스트:', {
        itemCount: textContent.items.length,
        sample: textContent.items.slice(0, 3).map(item => item.str).join(' ')
      });
    } catch (textError) {
      console.log('❌ 텍스트 확인 실패:', textError.message);
    }
    
  } catch (error) {
    console.error('❌ 구조 디버깅 실패:', error);
  }
};

const PDFTocExtractor = {
  extractPDFTableOfContents,
  extractPDFMetadata,
  extractFromPDFFile,
  debugPDFStructure
};

export default PDFTocExtractor;
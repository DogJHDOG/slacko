import { pdfjs } from 'react-pdf';
import { openDB } from 'idb';
import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { FileText } from 'lucide-react';

// react-pdf 내부의 pdfjs 사용 - 버전 불일치 방지
if (typeof window !== 'undefined') {
  // react-pdf 내부의 pdfjs 버전에 맞는 워커 사용
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  console.log('✅ PDF.js 워커 설정 완료: react-pdf 내부 버전 사용');
}

// IndexedDB 설정
const DB_NAME = 'TextbookDB';
const DB_VERSION = 3;
const PDF_STORE_NAME = 'pdfs';
const METADATA_STORE_NAME = 'pdfMetadata';

// IndexedDB 초기화
const initDB = async () => {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`IndexedDB 업그레이드: ${oldVersion} -> ${newVersion}`);
        
        // 기존 스토어가 있으면 삭제 후 재생성
        if (db.objectStoreNames.contains(PDF_STORE_NAME)) {
          db.deleteObjectStore(PDF_STORE_NAME);
        }
        if (db.objectStoreNames.contains(METADATA_STORE_NAME)) {
          db.deleteObjectStore(METADATA_STORE_NAME);
        }
        
        // 새로운 스토어 생성
        const pdfStore = db.createObjectStore(PDF_STORE_NAME, { keyPath: 'id' });
        const metadataStore = db.createObjectStore(METADATA_STORE_NAME, { keyPath: 'id' });
        
        // 인덱스 추가
        pdfStore.createIndex('name', 'name', { unique: false });
        pdfStore.createIndex('timestamp', 'timestamp', { unique: false });
        metadataStore.createIndex('title', 'title', { unique: false });
      }
    });
  } catch (error) {
    console.error('IndexedDB 초기화 실패:', error);
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(PDF_STORE_NAME, { keyPath: 'id' });
        db.createObjectStore(METADATA_STORE_NAME, { keyPath: 'id' });
      }
    });
  }
};

/**
 * PDF에서 목차(북마크) 정보 추출 - PDFTocExtractor 사용
 */
export const extractTableOfContents = async (pdf) => {
  try {
    console.log('📚 PDF 목차 추출 시작 (PDFTocExtractor 사용)');
    
    if (!pdf) {
      console.error('❌ PDF 객체가 없습니다');
      return [];
    }

    // PDFTocExtractor 모듈 사용
    const { extractPDFTableOfContents } = await import('./PDFTocExtractor');
    const toc = await extractPDFTableOfContents(pdf);
    
    console.log('✅ PDFTocExtractor로 목차 추출 완료:', toc.length, '개');
    return toc;
    
  } catch (error) {
    console.error('❌ PDF 목차 추출 실패:', error);
    return [];
  }
};

/**
 * PDF 파일을 IndexedDB에 저장합니다
 */
export const savePDFToIndexedDB = async (id, file) => {
  try {
    console.log(`📥 PDF 저장 시작: ${id}, 파일명: ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const db = await initDB();
    const tx = db.transaction([PDF_STORE_NAME], 'readwrite');
    const store = tx.objectStore(PDF_STORE_NAME);
    
    const pdfData = {
      id: id.toString(),
      data: arrayBuffer,
      type: file.type,
      name: file.name,
      size: file.size,
      timestamp: Date.now()
    };
    
    await store.put(pdfData);
    await tx.complete;
    
    console.log('✅ PDF 저장 완료:', id);
    return { success: true, id: id.toString() };
  } catch (error) {
    console.error('❌ PDF 저장 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * IndexedDB에서 PDF 파일을 로드합니다
 */
export const getPDFFromIndexedDB = async (id) => {
  try {
    console.log(`📤 PDF 로드 시도: ${id}`);
    
    const db = await initDB();
    const tx = db.transaction([PDF_STORE_NAME], 'readonly');
    const store = tx.objectStore(PDF_STORE_NAME);
    
    const saved = await store.get(id.toString());
    
    if (saved && saved.data) {
      const blob = new Blob([saved.data], { type: saved.type || 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ PDF 로드 완료:', saved.name, 'ID:', id);
      return blobUrl;
    } else {
      console.log('❌ 저장된 PDF 없음:', id);
      return null;
    }
  } catch (error) {
    console.error('❌ PDF 로드 실패:', error);
    return null;
  }
};

/**
 * PDF가 IndexedDB에 존재하는지 확인합니다
 */
export const checkPDFExists = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction([PDF_STORE_NAME], 'readonly');
    const store = tx.objectStore(PDF_STORE_NAME);
    
    const saved = await store.get(id.toString());
    const exists = !!(saved && saved.data);
    
    console.log(`🔍 PDF 존재 확인: ${id} -> ${exists ? '존재' : '없음'}`);
    return exists;
  } catch (error) {
    console.error('❌ PDF 존재 확인 실패:', error);
    return false;
  }
};

/**
 * PDF 메타데이터를 IndexedDB에 저장합니다
 */
export const savePDFMetadataToIndexedDB = async (id, metadata) => {
  try {
    const db = await initDB();
    const tx = db.transaction([METADATA_STORE_NAME], 'readwrite');
    const store = tx.objectStore(METADATA_STORE_NAME);
    
    const metadataEntry = {
      id: id.toString(),
      ...metadata,
      timestamp: Date.now()
    };
    
    await store.put(metadataEntry);
    await tx.complete;
    
    console.log('✅ PDF 메타데이터 저장 완료:', id);
    return true;
  } catch (error) {
    console.error('❌ PDF 메타데이터 저장 실패:', error);
    return false;
  }
};

/**
 * IndexedDB에서 PDF 메타데이터를 로드합니다
 */
export const getPDFMetadataFromIndexedDB = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction([METADATA_STORE_NAME], 'readonly');
    const store = tx.objectStore(METADATA_STORE_NAME);
    
    const result = await store.get(id.toString());
    
    if (result) {
      const { id: _id, timestamp, ...metadata } = result;
      console.log('✅ 메타데이터 로드 완료:', id);
      return metadata;
    } else {
      console.log('❌ 저장된 메타데이터 없음:', id);
      return null;
    }
  } catch (error) {
    console.error('❌ PDF 메타데이터 로드 실패:', error);
    return null;
  }
};

/**
 * 개선된 PDF 페이지 수 추출
 */
const getPageCount = async (file) => {
  console.log('PDF 페이지 수 추출 시작:', file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // react-pdf의 내부 pdfjs 사용
    try {
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        verbosity: 0,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
      });
      
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      console.log('✅ react-pdf로 추출한 페이지 수:', numPages);
      
      if (numPages && numPages > 0) {
        return numPages;
      }
    } catch (error) {
      console.log('react-pdf 페이지 수 추출 실패:', error.message);
    }
    
    // 방법 2: PDF 바이너리에서 직접 페이지 수 파싱
    try {
      const pageCount = await extractPageCountFromBinary(arrayBuffer);
      if (pageCount > 0) {
        console.log('✅ 바이너리에서 추출한 페이지 수:', pageCount);
        return pageCount;
      }
    } catch (error) {
      console.log('바이너리에서 페이지 수 추출 실패:', error.message);
    }
    
    // 방법 3: 파일명에서 페이지 수 추출
    const fileNamePages = extractPagesFromFileName(file.name);
    if (fileNamePages > 0) {
      console.log('✅ 파일명에서 추출한 페이지 수:', fileNamePages);
      return fileNamePages;
    }
    
    console.log('❌ 모든 방법으로 페이지 수 추출 실패');
    return 0;
    
  } catch (error) {
    console.error('페이지 수 추출 중 전체 오류:', error);
    const fileNamePages = extractPagesFromFileName(file.name);
    return fileNamePages || 0;
  }
};

/**
 * PDF 바이너리 데이터에서 직접 페이지 수를 추출합니다
 */
const extractPageCountFromBinary = async (arrayBuffer) => {
  const uint8Array = new Uint8Array(arrayBuffer);
  const text = new TextDecoder('latin1').decode(uint8Array);
  
  // PDF에서 페이지 수를 나타내는 패턴들
  const patterns = [
    /\/Type\s*\/Catalog[\s\S]*?\/Pages\s+\d+\s+\d+\s+R[\s\S]*?\/Count\s+(\d+)/gi,
    /\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/gi,
    /<<[^>]*\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/gi,
    /\/Count\s+(\d+)(?=\s|\/|>)/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const count = parseInt(match[1], 10);
      if (!isNaN(count) && count > 0 && count < 10000) {
        console.log(`바이너리 패턴 매치:`, count);
        return count;
      }
    }
  }
  
  return 0;
};

/**
 * 개선된 PDF 메타데이터 및 텍스트 분석
 */
export const analyzePDF = async (file, id = null) => {
  try {
    console.log('🔍 PDF 분석 시작:', file.name);
    
    // ID가 있고 기존 메타데이터가 있다면 사용
    if (id) {
      const cachedMetadata = await getPDFMetadataFromIndexedDB(id);
      if (cachedMetadata && cachedMetadata.pages > 0) {
        console.log('✅ 캐시된 메타데이터 사용:', cachedMetadata);
        return cachedMetadata;
      }
    }
    
    // 1. 먼저 페이지 수 추출
    let numPages = await getPageCount(file);
    console.log('📄 최종 추출된 페이지 수:', numPages);
    
    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer();
    
    // 기본 정보 객체 초기화
    const info = {
      title: '',
      author: '',
      publisher: '',
      pages: numPages
    };
    
    // 2. 파일명에서 먼저 기본 정보 추출
    const fileInfo = extractInfoFromFileName(file.name);
    info.title = fileInfo.title;
    info.author = fileInfo.author;
    info.publisher = fileInfo.publisher;
    console.log('📝 파일명에서 추출된 기본 정보:', fileInfo);
    
    // 3. PDF 메타데이터 및 텍스트 추출 시도
    try {
      let pdf = null;
      
      // react-pdf의 내부 pdfjs 사용
      try {
        console.log('PDF 로드 시도 (react-pdf 내부 pdfjs)');
        
        // 워커 초기화를 기다리는 지연 추가
        await new Promise(resolve => setTimeout(resolve, 500)); // 지연 시간을 500ms로 증가
        
        const loadingTask = pdfjs.getDocument({ 
          data: arrayBuffer,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
          verbosity: 0
        });
        
        pdf = await loadingTask.promise;
        console.log('✅ PDF 로드 성공 (react-pdf 내부 pdfjs)');
      } catch (error) {
        console.log('PDF 로드 실패:', error.message);
        throw error;
      }
      
      if (pdf) {
        // 페이지 수가 아직 없다면 여기서 추출
        if (!info.pages || info.pages <= 0) {
          info.pages = pdf.numPages || 0;
          console.log('📄 PDF 객체에서 페이지 수 추출:', info.pages);
        }
        
        // 메타데이터에서 정보 추출
        try {
          const metadata = await pdf.getMetadata();
          console.log('📋 메타데이터 추출:', metadata);
          
          if (metadata && metadata.info) {
            const metaInfo = metadata.info;
            
            // 제목 추출
            if (metaInfo.Title && metaInfo.Title.trim()) {
              const cleanTitle = cleanText(metaInfo.Title);
              if (cleanTitle.length > 3 && !isCommonSoftwareName(cleanTitle)) {
                info.title = cleanTitle;
                console.log('📖 메타데이터에서 제목 추출:', cleanTitle);
              }
            }
            
            // 저자 정보 추출
            const authorFromMetadata = extractAuthorFromMetadata(metaInfo);
            if (authorFromMetadata) {
              info.author = authorFromMetadata;
              console.log('✍️ 메타데이터에서 저자 추출:', authorFromMetadata);
            }
            
            // 출판사 정보 추출
            const publisherFromMetadata = extractPublisherFromMetadata(metaInfo);
            if (publisherFromMetadata) {
              info.publisher = publisherFromMetadata;
              console.log('🏢 메타데이터에서 출판사 추출:', publisherFromMetadata);
            }
          }
        } catch (metadataError) {
          console.log('메타데이터 추출 실패:', metadataError.message);
        }
        
        // 4. 첫 몇 페이지에서 텍스트 추출로 정보 보완
        if (info.pages > 0 && (!info.author || !info.publisher)) {
          try {
            console.log('📑 텍스트 추출로 정보 보완 시도');
            const textInfo = await extractInfoFromPages(pdf, Math.min(10, info.pages));
            
            if (!info.author && textInfo.author) {
              info.author = textInfo.author;
              console.log('✍️ 텍스트에서 저자 추출:', textInfo.author);
            }
            if (!info.publisher && textInfo.publisher) {
              info.publisher = textInfo.publisher;
              console.log('🏢 텍스트에서 출판사 추출:', textInfo.publisher);
            }
            if (!info.title || info.title === fileInfo.title) {
              if (textInfo.title) {
                info.title = textInfo.title;
                console.log('📖 텍스트에서 제목 추출:', textInfo.title);
              }
            }
          } catch (textError) {
            console.log('텍스트 추출 실패:', textError.message);
          }
        }
      }
    } catch (pdfError) {
      console.log('PDF 처리 실패:', pdfError.message);
      console.log('파일명에서 추출한 정보를 사용합니다.');
    }
    
    // 5. 최종 정보 정리 및 검증
    info.title = cleanAndValidateTitle(info.title) || fileInfo.title || file.name.replace(/\.[^/.]+$/, '');
    info.author = cleanAndValidateAuthor(info.author) || fileInfo.author || '';
    info.publisher = cleanAndValidatePublisher(info.publisher) || fileInfo.publisher || '';
    
    // 페이지 수 최종 확인
    if (!info.pages || info.pages <= 0) {
      console.log('페이지 수가 여전히 0, 파일명에서 최종 추출 시도');
      const fileNamePages = extractPagesFromFileName(file.name);
      if (fileNamePages > 0) {
        info.pages = fileNamePages;
      }
    }
    
    // 6. 메타데이터를 IndexedDB에 저장 (ID가 있는 경우)
    if (id) {
      await savePDFMetadataToIndexedDB(id, info);
    }
    
    // 최종 결과 로그
    console.log('=== PDF 분석 최종 결과 ===');
    console.log('파일명:', file.name);
    console.log('제목:', info.title);
    console.log('저자:', info.author || '추출 실패');
    console.log('출판사:', info.publisher || '추출 실패');
    console.log('페이지 수:', info.pages);
    console.log('========================');
    
    return info;
    
  } catch (error) {
    console.error('❌ PDF 분석 중 오류 발생:', error);
    
    // 오류 발생 시 최소한의 정보라도 반환
    const fallbackInfo = extractInfoFromFileName(file.name);
    const fileNamePages = extractPagesFromFileName(file.name);
    const result = {
      title: fallbackInfo.title || file.name.replace(/\.[^/.]+$/, ''),
      author: fallbackInfo.author || '',
      publisher: fallbackInfo.publisher || '',
      pages: fileNamePages || 0
    };
    
    // ID가 있으면 fallback 정보도 저장
    if (id) {
      await savePDFMetadataToIndexedDB(id, result);
    }
    
    return result;
  }
};

/**
 * PDF의 여러 페이지에서 텍스트를 추출하여 정보를 찾습니다
 */
const extractInfoFromPages = async (pdf, maxPages = 10) => {
  const info = { title: '', author: '', publisher: '' };
  
  const pagesToCheck = [1, 2, 3, 4, 5].slice(0, Math.min(maxPages, 5));
  let allText = '';
  
  for (const pageNum of pagesToCheck) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .sort((a, b) => {
          // Y 좌표로 먼저 정렬 (위에서 아래로)
          if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
            return b.transform[5] - a.transform[5];
          }
          // 같은 줄이면 X 좌표로 정렬 (왼쪽에서 오른쪽으로)
          return a.transform[4] - b.transform[4];
        })
        .map(item => item.str)
        .join(' ');
      
      allText += `[PAGE_${pageNum}] ${pageText}\n\n`;
    } catch (error) {
      console.log(`페이지 ${pageNum} 텍스트 추출 실패:`, error.message);
    }
  }
  
  if (allText) {
    return extractInfoFromAllText(allText);
  }
  
  return info;
};

/**
 * 전체 텍스트에서 정보를 추출합니다
 */
const extractInfoFromAllText = (allText) => {
  const info = { title: '', author: '', publisher: '' };
  
  // 개선된 패턴들
  const patterns = {
    // 저자 패턴들
    author: [
      /(?:by|author|written\s+by|edited\s+by)[:\s]+([A-Z][a-zA-Z\s,.-]{3,50})/gi,
      /([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?)*\s+[A-Z][a-zA-Z]+)(?:\s+and\s+[A-Z][a-zA-Z\s.]+)?/g,
      /Dr\.?\s+([A-Z][a-zA-Z\s.-]{3,30})/gi,
      /Professor\s+([A-Z][a-zA-Z\s.-]{3,30})/gi,
      /([A-Z][a-zA-Z]+,\s*[A-Z]\.(?:\s*[A-Z]\.)*)/g,
      // 한국어 패턴
      /(?:저자|작성자|지은이|글쓴이)[:\s]*([가-힣\s]{2,20})/g,
      /([가-힣]{2,4})\s*(?:지음|저|편집|역|글|씀)/g,
    ],
    
    // 출판사 패턴들
    publisher: [
      /(?:published\s+by|publisher|publishing\s+house)[:\s]+([A-Z][a-zA-Z\s&.-]+(?:Press|Publishing|Publishers|Books|Inc\.?|Ltd\.?|University|Corporation|Corp\.?|House))/gi,
      // 유명 출판사들
      /(MIT\s+Press|Cambridge\s+University\s+Press|Oxford\s+University\s+Press|Harvard\s+University\s+Press|Princeton\s+University\s+Press|Yale\s+University\s+Press|Stanford\s+University\s+Press|University\s+of\s+Chicago\s+Press|Springer(?:\s*-?\s*Verlag)?|Wiley(?:\s*-?\s*Blackwell)?|Elsevier|Pearson(?:\s+Education)?|McGraw(?:\s*-?\s*Hill)?|Addison(?:\s*-?\s*Wesley)?|Prentice(?:\s+Hall)?|Academic\s+Press|IEEE\s+Press|ACM\s+Press|O'Reilly(?:\s+Media)?|Manning(?:\s+Publications)?|Packt(?:\s+Publishing)?|Apress|Wrox|Sams(?:\s+Publishing)?|Que(?:\s+Publishing)?)/gi,
      /([A-Z][a-zA-Z\s&.-]+(?:Press|Publishing|Publishers|Books|Inc\.?|Ltd\.?|Corporation|Corp\.?|University\s+Press|House))/g,
      /©\s*(?:19|20)\d{2}\s*(?:by\s+)?([A-Z][a-zA-Z\s&.-]+)/g,
      /Copyright\s+(?:19|20)\d{2}\s*(?:by\s+)?([A-Z][a-zA-Z\s&.-]+)/gi,
      // 한국어 패턴
      /(?:출판사|발행처|발행인|출판|발행)[:\s]*([가-힣\s]{2,20})/g,
      /([가-힣\s]{2,20})\s*(?:출판사|출판|발행)/g,
    ],
    
    // 제목 패턴들
    title: [
      /\[PAGE_1\]\s*([A-Z][A-Za-z\s:.-]{10,100}?)(?:\n|\r|$)/,
      /^([A-Z][A-Za-z\s:.-]{10,100}?)$/m,
      /TITLE[:\s]*([A-Za-z\s:.-]+)/gi,
    ]
  };
  
  // 각 패턴으로 정보 추출 (점수 기반 시스템)
  const candidates = { title: [], author: [], publisher: [] };
  
  for (const [type, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const matches = [...allText.matchAll(pattern)];
      for (const match of matches) {
        const extracted = cleanText(match[1]);
        if (extracted && isValidExtraction(extracted, type)) {
          let score = 1;
          
          // 특정 키워드가 포함된 패턴은 더 높은 점수
          if (type === 'author' && /(?:by|author|written)/i.test(match[0])) {
            score += 3;
          }
          if (type === 'publisher' && /(?:published|copyright|press)/i.test(match[0])) {
            score += 3;
          }
          if (type === 'title' && match[0].includes('[PAGE_1]')) {
            score += 2;
          }
          
          // 길이에 따른 가중치
          if (type === 'title' && extracted.length > 20 && extracted.length < 80) {
            score += 1;
          }
          if (type === 'author' && extracted.length > 5 && extracted.length < 40) {
            score += 1;
          }
          
          candidates[type].push({ text: extracted, score });
        }
      }
    }
  }
  
  // 가장 높은 점수의 후보 선택
  for (const [type, candidateList] of Object.entries(candidates)) {
    if (candidateList.length > 0) {
      candidateList.sort((a, b) => b.score - a.score);
      info[type] = candidateList[0].text;
      console.log(`${type} 최고 점수 후보:`, candidateList[0]);
    }
  }
  
  return info;
};

/**
 * 추출된 정보가 유효한지 검증합니다
 */
const isValidExtraction = (text, type) => {
  if (!text || text.length < 2) return false;
  
  const commonInvalidWords = ['page', 'chapter', 'section', 'table', 'figure', 'contents', 'index', 'preface', 'abstract'];
  const lowerText = text.toLowerCase();
  
  if (commonInvalidWords.some(word => lowerText.includes(word))) {
    return false;
  }
  
  switch (type) {
    case 'title':
      return text.length >= 5 && text.length <= 150 && !/^\d+$/.test(text) && !/^[^a-zA-Z가-힣]*$/.test(text);
    case 'author':
      return isValidAuthorName(text);
    case 'publisher':
      return isValidPublisherName(text);
    default:
      return true;
  }
};

/**
 * 메타데이터에서 저자 정보를 추출합니다
 */
const extractAuthorFromMetadata = (metadata) => {
  if (!metadata) return '';
  
  const authorFields = ['Author', 'Creator', 'Subject', 'Keywords'];
  
  for (const field of authorFields) {
    if (metadata[field] && metadata[field].trim()) {
      const fieldValue = metadata[field].trim();
      
      if (!isCommonSoftwareName(fieldValue)) {
        const cleanedValue = cleanText(fieldValue);
        if (isValidAuthorName(cleanedValue)) {
          return cleanedValue;
        }
      }
    }
  }
  
  return '';
};

/**
 * 메타데이터에서 출판사 정보를 추출합니다
 */
const extractPublisherFromMetadata = (metadata) => {
  if (!metadata) return '';
  
  const publisherFields = ['Producer', 'Creator', 'Keywords', 'Subject'];
  
  for (const field of publisherFields) {
    if (metadata[field] && metadata[field].trim()) {
      const fieldValue = metadata[field].trim();
      
      if (isPossiblePublisherName(fieldValue)) {
        const cleanedValue = cleanText(fieldValue);
        if (isValidPublisherName(cleanedValue)) {
          return cleanedValue;
        }
      }
    }
  }
  
  return '';
};

/**
 * 텍스트를 정리합니다
 */
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s&.,-가-힣]/g, '')
    .trim();
};

/**
 * 제목을 정리하고 검증합니다
 */
const cleanAndValidateTitle = (title) => {
  if (!title) return '';
  const cleaned = cleanText(title);
  return cleaned.length >= 3 && cleaned.length <= 200 ? cleaned : '';
};

/**
 * 저자를 정리하고 검증합니다
 */
const cleanAndValidateAuthor = (author) => {
  if (!author) return '';
  const cleaned = cleanText(author);
  return cleaned.length >= 2 && cleaned.length <= 100 && /[A-Za-z가-힣]/.test(cleaned) ? cleaned : '';
};

/**
 * 출판사를 정리하고 검증합니다
 */
const cleanAndValidatePublisher = (publisher) => {
  if (!publisher) return '';
  const cleaned = cleanText(publisher);
  return cleaned.length >= 2 && cleaned.length <= 100 && /[A-Za-z가-힣]/.test(cleaned) ? cleaned : '';
};

/**
 * 소프트웨어 이름인지 확인합니다
 */
const isCommonSoftwareName = (text) => {
  const softwareNames = [
    'adobe', 'acrobat', 'microsoft', 'word', 'excel', 'powerpoint', 'latex', 'tex',
    'pdflatex', 'xelatex', 'lualatex', 'pandoc', 'libreoffice', 'openoffice',
    'pages', 'keynote', 'google', 'docs', 'drive', 'dropbox', 'itext', 'fpdf',
    'wkhtmltopdf', 'prince', 'weasyprint', 'reportlab', 'tcpdf', 'dompdf'
  ];
  
  const lowerText = text.toLowerCase();
  return softwareNames.some(name => lowerText.includes(name));
};

/**
 * 가능한 출판사 이름인지 확인합니다
 */
const isPossiblePublisherName = (text) => {
  if (!text || text.length < 3 || text.length > 100) return false;
  
  const publisherKeywords = [
    'press', 'publishing', 'publishers', 'books', 'inc', 'ltd', 'corporation',
    'corp', 'university', 'college', 'academic', 'media', 'house', '출판', '발행'
  ];
  
  const lowerText = text.toLowerCase();
  if (publisherKeywords.some(keyword => lowerText.includes(keyword))) {
    return true;
  }
  
  const famousPublishers = [
    'springer', 'wiley', 'elsevier', 'pearson', 'mcgraw', 'cambridge', 'oxford',
    'mit', 'harvard', 'princeton', 'yale', 'stanford', 'chicago', 'routledge',
    'sage', 'taylor', 'francis', 'palgrave', 'macmillan', 'penguin', 'random'
  ];
  
  return famousPublishers.some(pub => lowerText.includes(pub));
};

/**
 * 유효한 저자 이름인지 확인합니다
 */
const isValidAuthorName = (text) => {
  if (!text || text.length < 2 || text.length > 100) return false;
  
  if (!/[A-Za-z가-힣]/.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  if (isCommonSoftwareName(text)) return false;
  
  const invalidAuthorWords = [
    'page', 'chapter', 'section', 'table', 'figure', 'contents', 'index',
    'introduction', 'preface', 'appendix', 'references', 'bibliography',
    'copyright', 'rights', 'reserved', 'isbn', 'edition', 'version', 'download',
    'file', 'document', 'text', 'book'
  ];
  
  const lowerText = text.toLowerCase();
  if (invalidAuthorWords.some(word => lowerText.includes(word))) {
    return false;
  }
  
  return true;
};

/**
 * 유효한 출판사 이름인지 확인합니다
 */
const isValidPublisherName = (text) => {
  if (!text || text.length < 2 || text.length > 100) return false;
  
  if (!/[A-Za-z가-힣]/.test(text)) return false;
  if (/^\d+$/.test(text)) return false;
  
  const invalidPublisherWords = [
    'author', 'editor', 'chapter', 'page', 'table', 'figure', 'student',
    'professor', 'doctor', 'introduction', 'preface', 'download', 'file'
  ];
  
  const lowerText = text.toLowerCase();
  if (invalidPublisherWords.some(word => lowerText.includes(word))) {
    return false;
  }
  
  return true;
};

/**
 * 개선된 파일명에서 정보 추출
 */
export const extractInfoFromFileName = (fileName) => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  console.log('📁 파일명 분석 시작:', nameWithoutExt);
  
  // 특별한 패턴들 (정확도 높은 순서로 배치)
  const specialPatterns = [
    // "제목-저자-출판사-년도" 형태
    /^(.+?)-(.+?)-(.+?)-(\d{4})$/,
    // "저자-제목(년도,출판사)" 형태
    /^(.+?)-(.+?)\s*\((\d{4}),\s*(.+?)\)$/,
    // "제목 - 저자 - 출판사" 형태
    /^(.+?)\s*-\s*(.+?)\s*-\s*(.+?)$/,
    // "제목 (저자) 출판사" 형태
    /^(.+?)\s*\(([^)]+)\)\s*(.+?)$/,
    // "제목 (저자)" 형태  
    /^(.+?)\s*\(([^)]+)\)$/,
    // "저자 - 제목" 형태
    /^([A-Z][a-zA-Z\s]+)\s*-\s*(.+)$/,
    // "제목 by 저자" 형태
    /^(.+?)\s+by\s+([A-Z][a-zA-Z\s]+)$/i,
  ];
  
  for (let i = 0; i < specialPatterns.length; i++) {
    const pattern = specialPatterns[i];
    const match = nameWithoutExt.match(pattern);
    if (match) {
      console.log(`✅ 특별 패턴 ${i + 1} 매치:`, match);
      switch (i) {
        case 0: // 제목-저자-출판사-년도
          return {
            title: cleanText(match[1]),
            author: cleanText(match[2]),
            publisher: cleanText(match[3]),
            pages: 0
          };
        case 1: // 저자-제목(년도,출판사)
          return {
            title: cleanText(match[2]),
            author: cleanText(match[1]),
            publisher: cleanText(match[4]),
            pages: 0
          };
        case 2: // 제목 - 저자 - 출판사
          return {
            title: cleanText(match[1]),
            author: cleanText(match[2]),
            publisher: cleanText(match[3]),
            pages: 0
          };
        case 3: // 제목 (저자) 출판사
          return {
            title: cleanText(match[1]),
            author: cleanText(match[2]),
            publisher: cleanText(match[3]),
            pages: 0
          };
        case 4: // 제목 (저자)
          return {
            title: cleanText(match[1]),
            author: cleanText(match[2]),
            publisher: '',
            pages: 0
          };
        case 5: // 저자 - 제목
          return {
            title: cleanText(match[2]),
            author: cleanText(match[1]),
            publisher: '',
            pages: 0
          };
        case 6: // 제목 by 저자
          return {
            title: cleanText(match[1]),
            author: cleanText(match[2]),
            publisher: '',
            pages: 0
          };
        default:
          return {
            title: nameWithoutExt,
            author: '',
            publisher: '',
            pages: 0
          };
      }
    }
  }
  
  // 패턴 매치 실패 시 기본값 반환
  return {
    title: nameWithoutExt,
    author: '',
    publisher: '',
    pages: 0
  };
};

/**
 * 파일명에서 페이지 수를 추출합니다
 */
export const extractPagesFromFileName = (fileName) => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  const pagePatterns = [
    /(\d+)\s*pages?\b/i,
    /pages?\s*(\d+)\b/i,
    /pp?\.\s*(\d+)\b/i,
    /-(\d+)p\b/i,
    /_(\d+)p\b/i,
    /\b(\d+)p\b/i,
    /총\s*(\d+)\s*페이지/i,
    /(\d+)\s*페이지/i,
  ];
  
  for (const pattern of pagePatterns) {
    const match = nameWithoutExt.match(pattern);
    if (match && match[1]) {
      const pages = parseInt(match[1], 10);
      if (!isNaN(pages) && pages > 0 && pages <= 9999) {
        console.log(`📄 파일명에서 페이지 수 추출:`, pages);
        return pages;
      }
    }
  }
  
  return 0;
};

/**
 * PDF 파일인지 확인합니다
 */
export const isPDFFile = (file) => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * IndexedDB를 완전히 초기화합니다
 */
export const resetIndexedDB = async () => {
  try {
    console.log('🔄 IndexedDB 완전 초기화 시작...');
    
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        console.log('✅ 기존 IndexedDB 삭제 완료');
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ IndexedDB 삭제 실패:', deleteRequest.error);
        reject(deleteRequest.error);
      };
      
      deleteRequest.onblocked = () => {
        console.warn('⚠️ IndexedDB 삭제가 차단됨 (다른 탭에서 사용 중)');
        reject(new Error('IndexedDB 삭제가 차단됨'));
      };
    });
  } catch (error) {
    console.error('❌ IndexedDB 초기화 실패:', error);
    return false;
  }
};

/**
 * IndexedDB에서 모든 PDF 목록을 가져옵니다
 */
export const getAllPDFsFromIndexedDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction([PDF_STORE_NAME], 'readonly');
    const store = tx.objectStore(PDF_STORE_NAME);
    
    const result = await store.getAll();
    return result || [];
  } catch (error) {
    console.error('PDF 목록 로드 실패:', error);
    return [];
  }
};

/**
 * IndexedDB에서 PDF를 삭제합니다
 */
export const deletePDFFromIndexedDB = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction([PDF_STORE_NAME, METADATA_STORE_NAME], 'readwrite');
    
    await tx.objectStore(PDF_STORE_NAME).delete(id.toString());
    await tx.objectStore(METADATA_STORE_NAME).delete(id.toString());
    
    await tx.complete;
    
    console.log('✅ PDF 삭제 완료:', id);
    return true;
  } catch (error) {
    console.error('❌ PDF 삭제 실패:', error);
    return false;
  }
};

/**
 * 고아 청크 데이터를 정리합니다
 */
export const cleanupOrphanedChunks = () => {
  let deletedCount = 0;
  
  try {
    // 로컬 스토리지에서 textbooks 데이터 가져오기
    const textbooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
    const validIds = new Set(textbooks.map(book => book.id.toString()));
    
    // IndexedDB에서 모든 PDF 데이터 가져오기
    getAllPDFsFromIndexedDB().then(pdfs => {
      pdfs.forEach(pdf => {
        if (!validIds.has(pdf.id)) {
          deletePDFFromIndexedDB(pdf.id);
          deletedCount++;
        }
      });
    });
    
    return deletedCount;
  } catch (error) {
    console.error('고아 청크 정리 실패:', error);
    return 0;
  }
};

/**
 * PDF 썸네일 컴포넌트
 * 원서 상세 페이지에서 PDF 미리보기를 위한 컴포넌트
 */
export const PdfThumbnail = ({ pdfId, width = 192, height = 256, className = "" }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPdfThumbnail = async () => {
      if (!pdfId) {
        setError('PDF ID가 없습니다');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // PDF 파일이 존재하는지 확인
        const exists = await checkPDFExists(pdfId);
        if (!exists) {
          throw new Error('PDF 파일을 찾을 수 없습니다');
        }

        // PDF URL 가져오기
        const url = await getPDFFromIndexedDB(pdfId);
        if (url) {
          setPdfUrl(url);
        } else {
          throw new Error('PDF URL을 가져올 수 없습니다');
        }
      } catch (err) {
        console.error('PDF 썸네일 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPdfThumbnail();

    // cleanup은 별도 useEffect에서 처리
    return () => {
      // cleanup은 별도 useEffect에서 처리
    };
  }, [pdfId]);

  // PDF URL cleanup을 위한 별도 useEffect
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // 로딩 상태
  if (loading) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !pdfUrl) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">썸네일 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ width, height }}>
      <Document
        file={pdfUrl}
        loading={
          <div 
            className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-xl"
            style={{ width, height }}
          >
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">로딩 중...</p>
            </div>
          </div>
        }
        error={
          <div 
            className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-xl"
            style={{ width, height }}
          >
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">썸네일 오류</p>
            </div>
          </div>
        }
        options={{
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        }}
      >
        <Page
          pageNumber={1}
          width={width}
          height={height}
          loading={
            <div 
              className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-xl"
              style={{ width, height }}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">페이지 로딩...</p>
              </div>
            </div>
          }
          error={
            <div 
              className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-xl"
              style={{ width, height }}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">페이지 오류</p>
              </div>
            </div>
          }
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="rounded-xl"
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: 'none'
          }}
        />
      </Document>
    </div>
  );
};

/**
 * 디버깅을 위한 PDF 텍스트 덤프 함수 (개발용)
 */
export const debugPdfTextStructure = async (pdf, maxPages = 5) => {
  console.log('🔍 PDF 텍스트 구조 디버깅 시작');
  
  for (let pageNum = 1; pageNum <= Math.min(maxPages, pdf.numPages); pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      console.log(`\n=== 페이지 ${pageNum} ===`);
      
      textContent.items.forEach((item, index) => {
        const fontSize = Math.abs(item.transform[0]);
        const isBold = (item.fontName || '').toLowerCase().includes('bold');
        
        console.log(`[${index}] "${item.str}" | 크기:${fontSize} | 폰트:${item.fontName} | Bold:${isBold}`);
      });
    } catch (error) {
      console.error(`페이지 ${pageNum} 디버깅 실패:`, error);
    }
  }
};

// PDFTocExtractor의 함수들을 재내보내기 (편의성을 위해)
export const extractFromPDFFile = async (file) => {
  const { extractFromPDFFile } = await import('./PDFTocExtractor');
  return extractFromPDFFile(file);
};

export const debugPDFStructure = async (pdf) => {
  const { debugPDFStructure } = await import('./PDFTocExtractor');
  return debugPDFStructure(pdf);
};
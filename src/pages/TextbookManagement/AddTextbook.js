import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Target, Brain, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import FileUpload from '../../components/common/FileUpload';
import AIPlanGenerator from '../../components/plan/AIPlanGenerator';
import Toast from '../../components/common/Toast';
import { 
  savePDFToIndexedDB, 
  analyzePDF, 
  isPDFFile 
} from '../../utils/pdfAnalyzer';

export default function AddTextbook() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // 파일 및 분석 상태
  const [bookFile, setBookFile] = useState(null);
  const [savedPdfId, setSavedPdfId] = useState(null); // 저장된 PDF ID 추적
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    totalPages: '',
    startDate: '',
    endDate: '',
    purpose: '',
    intensity: '보통',
    // 추가 메타데이터
    subject: '',
    tableOfContents: []
  });
  
  const [planTasks, setPlanTasks] = useState([]);
  const [daysLeft, setDaysLeft] = useState(null);

  // 학습 강도 옵션
  const intensityOptions = ['낮음', '보통', '높음'];

  // 개선된 학습 계획 생성 함수
  const generateStudyPlan = (tasks, startDate, endDate, intensity) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const plan = [];
    let currentDate = new Date(start);
    
    // 강도에 따른 일일 할당량 조정
    const intensityMultiplier = {
      '낮음': 0.7,
      '보통': 1.0,
      '높음': 1.5
    };
    
    const multiplier = intensityMultiplier[intensity] || 1.0;
    const adjustedTasksPerDay = Math.max(1, Math.ceil((tasks.length / daysDiff) * multiplier));
    
    // 작업을 날짜별로 분배
    for (let i = 0; i < tasks.length; i += adjustedTasksPerDay) {
      const dayTasks = tasks.slice(i, i + adjustedTasksPerDay);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      dayTasks.forEach((task, taskIndex) => {
        plan.push({
          id: `plan-${dateStr}-${taskIndex}`,
          chapter: task.title || `${task.week}주차 학습`,
          description: task.description || task.task || task.memo || '',
          date: dateStr,
          completed: false,
          createdAt: new Date().toISOString(),
          intensity: intensity,
          estimatedTime: getEstimatedTime(intensity),
          priority: taskIndex === 0 ? 'high' : 'normal'
        });
      });
      
      // 다음 날로 이동 (주말 제외하고 싶다면 여기서 처리)
      currentDate.setDate(currentDate.getDate() + 1);
      
      // 종료일을 넘지 않도록 체크
      if (currentDate > end) break;
    }
    
    return plan;
  };

  // 강도별 예상 학습 시간 계산
  const getEstimatedTime = (intensity) => {
    const timeMap = {
      '낮음': 60, // 1시간
      '보통': 90, // 1.5시간
      '높음': 120 // 2시간
    };
    return timeMap[intensity] || 90;
  };

  // PDF 분석 함수
  const analyzePDFFile = useCallback(async (file) => {
    setIsAnalyzing(true);
    setAnalysisProgress('PDF 파일 읽는 중...');
    
    try {
      // 고유한 ID 생성
      const tempId = `temp_${Date.now()}`;
      console.log('🔍 PDF 분석 시작, ID:', tempId);
      
      setAnalysisProgress('PDF 메타데이터 분석 중...');
      
      // PDF를 IndexedDB에 저장
      const saveResult = await savePDFToIndexedDB(tempId, file);
      if (saveResult.success) {
        console.log('📥 PDF 저장 성공, ID:', saveResult.id);
        setSavedPdfId(saveResult.id); // 저장된 ID 추적
      } else {
        console.error('❌ PDF 저장 실패:', saveResult.error);
        setAnalysisError('PDF 저장 중 오류가 발생했습니다.');
        return;
      }
      
      // PDF 분석 실행
      const analysisResult = await analyzePDF(file, tempId);
      
      console.log('PDF 분석 결과:', analysisResult);
      
      // 분석 결과를 폼 데이터에 적용
      setFormData(prev => ({
        ...prev,
        title: analysisResult.title || prev.title,
        author: analysisResult.author || prev.author,
        publisher: analysisResult.publisher || prev.publisher,
        totalPages: analysisResult.pages ? analysisResult.pages.toString() : prev.totalPages,
        subject: analysisResult.subject || prev.subject,
        tableOfContents: analysisResult.tableOfContents || prev.tableOfContents
      }));
      
      setAnalysisComplete(true);
      setAnalysisProgress('분석 완료!');
      
      // 성공 메시지 표시
      const extractedInfo = [];
      if (analysisResult.title) extractedInfo.push('제목');
      if (analysisResult.author) extractedInfo.push('저자');
      if (analysisResult.publisher) extractedInfo.push('출판사');
      if (analysisResult.pages) extractedInfo.push('페이지 수');
      
      if (extractedInfo.length > 0) {
        setToastMessage(`${extractedInfo.join(', ')} 정보가 자동으로 추출되었습니다.`);
        setToastType('success');
        setShowToast(true);
      }

    } catch (error) {
      console.error('PDF 분석 실패:', error);
      setAnalysisError('PDF 분석 중 오류가 발생했습니다. 수동으로 정보를 입력해주세요.');
      
      // 파일명에서 기본 정보 추출 시도
      const fileInfo = extractInfoFromFileName(file.name);
      setFormData(prev => ({
        ...prev,
        title: fileInfo.title || prev.title,
        author: fileInfo.author || prev.author,
        publisher: fileInfo.publisher || prev.publisher
      }));
      
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 파일 변경 및 분석 핸들러
  const handleFileChange = useCallback(async (file) => {
    if (!file) {
      setBookFile(null);
      setSavedPdfId(null); // PDF ID도 초기화
      setAnalysisComplete(false);
      setAnalysisError('');
      // 폼 데이터 초기화
      setFormData(prev => ({
        ...prev,
        title: '',
        author: '',
        publisher: '',
        totalPages: '',
        subject: '',
        tableOfContents: []
      }));
      return;
    }

    // PDF 파일 검증
    if (!isPDFFile(file)) {
      setToastMessage('PDF 파일만 업로드할 수 있습니다.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // 파일 크기 검증 (100MB 제한)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setToastMessage('파일 크기가 너무 큽니다. 100MB 이하의 파일을 선택해주세요.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setBookFile(file);
    setAnalysisComplete(false);
    setAnalysisError('');
    
    // PDF 분석 시작
    await analyzePDFFile(file);
  }, [analyzePDFFile]);

  

  // 파일명에서 정보 추출 (fallback)
  const extractInfoFromFileName = (fileName) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // 특별한 패턴들
    const patterns = [
      /^(.+?)-(.+?)-(.+?)-(\d{4})$/,
      /^(.+?)-(.+?)\s*\((\d{4}),\s*(.+?)\)$/,
      /^(.+?)\s*-\s*(.+?)\s*-\s*(.+?)$/,
      /^(.+?)\s*\(([^)]+)\)\s*(.+?)$/,
      /^(.+?)\s*\(([^)]+)\)$/,
      /^([A-Z][a-zA-Z\s]+)\s*-\s*(.+)$/,
      /^(.+?)\s+by\s+([A-Z][a-zA-Z\s]+)$/i,
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = nameWithoutExt.match(pattern);
      if (match) {
        switch (i) {
          case 0: // 제목-저자-출판사-년도
            return {
              title: match[1].trim(),
              author: match[2].trim(),
              publisher: match[3].trim()
            };
          case 1: // 저자-제목(년도,출판사)
            return {
              title: match[2].trim(),
              author: match[1].trim(),
              publisher: match[4].trim()
            };
          case 2: // 제목 - 저자 - 출판사
            return {
              title: match[1].trim(),
              author: match[2].trim(),
              publisher: match[3].trim()
            };
          case 3: // 제목 (저자) 출판사
            return {
              title: match[1].trim(),
              author: match[2].trim(),
              publisher: match[3].trim()
            };
          case 4: // 제목 (저자)
            return {
              title: match[1].trim(),
              author: match[2].trim(),
              publisher: ''
            };
          case 5: // 저자 - 제목
            return {
              title: match[2].trim(),
              author: match[1].trim(),
              publisher: ''
            };
          case 6: // 제목 by 저자
            return {
              title: match[1].trim(),
              author: match[2].trim(),
              publisher: ''
            };
          default:
            return {
              title: nameWithoutExt,
              author: '',
              publisher: ''
            };
        }
      }
    }
    
    return {
      title: nameWithoutExt,
      author: '',
      publisher: ''
    };
  };

  // 날짜 변경 핸들러
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 남은 일수 계산
    if (name === 'endDate' && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(value);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setDaysLeft(diff);
    } else if (name === 'startDate' && formData.endDate) {
      const start = new Date(value);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setDaysLeft(diff);
    }
  };

  // 플랜 생성 핸들러 (개선된 버전)
  const handleGeneratePlan = () => {
    // 목차 기반 플랜 생성
    if (formData.tableOfContents && formData.tableOfContents.length > 0) {
      const chapterPlans = formData.tableOfContents.slice(0, 20).map((chapter, index) => ({
        week: Math.ceil((index + 1) / 2),
        title: chapter.title || `Chapter ${chapter.number}`,
        description: `${chapter.title} 학습 및 정리`,
        task: `${chapter.title} 읽기 및 핵심 개념 정리`,
        memo: `페이지 ${chapter.page || 'N/A'}부터 시작`,
        done: false
      }));
      setPlanTasks(chapterPlans);
      return;
    }

    // 페이지 기반 플랜 생성
    const totalPages = parseInt(formData.totalPages) || 100;
    const samplePlans = {
      '낮음': [
        { week: 1, title: '1~2장 기초 학습', task: '1~2장 읽기 및 핵심 개념 정리', date: '', done: false, memo: '천천히 이해하며 읽기', pages: Math.ceil(totalPages * 0.15) },
        { week: 2, title: '3~4장 심화 학습', task: '3~4장 읽기 및 예제 풀이', date: '', done: false, memo: '실습 위주로 학습', pages: Math.ceil(totalPages * 0.25) },
        { week: 3, title: '5~6장 응용 학습', task: '5~6장 읽기 및 복습', date: '', done: false, memo: '이전 내용과 연결', pages: Math.ceil(totalPages * 0.3) },
        { week: 4, title: '종합 정리', task: '전체 내용 복습 및 정리', date: '', done: false, memo: '핵심 개념 정리', pages: Math.ceil(totalPages * 0.3) },
      ],
      '보통': [
        { week: 1, title: '1~3장 기초 확립', task: '1~3장 읽기 및 개념 정리', date: '', done: false, memo: '기초 개념 확립', pages: Math.ceil(totalPages * 0.25) },
        { week: 2, title: '4~6장 이론 학습', task: '4~6장 읽기 및 문제풀이', date: '', done: false, memo: '실습과 이론 병행', pages: Math.ceil(totalPages * 0.25) },
        { week: 3, title: '7~9장 심화 학습', task: '7~9장 읽기 및 복습', date: '', done: false, memo: '전체적인 흐름 파악', pages: Math.ceil(totalPages * 0.25) },
        { week: 4, title: '10~12장 완성', task: '10~12장 읽기 및 심화 학습', date: '', done: false, memo: '심화 개념 도전', pages: Math.ceil(totalPages * 0.25) },
      ],
      '높음': [
        { week: 1, title: '1~5장 집중 학습', task: '1~5장 읽기 및 개념 정리', date: '', done: false, memo: '빠른 진도로 기초 확립', pages: Math.ceil(totalPages * 0.2) },
        { week: 2, title: '6~10장 심화', task: '6~10장 읽기 및 문제풀이', date: '', done: false, memo: '실습과 이론 병행', pages: Math.ceil(totalPages * 0.2) },
        { week: 3, title: '11~15장 고급', task: '11~15장 읽기 및 심화 학습', date: '', done: false, memo: '고급 개념 도전', pages: Math.ceil(totalPages * 0.2) },
        { week: 4, title: '16~20장 완성', task: '16~20장 읽기 및 종합 복습', date: '', done: false, memo: '전체 내용 통합', pages: Math.ceil(totalPages * 0.2) },
        { week: 5, title: '최종 정리', task: '전체 복습 및 실전 연습', date: '', done: false, memo: '실전 문제 풀이', pages: Math.ceil(totalPages * 0.2) },
      ],
    };
    setPlanTasks(samplePlans[formData.intensity] || samplePlans['보통']);
  };

  // 저장 핸들러 (개선된 버전)
  const handleSave = async () => {
    if (!bookFile || !formData.title || !formData.totalPages || !formData.startDate || !formData.endDate || !formData.purpose || planTasks.length === 0) {
      setToastMessage('모든 필드와 플랜을 입력해주세요!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!savedPdfId) {
      setToastMessage('PDF 파일이 저장되지 않았습니다. 파일을 다시 업로드해주세요.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      // 학습 계획 생성 (개선된 버전)
      const studyPlan = generateStudyPlan(planTasks, formData.startDate, formData.endDate, formData.intensity);

      const newBook = {
        id: Date.now(),
        pdfId: savedPdfId, // 저장된 PDF ID 포함
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        totalPages: parseInt(formData.totalPages),
        currentPage: 1,
        targetDate: formData.endDate,
        status: '읽는 중',
        startDate: formData.startDate,
        notes: [],
        readingHistory: [],
        file: bookFile,
        daysLeft: daysLeft,
        purpose: formData.purpose,
        intensity: formData.intensity,
        plan: studyPlan, // 구조화된 학습 계획
        subject: formData.subject,
        tableOfContents: formData.tableOfContents,
        studyTime: 0, // 초기 학습 시간
        progress: 0, // 초기 진행률
        lastStudiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        // 추가 메타데이터
        totalStudyTime: 0,
        noteCount: 0,
        highlightCount: 0,
        estimatedTotalTime: studyPlan.reduce((acc, plan) => acc + plan.estimatedTime, 0)
      };

      console.log('📚 원서 저장:', {
        id: newBook.id,
        pdfId: newBook.pdfId,
        title: newBook.title,
        planCount: studyPlan.length,
        estimatedTotalTime: newBook.estimatedTotalTime
      });

      // 로컬 스토리지에 저장
      const existingBooks = JSON.parse(localStorage.getItem('textbooks') || '[]');
      const updatedBooks = [...existingBooks, newBook];
      localStorage.setItem('textbooks', JSON.stringify(updatedBooks));
      
      setToastMessage('새 원서가 추가되었습니다!');
      setToastType('success');
      setShowToast(true);
      
      // 잠시 후 해당 원서의 상세 페이지로 이동
      setTimeout(() => {
        navigate(`/textbook/${newBook.id}`);
      }, 1500);

    } catch (error) {
      console.error('❌ 원서 저장 실패:', error);
      setToastMessage('원서 저장에 실패했습니다. 다시 시도해주세요.');
      setToastType('error');
      setShowToast(true);
    }
  };

  // 분석 상태 컴포넌트
  const AnalysisStatus = () => {
    if (!bookFile) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : analysisComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
          ) : analysisError ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <FileText className="w-5 h-5 text-blue-600" />
          )}
          <span className="font-medium text-gray-900">
            {isAnalyzing ? 'PDF 분석 중...' : 
             analysisComplete ? '분석 완료' : 
             analysisError ? '분석 실패' : '파일 업로드됨'}
          </span>
        </div>
        
        {isAnalyzing && (
          <div className="text-sm text-blue-700">
            {analysisProgress}
          </div>
        )}
        
        {analysisComplete && (
          <div className="text-sm text-green-700">
            ✅ 저자, 출판사, 페이지 수 정보가 자동으로 추출되었습니다.
          </div>
        )}
        
        {analysisError && (
          <div className="text-sm text-red-700">
            ⚠️ {analysisError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w mx-auto px-4 py-2 flex items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/textbook')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 원서 추가</h1>
              <p className="text-sm text-gray-600">단계별로 원서 정보를 입력하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium transition-colors ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                기본 정보
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full mx-6 relative">
              <div className={`h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ${
                currentStep >= 2 ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 2 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium transition-colors ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                학습 계획
              </span>
            </div>
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {currentStep === 1 && (
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">기본 정보 입력</h2>
                  <p className="text-gray-600">PDF 파일을 업로드하면 자동으로 정보를 추출합니다</p>
                </div>
              </div>

              {/* 파일 업로드 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">📁 전공 원서 파일 *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <FileUpload
                        onFileChange={handleFileChange}
                        accept="application/pdf"
                        label="PDF 파일을 드래그하거나 클릭하여 업로드하세요"
                        disabled={isAnalyzing}
                      />
                      <p className="text-xs text-gray-500 mt-2">최대 100MB까지 업로드 가능</p>
                    </div>
                  </div>
                </div>
                
                {/* 분석 상태 표시 */}
                <AnalysisStatus />
              </div>

              {/* 원서 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">📖 원서 제목 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="예: Operating Systems: Three Easy Pieces"
                    disabled={isAnalyzing}
                  />
                  {analysisComplete && formData.title && (
                    <p className="text-xs text-green-600">✓ PDF에서 자동 추출됨</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">✍️ 저자</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="예: Remzi H. Arpaci-Dusseau"
                    disabled={isAnalyzing}
                  />
                  {analysisComplete && formData.author && (
                    <p className="text-xs text-green-600">✓ PDF에서 자동 추출됨</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">🏢 출판사</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="예: MIT Press"
                    disabled={isAnalyzing}
                  />
                  {analysisComplete && formData.publisher && (
                    <p className="text-xs text-green-600">✓ PDF에서 자동 추출됨</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">📄 총 페이지 수 *</label>
                  <input
                    type="number"
                    value={formData.totalPages}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalPages: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="예: 400"
                    disabled={isAnalyzing}
                  />
                  {analysisComplete && formData.totalPages && (
                    <p className="text-xs text-green-600">✓ PDF에서 자동 추출됨</p>
                  )}
                </div>
              </div>

              {/* 과목/주제 (추가 정보) */}
              {formData.subject && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">📚 과목/주제</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="예: Computer Science, Operating Systems"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-green-600">✓ PDF에서 자동 추출됨</p>
                </div>
              )}

              {/* 목차 미리보기 */}
              {formData.tableOfContents && formData.tableOfContents.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">📋 목차 미리보기</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {formData.tableOfContents.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500 min-w-[40px]">{item.number}</span>
                          <span className="text-gray-700">{item.title}</span>
                        </div>
                      ))}
                      {formData.tableOfContents.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... 외 {formData.tableOfContents.length - 10}개 항목
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-green-600">✓ PDF에서 자동 추출된 목차 ({formData.tableOfContents.length}개 항목)</p>
                </div>
              )}

              {/* 학습 기간 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">📅 학습 기간 *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-medium">시작일</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleDateChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-medium">목표 완료일</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleDateChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
                {daysLeft !== null && daysLeft > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📊</span>
                      <span className="text-sm font-medium text-blue-700">
                        총 {daysLeft}일의 학습 기간이 설정되었습니다
                        {formData.totalPages && (
                          <span className="ml-2">
                            (하루 평균 {Math.ceil(parseInt(formData.totalPages) / daysLeft)}페이지)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.title || !formData.totalPages || !formData.startDate || !formData.endDate || isAnalyzing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    '다음 단계 →'
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">학습 계획 설정</h2>
                  <p className="text-gray-600">목표에 맞는 학습 계획을 세워보세요</p>
                </div>
              </div>

              {/* 학습 목적 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">🎯 학습 목적 *</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="예: 전공 심화 학습, 자격증 대비, 연구 목적, 취업 준비 등"
                />
              </div>

              {/* 학습 강도 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">⚡ 학습 강도</label>
                <div className="grid grid-cols-3 gap-4">
                  {intensityOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => setFormData(prev => ({ ...prev, intensity: option }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.intensity === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{option}</div>
                        <div className="text-xs mt-1">
                          {option === '낮음' && '천천히 꼼꼼히'}
                          {option === '보통' && '적당한 속도로'}
                          {option === '높음' && '빠르게 집중적으로'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 학습 계획 미리보기 */}
              {daysLeft && formData.totalPages && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 예상 학습 계획</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-gray-500 mb-1">총 학습 기간</div>
                      <div className="text-xl font-bold text-blue-600">{daysLeft}일</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-gray-500 mb-1">하루 평균</div>
                      <div className="text-xl font-bold text-green-600">
                        {Math.ceil(parseInt(formData.totalPages) / daysLeft)}페이지
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-gray-500 mb-1">예상 주차</div>
                      <div className="text-xl font-bold text-purple-600">
                        {Math.ceil(daysLeft / 7)}주
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI 플랜 생성 */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">🤖 스마트 학습 플랜 생성 *</label>
                <div className="flex gap-3">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={!formData.totalPages || !daysLeft}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-6 py-4 font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-5 h-5" />
                    {formData.tableOfContents.length > 0 ? '목차 기반 플랜 생성' : '페이지 기반 플랜 생성'}
                  </button>
                  {planTasks.length > 0 && (
                    <button
                      onClick={() => setPlanTasks([])}
                      className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      초기화
                    </button>
                  )}
                </div>
                
                {/* 생성된 플랜 미리보기 */}
                {planTasks.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      📋 생성된 학습 계획 ({planTasks.length}주차)
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {planTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {task.week}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{task.title || task.task}</div>
                            {task.memo && (
                              <div className="text-sm text-gray-600">{task.memo}</div>
                            )}
                            {task.pages && (
                              <div className="text-xs text-blue-600 mt-1">약 {task.pages}페이지</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <AIPlanGenerator
                  studyIntensity={formData.intensity}
                  onGenerate={handleGeneratePlan}
                  planTasks={planTasks}
                  setPlanTasks={setPlanTasks}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="secondary"
                  className="px-8 py-3"
                >
                  ← 이전 단계
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.purpose || planTasks.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  원서 추가 완료
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast 알림 */}
      <Toast open={showToast} onClose={() => setShowToast(false)} type={toastType}>
        {toastMessage}
      </Toast>
    </div>
  );
}
import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function FileUpload({
  onFileChange,
  accept = '*',
  label = '파일을 업로드하세요',
  multiple = false,
  style = {},
  isAnalyzing = false,
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selected = multiple ? e.target.files : e.target.files[0];
    setFile(selected);
    if (onFileChange) onFileChange(selected);
    if (selected && !multiple && selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = multiple ? e.dataTransfer.files : e.dataTransfer.files[0];
    setFile(dropped);
    if (onFileChange) onFileChange(dropped);
    if (dropped && !multiple && dropped.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(dropped);
    } else {
      setPreviewUrl(null);
    }
  };
  const handleClick = () => fileInputRef.current.click();

  return (
    <div
      className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'} cursor-pointer relative`}
      style={style}
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        tabIndex={-1}
      />
      
      {/* 분석 중 오버레이 */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <span className="text-sm font-medium text-blue-600">PDF 파일 분석 중...</span>
          <span className="text-xs text-gray-500 mt-1">저자 및 페이지 수를 추출하고 있습니다</span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2">
        {previewUrl ? (
          <img src={previewUrl} alt="미리보기" className="w-32 h-32 object-contain rounded shadow" />
        ) : (
          <div className="text-gray-400 text-4xl mb-2">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M21 16.5V8.25A2.25 2.25 0 0 0 18.75 6h-13.5A2.25 2.25 0 0 0 3 8.25v8.25A2.25 2.25 0 0 0 5.25 18h13.5A2.25 2.25 0 0 0 21 16.5Z" /></svg>
          </div>
        )}
        <span className="font-medium text-gray-700">{label}</span>
        {file && !multiple && (
          <span className="text-xs text-gray-500 mt-1">{file.name}</span>
        )}
        {multiple && file && file.length > 0 && (
          <span className="text-xs text-gray-500 mt-1">{Array.from(file).map(f => f.name).join(', ')}</span>
        )}
      </div>
    </div>
  );
} 
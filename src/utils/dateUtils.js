// 현재 날짜를 2025년 8월 1일로 설정하는 유틸리티 함수들

// 현재 날짜를 2025년 8월 1일로 가져오기
export const getCurrentDate = () => {
  return new Date('2025-08-01');
};

// 현재 년도 가져오기
export const getCurrentYear = () => {
  return 2025;
};

// 현재 월 가져오기 (1-12)
export const getCurrentMonth = () => {
  return 8;
};

// 현재 일 가져오기
export const getCurrentDay = () => {
  return 1;
};

// 날짜를 YYYY-MM-DD 형식으로 포맷
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 현재 날짜가 오늘인지 확인
export const isToday = (date) => {
  const today = getCurrentDate();
  return formatDate(date) === formatDate(today);
};

// 날짜가 현재 날짜보다 이전인지 확인
export const isPast = (date) => {
  const today = getCurrentDate();
  return date < today;
};

// 날짜가 현재 날짜보다 이후인지 확인
export const isFuture = (date) => {
  const today = getCurrentDate();
  return date > today;
};

// 상대적 시간 표시 (예: "2시간 전", "1일 전")
export const getRelativeTime = (date) => {
  const now = getCurrentDate();
  const diffInMs = now - new Date(date);
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 1) {
    return '방금 전';
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return formatDate(new Date(date));
  }
};

// 자동 업데이트되는 현재 년도 (JavaScript)
export const getAutoUpdateYear = () => {
  return new Date().getFullYear();
}; 
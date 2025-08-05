import React, { useState, useEffect } from 'react';

const AutoYear = ({ startYear = 2025, className = '' }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // 년도가 변경될 때마다 업데이트
    const updateYear = () => {
      setCurrentYear(new Date().getFullYear());
    };

    // 매년 1월 1일에 년도 업데이트
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1); // 다음 년도 1월 1일
    const timeUntilNextYear = nextYear - now;

    const timer = setTimeout(updateYear, timeUntilNextYear);

    return () => clearTimeout(timer);
  }, []);

  // 시작 년도와 현재 년도가 다르면 범위로 표시
  const displayYear = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;

  return (
    <span className={className}>
      {displayYear}
    </span>
  );
};

export default AutoYear; 
import React from 'react';
import { CheckCircle } from 'lucide-react';

const WeeklyProgress = ({ selectedDays, completedDays }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">주간 학습 목표</h3>
      <div className="flex justify-between items-center mb-4">
        {days.map((day, index) => {
          const isSelected = selectedDays.includes(index);
          const isCompleted = completedDays.includes(index);
          return (
            <div key={day} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                  : isSelected 
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : day}
              </div>
              <span className="text-xs text-gray-500 mt-1">{day}</span>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-gray-600 text-center">
        이번 주 진행률: {completedDays.length}/{selectedDays.length} ({selectedDays.length > 0 ? Math.round((completedDays.length / selectedDays.length) * 100) : 0}%)
      </div>
    </div>
  );
};

export default WeeklyProgress; 
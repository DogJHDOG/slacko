import React from 'react';
import { Target } from 'lucide-react';

const GoalSettingModal = ({ open, onClose, showToastMessage }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full">
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">목표 설정</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">일일 학습 목표 (분)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="120"
                  min="15"
                  step="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">주간 학습 목표</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="예: 5시간 이상"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">완료 목표일</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onClose();
                  showToastMessage('목표가 설정되었습니다!', 'success');
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
              >
                <Target size={16} /> 목표 저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSettingModal; 
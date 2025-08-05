import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DeadlineSection({ upcomingDeadlines, getDaysUntilDeadline }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">다가오는 마감일</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {upcomingDeadlines.map((deadline) => {
            const daysLeft = getDaysUntilDeadline(deadline.dueDate);
            const isUrgent = daysLeft <= 3;
            return (
              <div key={deadline.id} className={`p-3 rounded-lg border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${isUrgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {deadline.type}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{new Date(deadline.dueDate).toLocaleDateString()}</span>
                  <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                    D-{daysLeft}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
import React from 'react';
import { X, Clock, Calendar, BookOpen, Code, Flag, AlertCircle, RotateCcw } from 'lucide-react';

const EventDetailModal = ({ isOpen, onClose, events, selectedDate }) => {
  if (!isOpen) return null;

  const eventTypes = {
    study: { label: '학습', color: 'bg-blue-500', icon: BookOpen },
    reading: { label: '독서', color: 'bg-green-500', icon: BookOpen },
    coding: { label: '코딩', color: 'bg-purple-500', icon: Code },
    project: { label: '프로젝트', color: 'bg-orange-500', icon: Flag },
    deadline: { label: '마감일', color: 'bg-red-500', icon: AlertCircle }
  };

  const repeatOptions = {
    none: '반복 없음',
    daily: '매일',
    weekly: '매주',
    monthly: '매월'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {formatDate(selectedDate)} 일정
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              총 {events.length}개의 일정이 있습니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 일정 목록 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const typeConfig = eventTypes[event.type];
                const Icon = typeConfig.icon;
                
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      event.projectColor ? 'border-l-4' : typeConfig.color.replace('bg-', 'border-')
                    } bg-gray-50 ${
                      event.completed ? 'opacity-60' : ''
                    }`}
                    style={event.projectColor ? { borderLeftColor: event.projectColor } : {}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {event.projectIcon ? (
                            <span className="text-lg">{event.projectIcon}</span>
                          ) : (
                            <Icon size={16} className={typeConfig.color.replace('bg-', 'text-')} />
                          )}
                          <h3 className={`font-semibold text-lg ${event.completed ? 'line-through' : ''}`}>
                            {event.title}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                            {typeConfig.label}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{event.time} ({event.duration}시간)</span>
                            </div>
                          )}
                          
                          {event.repeat !== 'none' && (
                            <div className="flex items-center gap-2">
                              <RotateCcw size={14} />
                              <span>{repeatOptions[event.repeat]}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{formatDate(event.date)}</span>
                          </div>
                        </div>
                        
                        {event.memo && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-700">{event.memo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal; 
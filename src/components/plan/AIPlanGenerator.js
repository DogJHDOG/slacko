import React from 'react';
import { Plus, Trash2, Brain, Target, Calendar } from 'lucide-react';

export default function AIPlanGenerator({ studyIntensity, onGenerate, planTasks, setPlanTasks, readOnly = false }) {
  // Task 텍스트 수정 핸들러
  const handleTaskChange = (idx, field, value) => {
    setPlanTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  // 새로운 Task 추가
  const handleAddTask = () => {
    const newTask = {
      week: planTasks.length + 1,
      task: '',
      date: '',
      done: false,
      memo: ''
    };
    setPlanTasks(prev => [...prev, newTask]);
  };

  // Task 삭제
  const handleDeleteTask = (idx) => {
    setPlanTasks(prev => prev.filter((_, i) => i !== idx));
  };

  // 학습 강도별 추천 플랜 템플릿
  const getRecommendedPlan = () => {
    const templates = {
      '낮음': [
        { week: 1, task: '1~2장 읽기 및 핵심 개념 정리', date: '', done: false, memo: '천천히 이해하며 읽기' },
        { week: 2, task: '3~4장 읽기 및 예제 풀이', date: '', done: false, memo: '실습 위주로 학습' },
        { week: 3, task: '5~6장 읽기 및 복습', date: '', done: false, memo: '이전 내용과 연결' },
      ],
      '보통': [
        { week: 1, task: '1~3장 읽기 및 개념 정리', date: '', done: false, memo: '기초 개념 확립' },
        { week: 2, task: '4~6장 읽기 및 문제풀이', date: '', done: false, memo: '실습과 이론 병행' },
        { week: 3, task: '7~9장 읽기 및 복습', date: '', done: false, memo: '전체적인 흐름 파악' },
        { week: 4, task: '10~12장 읽기 및 심화 학습', date: '', done: false, memo: '심화 개념 도전' },
      ],
      '높음': [
        { week: 1, task: '1~5장 읽기 및 개념 정리', date: '', done: false, memo: '빠른 진도로 기초 확립' },
        { week: 2, task: '6~10장 읽기 및 문제풀이', date: '', done: false, memo: '실습과 이론 병행' },
        { week: 3, task: '11~15장 읽기 및 심화 학습', date: '', done: false, memo: '고급 개념 도전' },
        { week: 4, task: '16~20장 읽기 및 종합 복습', date: '', done: false, memo: '전체 내용 통합' },
        { week: 5, task: '21~25장 읽기 및 실전 연습', date: '', done: false, memo: '실전 문제 풀이' },
      ],
    };
    return templates[studyIntensity] || templates['보통'];
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 추천 플랜 템플릿 - 생성 모드에서만 표시 */}
      {!readOnly && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">추천 학습 플랜</h4>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">추천 플랜 ({studyIntensity} 강도)</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {getRecommendedPlan().slice(0, 3).map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {task.week}
                  </span>
                  <span>{task.task}</span>
                </div>
              ))}
              {getRecommendedPlan().length > 3 && (
                <div className="text-blue-600 font-medium">+ {getRecommendedPlan().length - 3}개 더...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 생성된 플랜 표시 및 편집 */}
      {planTasks.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">주차별 학습 플랜</h4>
            </div>
            {!readOnly && (
              <button
                onClick={handleAddTask}
                className="flex items-center gap-1 bg-green-600 text-white rounded-lg px-3 py-1 text-sm hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-3">
            {planTasks.map((task, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* 주차 */}
                  <div className="flex-shrink-0">
                    <input
                      type="number"
                      min={1}
                      className="w-12 h-12 font-bold text-green-700 border-2 border-green-200 rounded-lg text-center focus:outline-none focus:border-green-500 bg-transparent"
                      value={task.week}
                      onChange={e => handleTaskChange(i, 'week', parseInt(e.target.value) || 1)}
                      aria-label="주차"
                    />
                  </div>
                  
                  {/* 메인 컨텐츠 */}
                  <div className="flex-1 space-y-3">
                    {/* 할 일 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">학습 내용</label>
                      <input
                        type="text"
                        className="w-full font-medium border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 bg-transparent"
                        value={task.task}
                        onChange={e => handleTaskChange(i, 'task', e.target.value)}
                        placeholder="예: 1~3장 읽기 및 개념 정리"
                      />
                    </div>
                    
                    {/* 하단 행 */}
                    <div className="flex flex-wrap gap-2">
                      {/* 일정 */}
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">완료일</label>
                        <input
                          type="date"
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-400"
                          value={task.date}
                          onChange={e => handleTaskChange(i, 'date', e.target.value)}
                        />
                      </div>
                      
                      {/* 메모 */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">메모</label>
                        <input
                          type="text"
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-400"
                          placeholder="메모"
                          value={task.memo}
                          onChange={e => handleTaskChange(i, 'memo', e.target.value)}
                        />
                      </div>
                      
                      {/* 완료 체크박스 */}
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={e => handleTaskChange(i, 'done', e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          완료
                        </label>
                      </div>
                      
                      {/* 삭제 버튼 */}
                      {!readOnly && (
                        <div className="flex items-end">
                          <button
                            onClick={() => handleDeleteTask(i)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 플랜 요약 */}
          <div className="mt-4 bg-white rounded-lg p-3 border border-green-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">총 {planTasks.length}주차</span>
              <span className="text-green-600 font-medium">
                완료: {planTasks.filter(t => t.done).length}개
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
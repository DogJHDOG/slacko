import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, Square, CheckCircle } from 'lucide-react';

const StudyTimer = ({ subjects, selectedSubject, setSelectedSubject, showToastMessage, updateStudyTime, updateGoalProgress }) => {
  const [timer, setTimer] = useState({
    minutes: 0,
    seconds: 0,
    isRunning: false,
    sessionType: 'study',
    focusTime: 25,
    breakTime: 5
  });

  const [studyLog, setStudyLog] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds === 59) {
            return { ...prev, minutes: prev.minutes + 1, seconds: 0 };
          } else {
            return { ...prev, seconds: prev.seconds + 1 };
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timer.isRunning]);

  const startTimer = () => setTimer(prev => ({ ...prev, isRunning: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, isRunning: false }));
  const resetTimer = () => setTimer(prev => ({ ...prev, minutes: 0, seconds: 0, isRunning: false }));

  const handleStudyComplete = () => {
    if (studyLog.trim() && selectedSubject) {
      // 학습 시간 업데이트
      const studyTime = timer.minutes + (timer.seconds / 60);
      
      // 선택된 챕터가 있다면 해당 챕터 ID를 사용, 없다면 첫 번째 미완료 챕터 사용
      const incompleteChapters = selectedSubject.chapters.filter(ch => !ch.completed);
      const chapterId = incompleteChapters.length > 0 ? incompleteChapters[0].id : 1;
      
      updateStudyTime(selectedSubject.id, chapterId, studyTime, studyLog);
      
      showToastMessage(`학습 기록이 저장되었습니다!\n과목: ${selectedSubject.name}\n시간: ${timer.minutes}분 ${timer.seconds}초`, 'success');
      setStudyLog('');
      resetTimer();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Timer className="text-purple-500" size={24} />
          포모도로 학습 타이머
        </h2>

        <div className="max-w-md mx-auto">
          {/* 타이머 디스플레이 */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-white mb-4">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
              <div className="text-purple-100 mb-6">
                {timer.sessionType === 'study' ? '📚 집중 학습 시간' : '☕ 휴식 시간'}
              </div>
              
              {/* 타이머 컨트롤 */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={startTimer}
                  disabled={timer.isRunning}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={20} />
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!timer.isRunning}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pause size={20} />
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl font-medium flex items-center gap-2"
                >
                  <Square size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* 과목 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">학습할 과목 선택</label>
            <select 
              value={selectedSubject?.id || ''}
              onChange={e => {
                const subject = subjects.find(s => s.id === parseInt(e.target.value));
                setSelectedSubject(subject);
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">과목을 선택하세요</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          {/* 타이머 설정 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">집중 시간 (분)</label>
              <input
                type="number"
                value={timer.focusTime}
                onChange={e => setTimer(prev => ({ ...prev, focusTime: parseInt(e.target.value) || 25 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">휴식 시간 (분)</label>
              <input
                type="number"
                value={timer.breakTime}
                onChange={e => setTimer(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="30"
              />
            </div>
          </div>

          {/* 학습 로그 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">학습 내용 기록</label>
            <textarea
              value={studyLog}
              onChange={e => setStudyLog(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
              placeholder="오늘 학습한 내용을 기록해보세요..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleStudyComplete}
                disabled={!studyLog.trim() || !selectedSubject}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} /> 학습 완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer; 
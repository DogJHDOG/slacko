import React from 'react';
import { Briefcase, Target, TrendingUp, Activity } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressRing from './ProgressRing';

const AnalyticsView = ({ analytics, projects }) => {
  return (
    <div className="space-y-8">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">총 프로젝트</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{analytics.totalProjects}</p>
            </div>
            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-indigo-600 font-medium">
              {analytics.inProgressProjects}개 진행 중
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">작업 완료율</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">{Math.round(analytics.taskCompletionRate)}%</p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${analytics.taskCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600">예산 사용률</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{Math.round(analytics.budgetUtilization)}%</p>
            </div>
            <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-amber-600 font-medium">
              ₩{(analytics.totalSpent / 1000000).toFixed(1)}M / ₩{(analytics.totalBudget / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600">평균 진행률</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{Math.round(analytics.overallProgress)}%</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <ProgressRing progress={analytics.overallProgress} size={32} />
          </div>
        </div>
      </div>

      {/* Enhanced Project Performance Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">프로젝트별 성과</h3>
        <div className="space-y-4">
          {projects.map(project => {
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
            const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const budgetProgress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
            
            return (
              <div key={project.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{project.icon}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                    <p className="text-sm text-slate-600">{totalTasks}개 작업</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 font-medium mb-1">작업 진행률</p>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 min-w-12">{Math.round(taskProgress)}%</span>
                    </div>
                  </div>
                  
                  {project.budget > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-medium mb-1">예산 사용률</p>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 min-w-12">{Math.round(budgetProgress)}%</span>
                      </div>
                    </div>
                  )}
                  
                  <StatusBadge status={project.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView; 
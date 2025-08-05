import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: '캡스톤 디자인 프로젝트',
      description: 'AI 기반 학습 도우미 앱 개발',
      status: 'in-progress',
      priority: 'high',
      startDate: '2025-08-01',
      endDate: '2025-10-31',
      estimatedHours: 320,
      actualHours: 156,
      budget: 15000000,
      spent: 7200000,
      visibility: 'team',
      tags: ['AI', 'Mobile', 'Education'],
      color: '#6366f1',
      icon: '🎓',
      owner: { id: 1, name: '김현우', avatar: 'https://i.pravatar.cc/40?img=1', email: 'kim@example.com', role: 'PM' },
      team: [
        { id: 1, name: '김현우', role: 'PM', avatar: 'https://i.pravatar.cc/40?img=1', email: 'kim@example.com', phone: '010-1234-5678' },
        { id: 2, name: '이수진', role: 'Designer', avatar: 'https://i.pravatar.cc/40?img=2', email: 'lee@example.com', phone: '010-2345-6789' },
        { id: 3, name: '박준호', role: 'Developer', avatar: 'https://i.pravatar.cc/40?img=3', email: 'park@example.com', phone: '010-3456-7890' },
        { id: 4, name: '최영미', role: 'QA', avatar: 'https://i.pravatar.cc/40?img=4', email: 'choi@example.com', phone: '010-4567-8901' }
      ],
      tasks: [
        { 
          id: 1, 
          title: '요구사항 분석 및 기획서 작성',
          description: '사용자 요구사항 조사 및 기능 정의',
          status: 'completed', 
          priority: 'high',
          assignee: { id: 1, name: '김현우' },
          dueDate: '2025-08-15',
          estimatedHours: 24,
          actualHours: 28,
          labels: ['기획', '문서화'],
          subtasks: [
            { id: 11, title: '사용자 인터뷰 진행', completed: true },
            { id: 12, title: '경쟁사 분석', completed: true },
            { id: 13, title: '기능 정의서 작성', completed: true }
          ],
          comments: 3,
          attachments: 2
        },
        {
          id: 2,
          title: 'UI/UX 디자인 시스템 구축',
          description: '통일된 디자인 시스템과 컴포넌트 라이브러리 구축',
          status: 'in-progress',
          priority: 'high',
          assignee: { id: 2, name: '이수진' },
          dueDate: '2025-09-01',
          estimatedHours: 40,
          actualHours: 18,
          labels: ['디자인', 'UI'],
          subtasks: [
            { id: 21, title: '컬러 팔레트 정의', completed: true },
            { id: 22, title: '타이포그래피 시스템', completed: true },
            { id: 23, title: '컴포넌트 디자인', completed: false },
            { id: 24, title: '프로토타입 제작', completed: false }
          ],
          comments: 8,
          attachments: 15
        },
        {
          id: 3,
          title: 'AI 모델 개발 및 학습',
          description: 'Natural Language Processing 모델 개발',
          status: 'in-progress',
          priority: 'critical',
          assignee: { id: 3, name: '박준호' },
          dueDate: '2025-09-20',
          estimatedHours: 80,
          actualHours: 35,
          labels: ['AI', '개발'],
          subtasks: [
            { id: 31, title: '데이터셋 수집', completed: true },
            { id: 32, title: '모델 아키텍처 설계', completed: false },
            { id: 33, title: '학습 파이프라인 구축', completed: false }
          ],
          comments: 12,
          attachments: 5
        }
      ],
      milestones: [
        { id: 1, title: '프로젝트 킥오프', date: '2025-08-01', completed: true },
        { id: 2, title: '기획 완료', date: '2025-08-15', completed: true },
        { id: 3, title: '디자인 시스템 완료', date: '2025-09-01', completed: false },
        { id: 4, title: 'MVP 개발 완료', date: '2025-09-28', completed: false },
        { id: 5, title: '최종 발표', date: '2025-10-31', completed: false }
      ],
      activity: [
        { id: 1, type: 'task_completed', user: '김현우', action: '요구사항 분석 완료', time: '2시간 전' },
        { id: 2, type: 'comment', user: '이수진', action: 'UI 디자인에 댓글 추가', time: '4시간 전' },
        { id: 3, type: 'file_upload', user: '박준호', action: '데이터셋 파일 업로드', time: '1일 전' }
      ],
      files: [
        { id: 1, name: '프로젝트_기획서.pdf', size: '2.4MB', type: 'pdf', uploadedBy: '김현우', uploadedAt: '2025-08-10' },
        { id: 2, name: '와이어프레임_v2.fig', size: '15.2MB', type: 'figma', uploadedBy: '이수진', uploadedAt: '2025-08-18' },
        { id: 3, name: 'dataset_samples.zip', size: '156MB', type: 'zip', uploadedBy: '박준호', uploadedAt: '2025-08-25' }
      ]
    },
    {
      id: 2,
      name: '개인 포트폴리오 웹사이트',
      description: '인터랙티브 3D 포트폴리오 사이트 제작',
      status: 'completed',
      priority: 'medium',
      startDate: '2025-07-01',
      endDate: '2025-07-31',
      estimatedHours: 60,
      actualHours: 72,
      budget: 2000000,
      spent: 1850000,
      visibility: 'private',
      tags: ['Web', '3D', 'Portfolio'],
      color: '#10b981',
      icon: '💻',
      owner: { id: 1, name: '김현우', avatar: 'https://i.pravatar.cc/40?img=1', email: 'kim@example.com', role: 'Full-stack' },
      team: [
        { id: 1, name: '김현우', role: 'Full-stack', avatar: 'https://i.pravatar.cc/40?img=1', email: 'kim@example.com', phone: '010-1234-5678' }
      ],
      tasks: [
        {
          id: 4,
          title: '3D 모델링 및 애니메이션',
          status: 'completed',
          priority: 'medium',
          assignee: { id: 1, name: '김현우' },
          dueDate: '2025-07-15',
          estimatedHours: 20,
          actualHours: 24,
          labels: ['3D', '애니메이션']
        },
        {
          id: 5,
          title: '반응형 웹 개발',
          status: 'completed',
          priority: 'high',
          assignee: { id: 1, name: '김현우' },
          dueDate: '2025-07-25',
          estimatedHours: 30,
          actualHours: 35,
          labels: ['웹개발', '반응형']
        }
      ],
      milestones: [
        { id: 6, title: '디자인 완료', date: '2025-07-10', completed: true },
        { id: 7, title: '개발 완료', date: '2025-07-25', completed: true },
        { id: 8, title: '배포 완료', date: '2025-07-31', completed: true }
      ],
      activity: [],
      files: []
    }
  ]);

  const addProject = (newProject) => {
    setProjects([...projects, newProject]);
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const updateTask = (projectId, taskId, updates) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        };
      }
      return project;
    }));
  };

  const addTask = (projectId, newTask) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...(project.tasks || []), newTask]
        };
      }
      return project;
    }));
  };

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    updateTask,
    addTask
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 
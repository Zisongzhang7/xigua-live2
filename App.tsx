
import React, { useState } from 'react';
import Sidebar, { ViewType } from './components/Sidebar';
import Header from './components/Header';
import LiveStreamList from './components/LiveStreamList';
import LiveSetupView from './components/LiveSetupView';
import InteractiveResourceList from './components/InteractiveResourceList';
import InteractionTemplateList from './components/InteractionTemplateList';
import CreateInteractiveResourceView from './components/CreateInteractiveResourceView';
import EditInteractionTemplateView from './components/EditInteractionTemplateView';
import { LiveStream, InteractiveResource, InteractionCategory, InteractionTemplate } from './types';

// 统一标签数据源
export const COMMON_LABELS = ['数学', '语文', '英语', '理综', '文综', '素质教育', '有奖', '竞赛', '调研', '活动'];

const INITIAL_RESOURCES: InteractiveResource[] = [
  // --- QUIZ (答题) ---
  { id: 'IR-Q01', name: '几何基础有奖问答', category: InteractionCategory.QUIZ, templateName: '默认答题模板', labels: ['数学', '有奖'], creator: '张老师', modifiedAt: '2024-05-18 10:20' },
  { id: 'IR-Q02', name: '初一英语单词竞速', category: InteractionCategory.QUIZ, templateName: '快速抢答模板', labels: ['英语', '竞赛'], creator: '李老师', modifiedAt: '2024-05-19 09:15' },
  { id: 'IR-Q03', name: '物理力学知识测试', category: InteractionCategory.QUIZ, templateName: '标准考试模板', labels: ['理综', '竞赛'], creator: '王老师', modifiedAt: '2024-05-20 11:30' },
  { id: 'IR-Q04', name: '古诗词填空擂台', category: InteractionCategory.QUIZ, templateName: '趣味填空模板', labels: ['语文', '活动'], creator: '赵老师', modifiedAt: '2024-05-21 15:45' },
  { id: 'IR-Q05', name: '少儿编程逻辑挑战', category: InteractionCategory.QUIZ, templateName: '编程挑战模板', labels: ['素质教育', '有奖'], creator: '陈老师', modifiedAt: '2024-05-22 14:20' },
  // ... 其他资源保持不变
];

const INITIAL_TEMPLATES: InteractionTemplate[] = [
  { id: 'IT-001', name: '初中数学开学第一课', labels: ['数学', '活动'], interactionCount: 5, creator: '张老师', modifiedAt: '2024-05-20 14:00' },
  { id: 'IT-002', name: '英语词汇突击战模板', labels: ['英语', '竞赛'], interactionCount: 3, creator: '李老师', modifiedAt: '2024-05-21 09:30' },
  { id: 'IT-003', name: '理综实验室趣味交互', labels: ['理综', '素质教育'], interactionCount: 8, creator: '王老师', modifiedAt: '2024-05-22 11:45' },
];

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('ROOM_MANAGEMENT');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<InteractiveResource | null>(null);
  
  // 模板管理相关状态
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentEditingTemplate, setCurrentEditingTemplate] = useState<InteractionTemplate | null>(null);
  
  const [resources, setResources] = useState<InteractiveResource[]>(INITIAL_RESOURCES);
  const [templates, setTemplates] = useState<InteractionTemplate[]>(INITIAL_TEMPLATES);

  const handleEnterSetup = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const handleBackToList = () => {
    setSelectedStream(null);
  };

  const handleSaveResource = (resource: InteractiveResource) => {
    if (editingResource) {
      setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
    } else {
      setResources(prev => [resource, ...prev]);
    }
    setIsCreatingResource(false);
    setEditingResource(null);
  };

  const handleSaveTemplate = (template: InteractionTemplate) => {
    if (currentEditingTemplate) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates(prev => [template, ...prev]);
    }
    setIsEditingTemplate(false);
    setCurrentEditingTemplate(null);
  };

  const handleEditResource = (resource: InteractiveResource) => {
    setEditingResource(resource);
    setIsCreatingResource(true);
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('确定要删除该交互资源吗？')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('确定要删除该交互模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTemplate = (tpl: InteractionTemplate) => {
    setCurrentEditingTemplate(tpl);
    setIsEditingTemplate(true);
  };

  const handleCreateTemplate = () => {
    setCurrentEditingTemplate(null);
    setIsEditingTemplate(true);
  };

  // 资源编辑视图
  if (isCreatingResource) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <CreateInteractiveResourceView 
          initialResource={editingResource || undefined}
          onBack={() => {
            setIsCreatingResource(false);
            setEditingResource(null);
          }} 
          onSave={handleSaveResource}
        />
      </div>
    );
  }

  // 模板编辑视图
  if (isEditingTemplate) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <EditInteractionTemplateView 
          initialTemplate={currentEditingTemplate || undefined}
          resources={resources}
          onBack={() => {
            setIsEditingTemplate(false);
            setCurrentEditingTemplate(null);
          }}
          onSave={handleSaveTemplate}
        />
      </div>
    );
  }

  // 直播间配置视图
  if (selectedStream) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <LiveSetupView stream={selectedStream} resources={resources} onBack={handleBackToList} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'ROOM_MANAGEMENT':
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">直播间管理</h1>
              <p className="text-gray-500 text-sm mt-1">管理并监控您的所有直播间资源</p>
            </header>
            <LiveStreamList onEnterSetup={handleEnterSetup} />
          </>
        );
      case 'INTERACTIVE_RESOURCES':
        return (
          <InteractiveResourceList 
            resources={resources}
            onAddResource={() => setIsCreatingResource(true)} 
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
          />
        );
      case 'INTERACTION_TEMPLATES':
        return (
          <InteractionTemplateList 
            templates={templates}
            onAddTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          currentPath={['直播', 
            activeView === 'ROOM_MANAGEMENT' ? '直播间管理' : 
            activeView === 'INTERACTIVE_RESOURCES' ? '直播交互资源' : '直播交互模板'
          ]}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

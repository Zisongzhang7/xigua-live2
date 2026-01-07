
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
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



const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('ROOM_MANAGEMENT');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<InteractiveResource | null>(null);

  // 模板管理相关状态
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentEditingTemplate, setCurrentEditingTemplate] = useState<InteractionTemplate | null>(null);

  // Persistence: Use Live Queries
  const resources = useLiveQuery(() => db.resources.toArray()) || [];
  const templates = useLiveQuery(() => db.templates.toArray()) || [];

  const handleEnterSetup = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const handleBackToList = () => {
    setSelectedStream(null);
  };

  const handleSaveResource = async (resource: InteractiveResource) => {
    await db.resources.put(resource);
    setIsCreatingResource(false);
    setEditingResource(null);
  };

  const handleSaveTemplate = async (template: InteractionTemplate) => {
    await db.templates.put(template);
    setIsEditingTemplate(false);
    setCurrentEditingTemplate(null);
  };

  const handleEditResource = (resource: InteractiveResource) => {
    setEditingResource(resource);
    setIsCreatingResource(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('确定要删除该交互资源吗？')) {
      await db.resources.delete(id);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('确定要删除该交互模板吗？')) {
      await db.templates.delete(id);
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
            allLabels={COMMON_LABELS}
          />
        );
      case 'INTERACTION_TEMPLATES':
        return (
          <InteractionTemplateList
            templates={templates}
            onAddTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            allLabels={COMMON_LABELS}
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

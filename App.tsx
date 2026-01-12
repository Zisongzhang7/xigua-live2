
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
import PrdFloatingBall from './components/PrdFloatingBall';
import PrdModeLayer from './components/PrdModeLayer';
import { LiveStream, InteractiveResource, InteractionCategory, InteractionTemplate, PrdNote } from './types';
import { exportPrdNotesFromServer } from './services/prdNotesApi';

// 统一标签数据源
export const COMMON_LABELS = ['数学', '语文', '英语', '理综', '文综', '素质教育', '有奖', '竞赛', '调研', '活动'];



const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('ROOM_MANAGEMENT');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<InteractiveResource | null>(null);
  const [isPrdMode, setIsPrdMode] = useState(false);

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

  // 当前页面作用域（用于给 PRD 标注做“页面隔离”）
  const scopeKey = (() => {
    if (isCreatingResource) return `RESOURCE_EDITOR:${editingResource?.id || 'NEW'}`;
    if (isEditingTemplate) return `TEMPLATE_EDITOR:${currentEditingTemplate?.id || 'NEW'}`;
    if (selectedStream) return `LIVE_SETUP:${selectedStream.id}`;
    return `MAIN:${activeView}`;
  })();

  const exportPrdNotes = async () => {
    let payload: any;
    try {
      payload = await exportPrdNotesFromServer();
    } catch {
      const all = await db.prdNotes.toArray();
      payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        origin: window.location.origin,
        notes: all,
        source: 'local'
      };
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prd-notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importPrdNotes = async (file: File) => {
    const text = await file.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      alert('导入失败：不是合法的 JSON 文件');
      return;
    }
    const notes: PrdNote[] = Array.isArray(json?.notes) ? json.notes : (Array.isArray(json) ? json : []);
    const valid = notes.filter(n => n && typeof n.key === 'string' && typeof n.scopeKey === 'string' && typeof n.selector === 'string' && typeof n.content === 'string');
    if (valid.length === 0) {
      alert('导入失败：未找到可用的 prdNotes 数据');
      return;
    }
    const ok = window.confirm(`即将导入 ${valid.length} 条标注（会覆盖同 key 的旧数据）。是否继续？`);
    if (!ok) return;
    await db.prdNotes.bulkPut(valid);
    alert(`导入成功：${valid.length} 条`);
  };

  const handleSaveStream = async (stream: LiveStream) => {
    await db.streams.put(stream);
    // Update local state if it matches selectedStream to keep UI in sync immediately
    if (selectedStream && selectedStream.id === stream.id) {
      setSelectedStream(stream);
    }
  };

  const renderContent = () => {
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
          <LiveSetupView 
            stream={selectedStream} 
            resources={resources} 
            onBack={handleBackToList} 
            onSaveStream={handleSaveStream}
            allLabels={COMMON_LABELS} 
          />
        </div>
      );
    }

    switch (activeView) {
      case 'ROOM_MANAGEMENT':
        return (
          <>
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
    <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
      {/* PRD 全局悬浮球 + 模式层 */}
      <PrdFloatingBall
        enabled={isPrdMode}
        onToggle={() => setIsPrdMode(v => !v)}
        onExport={exportPrdNotes}
        onImport={importPrdNotes}
      />
      <PrdModeLayer enabled={isPrdMode} scopeKey={scopeKey} />

      {/* 页面内容 */}
      {isCreatingResource || isEditingTemplate || selectedStream ? (
        renderContent()
      ) : (
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
      )}
    </div>
  );
};

export default App;

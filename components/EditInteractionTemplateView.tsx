
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Clock,
  List,
  Search,
  X,
  Tag as TagIcon,
  GripVertical,
  Settings2,
  FileStack,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { InteractionTemplate, InteractiveResource, InteractionCategory, InteractionItem } from '../types';
import { COMMON_LABELS } from '../App';
import { ResourceSelectionModal } from './LiveSetupComponents';
import { QuizCard, QuizStatus } from './QuizCard';
import { SliceListCard, SliceListStatus } from './SliceListCard';
import { AISwitchCard, AISwitchStatus } from './AISwitchCard';

interface InteractionState {
  status: QuizStatus;
  votes: Record<string, number>;
  isExpanded: boolean;
}

interface EditInteractionTemplateViewProps {
  initialTemplate?: InteractionTemplate;
  resources: InteractiveResource[];
  onBack: () => void;
  onSave: (template: InteractionTemplate) => void;
}

const EditInteractionTemplateView: React.FC<EditInteractionTemplateViewProps> = ({
  initialTemplate,
  resources,
  onBack,
  onSave
}) => {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialTemplate?.labels || []);
  const [activeTab, setActiveTab] = useState<'LIST' | 'TIMELINE'>('LIST');
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // State Container for Interaction Runtime Data (Lifted State)
  const [interactionStates, setInteractionStates] = useState<Record<string, InteractionState>>({});

  // 初始化交互项 (Mock)
  useEffect(() => {
    if (initialTemplate && initialTemplate.items) {
      setInteractions(initialTemplate.items);
    } else if (initialTemplate) {
      // Fallback for mock if items undefined
      const mockInteractions: InteractionItem[] = Array.from({ length: initialTemplate.interactionCount }).map((_, i) => ({
        id: `tpl-item-${i}`,
        title: `交互项 ${i + 1}`,
        type: InteractionCategory.QUIZ,
        time: `00:${(i + 1) * 5}`,
        label: '默认导入环节',
        track: 'MAIN',
        triggerMode: 'MANUAL',
        duration: 300
      }));
      setInteractions(mockInteractions);
    }
  }, [initialTemplate]);

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleAddResource = (res: InteractiveResource) => {
    const mode = (res as any)._mode;
    const originalSlices = res.config?.slices || [];
    const slices = mode === 'homework_only'
      ? originalSlices.filter((s: any) => s.title.includes('作业') || s.type === 'TEXT')
      : originalSlices;

    const newItem: InteractionItem = {
      id: `tpl-item-${Date.now()}`,
      title: res.name,
      type: res.category,
      time: '00:00',
      label: '切片课资源',
      resourceId: res.id,
      track: 'MAIN',
      triggerMode: 'MANUAL',
      duration: 0,
      config: {
        ...res.config,
        slices: slices
      }
    };
    setInteractions(prev => [...prev, newItem]);
    setSelectionModalOpen(false);
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractions(prev => prev.filter(item => item.id !== id));
    // Cleanup state
    const newState = { ...interactionStates };
    delete newState[id];
    setInteractionStates(newState);
  };

  const handleLabelUpdate = (id: string, newLabel: string) => {
    setInteractions(prev => prev.map(item => item.id === id ? { ...item, label: newLabel } : item));
  };

  // Drag and Drop Logic
  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newList = [...interactions];
    const item = newList.splice(draggedItemIndex, 1)[0];
    newList.splice(index, 0, item);
    setInteractions(newList);
    setDraggedItemIndex(index);
  };

  const handleSave = () => {
    if (!name.trim()) return alert('请输入模板名称');

    const template: InteractionTemplate = {
      id: initialTemplate?.id || `IT-${Math.floor(Math.random() * 10000)}`,
      name: name,
      labels: selectedLabels,
      items: interactions,
      interactionCount: interactions.length,
      creator: initialTemplate?.creator || 'Administrator',
      modifiedAt: new Date().toLocaleString()
    };
    onSave(template);
  };

  // State Management Helpers
  const getInteractionState = (id: string): InteractionState => {
    return interactionStates[id] || { status: 'IDLE', votes: {}, isExpanded: false };
  };

  // FIXED: Use functional update to prevent stale closure issues
  const updateInteractionState = (id: string, partial: Partial<InteractionState>) => {
    setInteractionStates(prev => {
      const current = prev[id] || { status: 'IDLE', votes: {}, isExpanded: false };
      return {
        ...prev,
        [id]: { ...current, ...partial }
      };
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-2"></div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">
              {initialTemplate ? '编辑交互模板' : '新建交互模板'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Interaction Template Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
            取消模板
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Save size={18} />
            保存模板
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

          {/* 模板信息模块 (Brain Map: 模板信息模块 - 名称在上，标签在下) */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-10">
            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
              <FileStack size={20} className="text-indigo-500" />
              <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">模板信息模块</h2>
            </div>

            <div className="flex flex-col gap-10">
              {/* 名称模块 - 位于上方 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  模板名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入用于快速识别的模板名称..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              {/* 标签模块 - 位于下方 */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  选择关联标签 (数据源一致)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMMON_LABELS.map(label => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedLabels.includes(label) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 交互配置模块 */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
              <div className="flex items-center gap-3">
                <Settings2 size={20} className="text-indigo-500" />
                <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">交互配置模块</h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setActiveTab('LIST')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'LIST' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List size={14} /> 列表模式
                  </button>
                  <button
                    onClick={() => setActiveTab('TIMELINE')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'TIMELINE' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Clock size={14} /> 时间轴模式
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                <button
                  onClick={() => setSelectionModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-100"
                >
                  <Plus size={16} />
                  新增交互
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 bg-white overflow-y-auto custom-scrollbar">
              {activeTab === 'LIST' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {Object.values(InteractionCategory).map(cat => {
                    const group = interactions.filter(i => i.type === cat);
                    if (group.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 border-l-2 border-indigo-500">{cat} ({group.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {group.map(item => {
                            if (item.type === InteractionCategory.QUIZ) {
                              const state = getInteractionState(item.id);
                              return (
                                <QuizCard
                                  key={item.id}
                                  id={item.id}
                                  title={item.title}
                                  time={item.time}
                                  onDelete={() => handleDeleteInteraction(item.id)}
                                  status={state.status}
                                  votes={state.votes}
                                  isExpanded={state.isExpanded}
                                  onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                  onVotesUpdate={(v) => updateInteractionState(item.id, { votes: v })}
                                  onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                />
                              );
                            }
                            if (item.type === InteractionCategory.AI_SWITCH) {
                              const state = getInteractionState(item.id);
                              return (
                                <AISwitchCard
                                  key={item.id}
                                  id={item.id}
                                  status={state.status as AISwitchStatus}
                                  config={item.config}
                                  onDelete={() => handleDeleteInteraction(item.id)}
                                  onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                  onConfigChange={(c) => {
                                    setInteractions(prev => prev.map(i => i.id === item.id ? { ...i, config: c } : i));
                                  }}
                                  isReadOnly={false} // Template editor is editable
                                />
                              );
                            }
                            if (item.type === InteractionCategory.COURSE_SLICE) {
                              const state = getInteractionState(item.id);
                              return (
                                <SliceListCard
                                  key={item.id}
                                  id={item.id}
                                  title={item.title}
                                  className="六年级(2)班"
                                  lessonName={item.title}
                                  slices={item.config?.slices}
                                  onDelete={() => handleDeleteInteraction(item.id)}
                                  status={state.status as SliceListStatus}
                                  isExpanded={state.isExpanded}
                                  onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                  onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                  isReadOnly={true}
                                />
                              );
                            }
                            return (
                              <InteractionCard
                                key={item.id}
                                item={item}
                                onDelete={() => handleDeleteInteraction(item.id)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {interactions.length === 0 && (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                      </div>
                      <p className="text-gray-400 font-bold text-sm">模板内暂无交互，请点击右上角新增</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative pl-12 ml-4 animate-in slide-in-from-left-4 duration-300">
                  <div className="absolute left-[13px] top-0 bottom-0 w-[2px] bg-indigo-100 rounded-full"></div>

                  <div className="space-y-10 relative">
                    {interactions.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`relative group transition-all ${draggedItemIndex === idx ? 'opacity-40' : 'opacity-100'}`}
                        draggable="true"
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={() => setDraggedItemIndex(null)}
                      >
                        <div className="absolute left-[-40px] top-[14px] w-[28px] h-[28px] rounded-full bg-white border-4 border-indigo-600 shadow-sm z-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                        </div>

                        {item.type === InteractionCategory.QUIZ ? (
                          <QuizCard
                            id={item.id}
                            title={item.title}
                            time={item.time}
                            onDelete={() => handleDeleteInteraction(item.id)}
                            dragHandle={
                              <div className="p-1 mr-1 text-gray-200 group-hover:text-indigo-300 transition-colors cursor-grab active:cursor-grabbing">
                                <GripVertical size={20} />
                              </div>
                            }
                            status={getInteractionState(item.id).status}
                            votes={getInteractionState(item.id).votes}
                            isExpanded={getInteractionState(item.id).isExpanded}
                            onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                            onVotesUpdate={(v) => updateInteractionState(item.id, { votes: v })}
                            onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                          />
                        ) : (
                          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group-hover:border-indigo-300 transition-all duration-300">
                            <div className="flex items-center gap-6">
                              <div className="p-2 text-gray-200 group-hover:text-indigo-300 transition-colors cursor-grab active:cursor-grabbing">
                                <GripVertical size={20} />
                              </div>

                              <div>
                                <div className="flex items-center gap-3">
                                  <p className="text-sm font-black text-gray-900">{item.title}</p>
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    {item.type}
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 group/label">
                                  <Info size={12} className="text-gray-300" />
                                  {editingLabelId === item.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        autoFocus
                                        value={item.label || ''}
                                        onChange={(e) => handleLabelUpdate(item.id, e.target.value)}
                                        onBlur={() => setEditingLabelId(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingLabelId(null)}
                                        className="text-xs text-gray-600 border-b border-indigo-400 outline-none bg-indigo-50/50 px-2 py-0.5 rounded"
                                      />
                                      <button onClick={() => setEditingLabelId(null)} className="p-1 hover:bg-indigo-100 rounded text-indigo-600">
                                        <Check size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <p
                                      onClick={() => setEditingLabelId(item.id)}
                                      className="text-xs text-gray-400 hover:text-indigo-400 hover:underline decoration-dotted transition-colors cursor-text"
                                    >
                                      {item.label || '添加备注信息...'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteInteraction(item.id)}
                              className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <ResourceSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        resources={resources}
        onSelect={handleAddResource}
      />
    </div>
  );
};

const InteractionCard: React.FC<{ item: InteractionItem; onDelete: () => void }> = ({ item, onDelete }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">{item.type}</span>
      <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
        <Clock size={12} /> {item.time}
      </div>
    </div>
    <h5 className="text-sm font-black text-gray-900 mb-1">{item.title}</h5>
    <p className="text-[10px] text-gray-400 font-bold truncate">{item.label || '暂无说明'}</p>

    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onDelete}
        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

export default EditInteractionTemplateView;

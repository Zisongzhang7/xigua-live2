
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  Tag,
  ChevronDown,
  X,
  FileStack
} from 'lucide-react';
import { InteractionTemplate } from '../types';

interface InteractionTemplateListProps {
  templates: InteractionTemplate[];
  onAddTemplate?: () => void;
  onEditTemplate?: (template: InteractionTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
  allLabels: string[];
}

const InteractionTemplateList: React.FC<InteractionTemplateListProps> = ({
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  allLabels
}) => {
  const [filters, setFilters] = useState({
    name: '',
    id: '',
    creator: '',
    selectedLabels: [] as string[]
  });
  const [isLabelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target as Node)) {
        setLabelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      const matchName = (tpl.name || '').toLowerCase().includes(filters.name.toLowerCase());
      const matchId = (tpl.id || '').toLowerCase().includes(filters.id.toLowerCase());
      const matchCreator = (tpl.creator || '').toLowerCase().includes(filters.creator.toLowerCase());
      const matchLabels = filters.selectedLabels.length === 0 ||
        (tpl.labels || []).every(label => filters.selectedLabels.includes(label));
      return matchName && matchId && matchCreator && matchLabels;
    });
  }, [templates, filters]);

  const resetFilters = () => setFilters({ name: '', id: '', creator: '', selectedLabels: [] });

  const toggleLabel = (label: string) => {
    setFilters(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(label)
        ? prev.selectedLabels.filter(l => l !== label)
        : [...prev.selectedLabels, label]
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
            <FileStack size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 leading-tight">直播交互模板</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Interaction Library Templates</p>
          </div>
        </div>
        <button
          onClick={onAddTemplate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          新建交互模板
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">模板名称</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                placeholder="搜索模板名称..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">模板 ID</label>
            <input
              value={filters.id}
              onChange={(e) => setFilters(prev => ({ ...prev, id: e.target.value }))}
              placeholder="输入 ID..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">创建人</label>
            <input
              value={filters.creator}
              onChange={(e) => setFilters(prev => ({ ...prev, creator: e.target.value }))}
              placeholder="搜索创建人..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 relative" ref={labelDropdownRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">标签筛选</label>
            <button
              onClick={() => setLabelDropdownOpen(!isLabelDropdownOpen)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 flex items-center justify-between hover:border-indigo-500 transition-all shadow-sm"
            >
              <span className="truncate">
                {filters.selectedLabels.length === 0 ? '全部标签' : `已选 ${filters.selectedLabels.length} 个`}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isLabelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLabelDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 max-h-56 overflow-y-auto animate-in zoom-in-95 duration-200">
                {allLabels.map(label => (
                  <label key={label} className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl cursor-pointer group transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.selectedLabels.includes(label)}
                      onChange={() => toggleLabel(label)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 py-3 rounded-xl text-sm font-black transition-all shadow-sm"
            >
              <RotateCcw size={18} />
              清除筛选
            </button>
          </div>
        </div>

        {filters.selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
            {filters.selectedLabels.map(label => (
              <span key={label} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-indigo-100 animate-in zoom-in-95">
                {label}
                <X
                  size={14}
                  className="cursor-pointer hover:text-indigo-800"
                  onClick={() => toggleLabel(label)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">模板名称</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">标签</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">包含交互数量</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">创建人</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">修改时间</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTemplates.length > 0 ? filteredTemplates.map(tpl => (
              <tr key={tpl.id} className="hover:bg-indigo-50/10 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-black text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{tpl.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1 tracking-tighter uppercase">ID: {tpl.id}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.labels.map(label => (
                      <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">
                        <Tag size={10} />
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-base font-black text-gray-900 tabular-nums">{tpl.interactionCount}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tpl.creator}`} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm" alt={tpl.creator} />
                    <span className="text-xs font-bold text-gray-700">{tpl.creator}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[11px] font-bold text-gray-400">{tpl.modifiedAt}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEditTemplate?.(tpl)}
                      className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="编辑"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDeleteTemplate?.(tpl.id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <FileStack size={48} className="opacity-20 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">没有找到符合条件的模板</p>
                    <button onClick={resetFilters} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">尝试重置筛选</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InteractionTemplateList;

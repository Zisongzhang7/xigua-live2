
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  Layers,
  Tag,
  ChevronDown,
  X
} from 'lucide-react';
import { InteractionCategory, InteractiveResource } from '../types';

interface InteractiveResourceListProps {
  resources: InteractiveResource[];
  onAddResource?: () => void;
  onEditResource?: (resource: InteractiveResource) => void;
  onDeleteResource?: (id: string) => void;
  allLabels: string[];
}

const InteractiveResourceList: React.FC<InteractiveResourceListProps> = ({
  resources,
  onAddResource,
  onEditResource,
  onDeleteResource,
  allLabels
}) => {
  const [filters, setFilters] = useState({ name: '', id: '', category: '', selectedLabels: [] as string[] });
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

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchName = res.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchId = res.id.toLowerCase().includes(filters.id.toLowerCase());
      const matchCategory = filters.category === '' || res.category === filters.category;
      const matchLabels = filters.selectedLabels.length === 0 ||
        filters.selectedLabels.every(label => res.labels.includes(label));
      return matchName && matchId && matchCategory && matchLabels;
    });
  }, [resources, filters]);

  const resetFilters = () => setFilters({ name: '', id: '', category: '', selectedLabels: [] });


  const toggleLabel = (label: string) => {
    setFilters(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(label)
        ? prev.selectedLabels.filter(l => l !== label)
        : [...prev.selectedLabels, label]
    }));
  };

  const removeLabel = (label: string) => {
    setFilters(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.filter(l => l !== label)
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">交互资源列表</h2>
            <p className="text-xs text-gray-400">管理所有可复用的直播间交互组件</p>
          </div>
        </div>
        <button
          onClick={onAddResource}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={18} />
          新增交互资源
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ID 筛选</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={filters.id}
                onChange={(e) => setFilters(prev => ({ ...prev, id: e.target.value }))}
                placeholder="搜索 ID..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">交互名称</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入资源名称搜索..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">类别筛选</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as InteractionCategory }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none"
            >
              <option value="">全部类别</option>
              {Object.values(InteractionCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 relative" ref={labelDropdownRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">标签筛选 (多选)</label>
            <button
              onClick={() => setLabelDropdownOpen(!isLabelDropdownOpen)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-700 flex items-center justify-between hover:border-blue-500 transition-all shadow-sm"
            >
              <span className="truncate">
                {filters.selectedLabels.length === 0 ? '选择标签' : `已选 ${filters.selectedLabels.length} 个`}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isLabelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLabelDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto animate-in zoom-in-95 duration-200">
                {allLabels.map(label => (
                  <label key={label} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      checked={filters.selectedLabels.includes(label)}
                      onChange={() => toggleLabel(label)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <RotateCcw size={16} />
              清除筛选
            </button>
          </div>
        </div>

        {/* Selected Labels Display */}
        {filters.selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
            {filters.selectedLabels.map(label => (
              <span key={label} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 shadow-sm animate-in zoom-in-90 duration-200">
                {label}
                <X
                  size={12}
                  className="cursor-pointer hover:text-blue-800"
                  onClick={() => removeLabel(label)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resource Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">交互名称</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">类别</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">标签</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">创建人</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">修改时间</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredResources.length > 0 ? filteredResources.map(res => (
              <tr key={res.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{res.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {res.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded uppercase border border-gray-200">
                    {res.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {res.labels.map(label => (
                      <span key={label} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-md border border-blue-100">
                        <Tag size={8} />
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${res.creator}`} className="w-5 h-5 rounded-full bg-gray-100" />
                    <span className="text-xs font-medium text-gray-700">{res.creator}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">{res.modifiedAt}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEditResource?.(res)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteResource?.(res.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-20 text-center text-gray-400 italic text-sm">
                  暂无匹配的交互资源
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InteractiveResourceList;

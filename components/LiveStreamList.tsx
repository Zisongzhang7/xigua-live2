
import React, { useState, useMemo } from 'react';
import { Plus, Search, RotateCcw, LayoutGrid } from 'lucide-react';
import { LiveStream, LiveStatus, LiveType, FilterParams } from '../types';
import LiveStreamCard from './LiveStreamCard';
import CreateLiveModal from './CreateLiveModal';

interface LiveStreamListProps {
  onEnterSetup?: (stream: LiveStream) => void;
}

const INITIAL_STREAMS: LiveStream[] = [
  {
    id: 'LS-9001',
    name: '初中数学特训营 - 几何入门',
    description: '深入浅出讲解欧几里得几何基础，带你领略数学之美。',
    coverUrl: 'https://picsum.photos/seed/math/400/225',
    type: LiveType.COURSE,
    teacher: '张老师',
    status: LiveStatus.LIVE,
    startTime: '2024-05-20 14:00'
  },
  {
    id: 'LS-9002',
    name: '2024 春季新品发布会',
    description: '全平台同步直播，揭秘我们最新的教育科技产品。',
    coverUrl: 'https://picsum.photos/seed/event/400/225',
    type: LiveType.ORDINARY,
    teacher: '产品经理-王五',
    status: LiveStatus.NOT_STARTED,
    startTime: '2024-06-01 10:00'
  },
  {
    id: 'LS-9003',
    name: '高考英语提分攻略',
    description: '核心考点梳理，独家解题技巧分享。',
    coverUrl: 'https://picsum.photos/seed/english/400/225',
    type: LiveType.COURSE,
    teacher: '李老师',
    status: LiveStatus.LIVE,
    startTime: '2024-05-20 09:30'
  },
  {
    id: 'LS-9004',
    name: '家长交流日：如何陪伴孩子成长',
    description: '邀请著名心理学家分享家庭教育心得。',
    coverUrl: 'https://picsum.photos/seed/family/400/225',
    type: LiveType.ORDINARY,
    teacher: '心理专家-赵六',
    status: LiveStatus.NOT_STARTED,
    startTime: '2024-05-25 20:00'
  }
];

const LiveStreamList: React.FC<LiveStreamListProps> = ({ onEnterSetup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY'>('ALL');
  const [streams, setStreams] = useState<LiveStream[]>(INITIAL_STREAMS);
  const [filters, setFilters] = useState<FilterParams>({
    name: '',
    id: '',
    teacher: '',
    type: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', id: '', teacher: '', type: '' });
  };

  const handleCreateLive = (newStream: LiveStream) => {
    setStreams(prev => [newStream, ...prev]);
  };

  const filteredStreams = useMemo(() => {
    return streams.filter(stream => {
      const matchName = stream.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchId = stream.id.toLowerCase().includes(filters.id.toLowerCase());
      const matchTeacher = stream.teacher.toLowerCase().includes(filters.teacher.toLowerCase());
      const matchType = filters.type === '' || stream.type === filters.type;
      
      const matchTab = activeTab === 'ALL' || (activeTab === 'MY' && stream.id.includes('9001'));
      
      return matchName && matchId && matchTeacher && matchType && matchTab;
    });
  }, [streams, filters, activeTab]);

  return (
    <div className="space-y-4">
      {/* Tabs & Create Button */}
      <div className="bg-white p-1 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex gap-1">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            全部
          </button>
          <button 
            onClick={() => setActiveTab('MY')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'MY' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            我直播过
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          新建直播
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">直播间名称</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="搜索名称..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">直播间 ID</label>
          <input 
            name="id"
            value={filters.id}
            onChange={handleFilterChange}
            placeholder="搜索 ID..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">主播/老师</label>
          <input 
            name="teacher"
            value={filters.teacher}
            onChange={handleFilterChange}
            placeholder="姓名..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">直播类型</label>
          <select 
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
          >
            <option value="">全部类型</option>
            <option value={LiveType.COURSE}>课程直播</option>
            <option value={LiveType.ORDINARY}>普通直播</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button 
            onClick={resetFilters}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition-all"
          >
            <RotateCcw size={16} />
            重置
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2">
        {filteredStreams.length > 0 ? (
          filteredStreams.map(stream => (
            <LiveStreamCard 
              key={stream.id} 
              stream={stream} 
              onClick={() => onEnterSetup?.(stream)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            <LayoutGrid size={48} className="mb-4 opacity-20" />
            <p className="text-lg">没有找到匹配的直播间</p>
            <button onClick={resetFilters} className="mt-4 text-blue-600 hover:underline">清除搜索条件</button>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      <CreateLiveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateLive}
      />
    </div>
  );
};

export default LiveStreamList;

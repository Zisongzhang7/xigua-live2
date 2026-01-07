
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Plus, Search, RotateCcw, LayoutGrid } from 'lucide-react';
import { LiveStream, LiveStatus, LiveType, FilterParams } from '../types';
import LiveStreamCard from './LiveStreamCard';
import CreateLiveModal from './CreateLiveModal';

interface LiveStreamListProps {
  onEnterSetup?: (stream: LiveStream) => void;
}



const LiveStreamList: React.FC<LiveStreamListProps> = ({ onEnterSetup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY'>('ALL');
  // const [streams, setStreams] = useState<LiveStream[]>(INITIAL_STREAMS);
  const streams = useLiveQuery(() => db.streams.toArray()) || []; // Use DB

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

  const handleCreateLive = async (newStream: LiveStream) => {
    // setStreams(prev => [newStream, ...prev]);
    await db.streams.add(newStream);
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

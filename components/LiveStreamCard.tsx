
import React, { useState } from 'react';
import { 
  MoreVertical, 
  Calendar, 
  Trash2, 
  Edit, 
  PlayCircle,
  Clock
} from 'lucide-react';
import { LiveStream, LiveStatus, LiveType } from '../types';

interface LiveStreamCardProps {
  stream: LiveStream;
  onClick?: () => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isLive = stream.status === LiveStatus.LIVE;

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image & Status Badge */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={stream.coverUrl} 
          alt={stream.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/40 flex items-center gap-2 hover:bg-white/30 transition-all">
                <PlayCircle size={20} />
                <span>进入管理</span>
            </div>
        </div>
        
        {/* Top Badges (Only Status remains here) */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              直播中
            </div>
          ) : (
            <div className="bg-gray-800/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <Clock size={10} />
              未开播
            </div>
          )}
        </div>

        {/* Live Stream ID */}
        <div className="absolute bottom-2 right-3 text-[10px] text-white/80 font-mono tracking-tighter bg-black/40 px-1.5 rounded backdrop-blur-[2px]">
          ID: {stream.id}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 relative">
        {/* Type Badge Above Title */}
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit text-white ${
          stream.type === LiveType.COURSE ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {stream.type === LiveType.COURSE ? '课程直播' : '普通直播'}
        </div>

        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-1 flex-1 pr-2" title={stream.name}>
            {stream.name}
          </h3>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                  <Edit size={14} /> 修改
                </button>
                <button className="w-full px-4 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                  <Trash2 size={14} /> 删除
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 min-h-[2.5rem]">
          {stream.description}
        </p>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-1">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.teacher}`} className="w-5 h-5 rounded-full ring-1 ring-gray-100 bg-gray-50" />
             <span className="text-xs font-medium text-gray-700">{stream.teacher}</span>
          </div>
        </div>

        {/* Conditional Start Time for Ordinary Streams */}
        {stream.type === LiveType.ORDINARY && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar size={12} />
            <span>最近开播时间: {stream.startTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamCard;

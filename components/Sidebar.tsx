
import React from 'react';
import { 
  Wrench, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  Settings, 
  BookOpen, 
  BarChart2, 
  Bell, 
  Monitor,
  Search,
  ChevronDown,
  Video
} from 'lucide-react';

export type ViewType = 'ROOM_MANAGEMENT' | 'INTERACTIVE_RESOURCES' | 'INTERACTION_TEMPLATES';

interface SidebarProps {
  isOpen: boolean;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; children?: React.ReactNode }> = ({ icon, label, active, children }) => (
  <div>
    <div className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronDown size={14} className={active ? 'rotate-180 transition-transform' : ''} />
    </div>
    {active && children && (
      <div className="bg-[#000c17]">
        {children}
      </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeView, onViewChange }) => {
  if (!isOpen) return null;

  return (
    <div className="w-60 bg-[#001529] h-full flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <Monitor className="text-white" size={20} />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">MySpace</span>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#1F2D3D] text-sm text-gray-300 rounded py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto">
        <NavItem icon={<Wrench size={18} />} label="工具" />
        <NavItem icon={<MessageSquare size={18} />} label="触达" />
        <NavItem icon={<Trophy size={18} />} label="赛事" />
        <NavItem icon={<Calendar size={18} />} label="调度" />
        <NavItem icon={<Settings size={18} />} label="运营" />
        <NavItem icon={<BookOpen size={18} />} label="配课" />
        <NavItem icon={<BarChart2 size={18} />} label="统计" />
        <NavItem icon={<Bell size={18} />} label="订阅" />
        <NavItem icon={<Monitor size={18} />} label="课堂" />
        
        {/* Live Category */}
        <NavItem icon={<Video size={18} />} label="直播" active={true}>
          <div 
            onClick={() => onViewChange('ROOM_MANAGEMENT')}
            className={`relative pl-12 py-3 text-sm font-bold cursor-pointer transition-colors border-l-4 ${activeView === 'ROOM_MANAGEMENT' ? 'text-blue-400 bg-blue-500/10 border-blue-400' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
          >
            直播间管理
          </div>
          <div 
            onClick={() => onViewChange('INTERACTIVE_RESOURCES')}
            className={`relative pl-12 py-3 text-sm font-bold cursor-pointer transition-colors border-l-4 ${activeView === 'INTERACTIVE_RESOURCES' ? 'text-blue-400 bg-blue-500/10 border-blue-400' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
          >
            直播交互资源
          </div>
          <div 
            onClick={() => onViewChange('INTERACTION_TEMPLATES')}
            className={`relative pl-12 py-3 text-sm font-bold cursor-pointer transition-colors border-l-4 ${activeView === 'INTERACTION_TEMPLATES' ? 'text-blue-400 bg-blue-500/10 border-blue-400' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
          >
            直播交互模板
          </div>
        </NavItem>
      </nav>

      {/* Footer Info */}
      <div className="p-4 text-xs text-gray-500 border-t border-gray-800 text-center">
        V2.4.0 Live Manager
      </div>
    </div>
  );
};

export default Sidebar;

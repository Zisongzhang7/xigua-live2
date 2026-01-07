
import React from 'react';
import { 
  Menu, 
  HelpCircle, 
  FileText, 
  UserPlus, 
  Headphones, 
  Search, 
  BookMarked
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentPath?: string[];
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentPath = ['直播', '直播间管理'] }) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600"
        >
          <Menu size={20} />
        </button>
        <div className="text-gray-400 text-sm flex items-center gap-2">
          {currentPath.map((item, index) => (
            <React.Fragment key={item}>
              <span>/</span>
              <span className={index === currentPath.length - 1 ? "text-gray-600 font-medium truncate max-w-[200px]" : ""}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <UtilityIcon icon={<HelpCircle size={18} />} />
        <UtilityIcon icon={<FileText size={18} />} />
        <UtilityIcon icon={<div className="flex items-center gap-1 text-xs font-medium"><UserPlus size={16} /><span className="hidden lg:inline">产品反馈</span></div>} />
        <UtilityIcon icon={<div className="flex items-center gap-1 text-xs font-medium"><Headphones size={16} /><span className="hidden lg:inline">家长支持</span></div>} />
        <UtilityIcon icon={<Search size={18} />} />
        <UtilityIcon icon={<BookMarked size={18} />} />
        
        <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-3">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-xs font-semibold text-gray-700">Administrator</span>
            <span className="text-[10px] text-gray-400">Super User</span>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Profile" 
            className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-100 transition-all"
          />
        </div>
      </div>
    </header>
  );
};

const UtilityIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
    {icon}
  </button>
);

export default Header;

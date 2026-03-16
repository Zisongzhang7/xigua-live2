import React, { useState, useMemo } from 'react';
import { Search, RefreshCcw, Video, Mic, Monitor, Flame, Gift, Flag } from 'lucide-react';

export interface MicUser {
  id: string;
  name: string;
  avatar: string;
  studentNo: string;
  isConnectedThisSession: boolean; // 绿色名字=本场连过
  connectCount: number; // 🎁=总连线次数
  handUpCount: number; // 🔥=举手次数
  canShareScreen: boolean; // 💻=可以共享屏幕
  hasCam: boolean;
  hasMic: boolean;
  team: 'RED' | 'BLUE' | 'NONE'; // 🚩红方/蓝方
  gender: 'MALE' | 'FEMALE';
  platform: 'PC' | 'APP' | 'PAD';
  score: number; // 8.2K分
  status: 'IDLE' | 'CONNECTING' | 'CONNECTED';
}

const MOCK_USERS: MicUser[] = [
  {
    id: 'u1',
    name: '张志松',
    studentNo: '2024001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    isConnectedThisSession: true,
    connectCount: 12,
    handUpCount: 7,
    canShareScreen: true,
    hasCam: true,
    hasMic: true,
    team: 'NONE',
    gender: 'MALE',
    platform: 'PAD',
    score: 8200,
    status: 'IDLE'
  },
  {
    id: 'u2',
    name: '李小华',
    studentNo: '2024002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    isConnectedThisSession: false,
    connectCount: 0,
    handUpCount: 3,
    canShareScreen: false,
    hasCam: true,
    hasMic: false,
    team: 'BLUE',
    gender: 'FEMALE',
    platform: 'APP',
    score: 4500,
    status: 'IDLE'
  },
  {
    id: 'u3',
    name: '王明',
    studentNo: '2024003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    isConnectedThisSession: false,
    connectCount: 5,
    handUpCount: 1,
    canShareScreen: true,
    hasCam: false,
    hasMic: true,
    team: 'RED',
    gender: 'MALE',
    platform: 'PC',
    score: 1200,
    status: 'CONNECTED'
  }
];

type FilterType = 'RED' | 'BLUE' | 'MALE' | 'FEMALE' | 'CAM' | 'MIC' | 'SCREEN' | 'NEVER' | 'PC' | 'APP';

interface LinkMicPanelProps {
  onClose: () => void;
}

const FilterPill: React.FC<{ label: string; active: boolean; onClick: () => void; colorClass: string }> = ({ label, active, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
      active ? colorClass : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
    }`}
  >
    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${active ? 'border-current' : 'border-gray-300'}`} />
    {label}
  </button>
);

// Simple Tooltip Component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return (
    <div className="relative group/tooltip flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {content}
        {/* Triangle arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export const LinkMicPanel: React.FC<LinkMicPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<MicUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const handleRefresh = () => {
    setUsers([...MOCK_USERS].sort(() => Math.random() - 0.5));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      if (search && !u.name.includes(search) && !u.studentNo.includes(search)) return false;

      // Filters
      if (activeFilters.size === 0) return true;

      for (const filter of activeFilters) {
        switch (filter) {
          case 'RED': if (u.team !== 'RED') return false; break;
          case 'BLUE': if (u.team !== 'BLUE') return false; break;
          case 'MALE': if (u.gender !== 'MALE') return false; break;
          case 'FEMALE': if (u.gender !== 'FEMALE') return false; break;
          case 'CAM': if (!u.hasCam) return false; break;
          case 'MIC': if (!u.hasMic) return false; break;
          case 'SCREEN': if (!u.canShareScreen) return false; break;
          case 'NEVER': if (u.connectCount > 0) return false; break;
          case 'PC': if (u.platform !== 'PC') return false; break;
          case 'APP': if (u.platform !== 'APP' && u.platform !== 'PAD') return false; break;
        }
      }
      return true;
    });
  }, [users, search, activeFilters]);

  const handleConnect = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'CONNECTED', isConnectedThisSession: true } : u));
  };

  const handleDisconnect = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'IDLE' } : u));
  };

  const formatScore = (score: number) => {
    return score >= 1000 ? `${(score / 1000).toFixed(1)}K` : score.toString();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-sm border border-green-500 overflow-hidden flex flex-col w-full animate-in slide-in-from-top-2 duration-300">
        {/* Compact Header */}
        <div className="px-3 py-2 border-b border-green-100 flex items-center justify-between bg-green-50/30">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">连线控制</h3>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{filteredUsers.length}人在线</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="刷新列表"
            >
              <RefreshCcw size={14} />
            </button>
            <div className="w-px h-3 bg-gray-300 mx-0.5"></div>
            <button
              onClick={onClose}
              className="px-2 py-1 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 text-xs font-bold rounded-md transition-all"
            >
              关闭面板
            </button>
          </div>
        </div>

        <div className="p-2 border-b border-green-50 flex items-center gap-2 bg-white flex-wrap">
          {/* Search Box - Narrower */}
          <div className="relative w-32 shrink-0">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:border-green-500 outline-none transition-all"
            />
          </div>

          {/* Compact Filters - Merged into same container */}
          <FilterPill label="红方" active={activeFilters.has('RED')} onClick={() => toggleFilter('RED')} colorClass="bg-red-50 border-red-200 text-red-600" />
          <FilterPill label="蓝方" active={activeFilters.has('BLUE')} onClick={() => toggleFilter('BLUE')} colorClass="bg-blue-50 border-blue-200 text-blue-600" />
          <FilterPill label="举手" active={activeFilters.has('NEVER')} onClick={() => toggleFilter('NEVER')} colorClass="bg-orange-50 border-orange-200 text-orange-600" />
          <FilterPill label="有画面" active={activeFilters.has('CAM')} onClick={() => toggleFilter('CAM')} colorClass="bg-emerald-50 border-emerald-200 text-emerald-600" />
          <FilterPill label="PC端" active={activeFilters.has('PC')} onClick={() => toggleFilter('PC')} colorClass="bg-blue-50 border-blue-200 text-blue-600" />
        </div>

        <div className="flex-1 max-h-[240px] overflow-y-auto p-1.5 bg-gray-50/30 space-y-1">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white border border-gray-100 p-2 rounded-lg flex items-center justify-between hover:border-green-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100" />
                  {user.platform === 'PC' && <div className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-600 text-[8px] px-0.5 rounded border border-white" title="PC端登录">PC</div>}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs ${user.isConnectedThisSession ? 'text-green-600' : 'text-gray-900'}`} title={user.isConnectedThisSession ? "本场已连线" : ""}>
                      {user.name}
                    </span>
                    {/* Status Icons */}
                    <div className="flex gap-0.5">
                      {user.hasCam && <Video size={10} className="text-green-500" title="摄像头已开启" />}
                      {user.hasMic && <Mic size={10} className="text-green-500" title="麦克风已开启" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                    <Tooltip content={`举手 ${user.handUpCount} 次`}>
                      <span className="flex items-center gap-0.5 text-orange-400 cursor-help">
                        <Flame size={10} fill="currentColor" /> {user.handUpCount}
                      </span>
                    </Tooltip>
                    <Tooltip content={`总连线 ${user.connectCount} 次`}>
                      <span className="flex items-center gap-0.5 cursor-help">
                        <Gift size={10} className="text-red-400" /> {user.connectCount}
                      </span>
                    </Tooltip>
                    <Tooltip content={`积分: ${user.score}`}>
                      <span>{formatScore(user.score)}</span>
                    </Tooltip>
                    {user.team === 'RED' && (
                      <Tooltip content="红方战队">
                        <span className="text-red-500 flex items-center cursor-help">
                          <Flag size={10} fill="currentColor" /> 红
                        </span>
                      </Tooltip>
                    )}
                    {user.team === 'BLUE' && (
                      <Tooltip content="蓝方战队">
                        <span className="text-blue-500 flex items-center cursor-help">
                          <Flag size={10} fill="currentColor" /> 蓝
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {user.status === 'IDLE' ? (
                  <button
                    onClick={() => handleConnect(user.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-sm shadow-blue-200"
                  >
                    连线
                  </button>
                ) : (
                  <>
                    {user.canShareScreen && (
                      <button className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors" title="共享屏幕">
                        <Monitor size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(user.id)}
                      className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 text-[10px] font-bold rounded-md transition-colors"
                    >
                      挂断
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-xs italic">
              没有找到匹配的用户
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

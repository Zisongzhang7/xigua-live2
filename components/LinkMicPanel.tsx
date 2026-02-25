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
      <h3 className="text-sm font-bold text-gray-800 ml-1">辩论连线</h3>
      <div className="bg-white rounded-lg shadow-sm border border-green-500 overflow-hidden flex flex-col w-full animate-in slide-in-from-top-2 duration-300">
        <div className="p-3 border-b border-green-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold rounded-full transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-[#6366f1] hover:bg-indigo-600 text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1"
            >
              手动刷新 <RefreshCcw size={12} />
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
            <span className="text-green-500 font-bold">绿色名字=本场连过</span> | <Gift size={12} className="text-red-500 inline" />=总连线次数 | <Flame size={12} className="text-orange-500 inline" />=举手次数 | <Monitor size={12} className="text-green-500 inline" />=可以共享屏幕
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="按学号或姓名筛选"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill label="红方" active={activeFilters.has('RED')} onClick={() => toggleFilter('RED')} colorClass="bg-red-50 border-red-200 text-red-600" />
            <FilterPill label="蓝方" active={activeFilters.has('BLUE')} onClick={() => toggleFilter('BLUE')} colorClass="bg-blue-50 border-blue-200 text-blue-600" />
            <FilterPill label="男生" active={activeFilters.has('MALE')} onClick={() => toggleFilter('MALE')} colorClass="bg-cyan-50 border-cyan-200 text-cyan-600" />
            <FilterPill label="女生" active={activeFilters.has('FEMALE')} onClick={() => toggleFilter('FEMALE')} colorClass="bg-pink-50 border-pink-200 text-pink-600" />
            <FilterPill label="摄像头" active={activeFilters.has('CAM')} onClick={() => toggleFilter('CAM')} colorClass="bg-emerald-50 border-emerald-200 text-emerald-600" />
            <FilterPill label="麦克风" active={activeFilters.has('MIC')} onClick={() => toggleFilter('MIC')} colorClass="bg-teal-50 border-teal-200 text-teal-600" />
            <FilterPill label="共享屏幕" active={activeFilters.has('SCREEN')} onClick={() => toggleFilter('SCREEN')} colorClass="bg-sky-50 border-sky-200 text-sky-600" />
            <FilterPill label="从未连线" active={activeFilters.has('NEVER')} onClick={() => toggleFilter('NEVER')} colorClass="bg-amber-50 border-amber-200 text-amber-600" />
            <FilterPill label="PC端" active={activeFilters.has('PC')} onClick={() => toggleFilter('PC')} colorClass="bg-blue-50 border-blue-200 text-blue-600" />
            <FilterPill label="APP端" active={activeFilters.has('APP')} onClick={() => toggleFilter('APP')} colorClass="bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600" />
          </div>
        </div>

        <div className="flex-1 max-h-[300px] overflow-y-auto p-2 bg-gray-50/50 space-y-1">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-gray-50 p-2.5 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors group">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full bg-white border border-gray-200" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-sm ${user.isConnectedThisSession ? 'text-green-600' : 'text-gray-900'}`}>
                      {user.name}
                    </span>
                    <Video size={13} className={user.hasCam ? 'text-green-500' : 'text-gray-300'} />
                    <Mic size={13} className={user.hasMic ? 'text-green-500' : 'text-gray-300'} />
                    <Monitor size={13} className={user.canShareScreen ? 'text-green-500' : 'text-gray-300'} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-bold text-gray-500">
                    <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500" /> {user.handUpCount}</span>
                    <span className="text-gray-600">{formatScore(user.score)}分</span>
                    {user.team === 'RED' && <span className="flex items-center text-red-500"><Flag size={12} fill="currentColor" className="mr-0.5" /></span>}
                    {user.team === 'BLUE' && <span className="flex items-center text-blue-500"><Flag size={12} fill="currentColor" className="mr-0.5" /></span>}
                    <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 uppercase text-[10px]">{user.platform}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-100">
                {user.status === 'IDLE' ? (
                  <button
                    onClick={() => handleConnect(user.id)}
                    className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    连接
                  </button>
                ) : (
                  <>
                    {user.canShareScreen && (
                      <button className="px-2.5 py-1.5 bg-white text-green-600 border border-green-200 hover:bg-green-50 text-xs font-bold rounded-lg transition-colors">
                        共享屏幕
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(user.id)}
                      className="px-3.5 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
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

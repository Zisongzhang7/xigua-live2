import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    User,
    LogIn,
    LogOut,
    MessageSquare,
    CheckCircle,
    Hand,
    Filter,
    Search,
    Users,
    Vote,
    Swords, // For Debate
    Gamepad2, // For Gandi
    Link2, // For External Link (merged into Gandi/Link category)
    PlayCircle, // For Slice Enter
    Award // For Slice Complete
} from 'lucide-react';
import StudentDataList from './StudentDataList';

// Enhanced Event Types based on User Mind Map
type EventType =
    | 'ANSWER_SELECT'
    | 'DEBATE'
    | 'VOTE'
    | 'DANMAKU'
    | 'GANDI' // Includes External Links
    | 'SLICE_ENTER'
    | 'SLICE_COMPLETE'
    | 'LIVE_ENTER'
    | 'LIVE_EXIT';

interface StudentEvent {
    id: string;
    time: string;
    // Enhanced Student Info
    studentName: string;
    studentId: string;
    teamName: string;
    avatar: string;

    type: EventType;
    content?: string; // e.g. "Selected Option A", "Debate: Pro", "Danmaku content"
}

// Mock Data Generator Helpers
const TEAMS = ['红队', '蓝队', '黄队', '绿队'];
const NAMES = ['张小明', '李华', '王建国', '赵丽', '刘强', '陈静', '杨伟', '吴芳', '孙勇', '周娜'];

const generateMockEvent = (): StudentEvent => {
    const typeRoll = Math.random();
    let type: EventType = 'DANMAKU';
    let content: string | undefined = undefined;

    if (typeRoll < 0.1) type = 'LIVE_ENTER';
    else if (typeRoll < 0.15) type = 'LIVE_EXIT';
    else if (typeRoll < 0.4) {
        type = 'DANMAKU';
        const msgs = ['老师讲得真好！', '这题太难了', '选C吧？', '不懂不懂', '666'];
        content = msgs[Math.floor(Math.random() * msgs.length)];
    }
    else if (typeRoll < 0.5) {
        type = 'ANSWER_SELECT';
        content = `选择了选项 ${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`;
    }
    else if (typeRoll < 0.6) {
        type = 'VOTE';
        content = `投给了 "${['方案A', '方案B'][Math.floor(Math.random() * 2)]}"`;
    }
    else if (typeRoll < 0.7) {
        type = 'DEBATE';
        content = Math.random() > 0.5 ? '发表了正方观点' : '发表了反方观点';
    }
    else if (typeRoll < 0.8) {
        type = 'GANDI';
        content = '加入了协作项目';
    }
    else if (typeRoll < 0.9) type = 'SLICE_ENTER';
    else {
        type = 'SLICE_COMPLETE';
        content = `得分: ${80 + Math.floor(Math.random() * 20)}`;
    }

    const nameIdx = Math.floor(Math.random() * NAMES.length);

    return {
        id: Date.now().toString() + Math.random().toString(),
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        studentName: NAMES[nameIdx],
        studentId: `2024${1000 + Math.floor(Math.random() * 9000)}`,
        teamName: TEAMS[Math.floor(Math.random() * TEAMS.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nameIdx}`,
        type,
        content
    };
};

const INITIAL_EVENTS: StudentEvent[] = Array.from({ length: 10 }).map(() => generateMockEvent());

const StudentTimeStream: React.FC = () => {
    const [events, setEvents] = useState<StudentEvent[]>(INITIAL_EVENTS);
    const [activeTab, setActiveTab] = useState<'STREAM' | 'DATA'>('STREAM');

    // Filters
    const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');
    const [filterStudentId, setFilterStudentId] = useState<string>('');
    const [filterTeam, setFilterTeam] = useState<string>('ALL');

    // Simulate incoming events
    useEffect(() => {
        const timer = setInterval(() => {
            if (Math.random() > 0.6) { // Adjust frequency
                setEvents(prev => [generateMockEvent(), ...prev].slice(0, 100)); // Keep last 100
            }
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            if (filterType !== 'ALL' && event.type !== filterType) return false;
            if (filterTeam !== 'ALL' && event.teamName !== filterTeam) return false;
            if (filterStudentId && !event.studentId.includes(filterStudentId) && !event.studentName.includes(filterStudentId)) return false;
            return true;
        });
    }, [events, filterType, filterTeam, filterStudentId]);

    const getEventIcon = (type: EventType) => {
        switch (type) {
            case 'LIVE_ENTER': return <LogIn size={14} className="text-green-500" />;
            case 'LIVE_EXIT': return <LogOut size={14} className="text-gray-400" />;
            case 'DANMAKU': return <MessageSquare size={14} className="text-blue-500" />;
            case 'ANSWER_SELECT': return <CheckCircle size={14} className="text-indigo-500" />;
            case 'VOTE': return <Vote size={14} className="text-purple-500" />;
            case 'DEBATE': return <Swords size={14} className="text-orange-500" />;
            case 'GANDI': return <Gamepad2 size={14} className="text-pink-500" />;
            case 'SLICE_ENTER': return <PlayCircle size={14} className="text-cyan-500" />;
            case 'SLICE_COMPLETE': return <Award size={14} className="text-yellow-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };

    const getEventDescription = (type: EventType) => {
        switch (type) {
            case 'LIVE_ENTER': return '进入直播间';
            case 'LIVE_EXIT': return '退出直播间';
            case 'DANMAKU': return '发送弹幕';
            case 'ANSWER_SELECT': return '提交答题';
            case 'VOTE': return '参与投票';
            case 'DEBATE': return '参与辩论';
            case 'GANDI': return '进入互动';
            case 'SLICE_ENTER': return '开始切片学习';
            case 'SLICE_COMPLETE': return '完成切片';
            default: return '未知事件';
        }
    };

    const getEventTypeColor = (type: EventType) => {
        switch (type) {
            case 'LIVE_ENTER': return 'bg-green-50 text-green-700 border-green-100';
            case 'LIVE_EXIT': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'DANMAKU': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'ANSWER_SELECT': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'VOTE': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'DEBATE': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'GANDI': return 'bg-pink-50 text-pink-700 border-pink-100';
            case 'SLICE_ENTER': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
            case 'SLICE_COMPLETE': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-hidden">
            {/* Stats Panel */}
            <div className="flex items-center justify-between gap-2 p-2 border-b border-gray-100 bg-gradient-to-br from-blue-50/50 to-white flex-shrink-0">
                <div className="flex-1 bg-white px-2 py-1.5 rounded-lg border border-blue-100 shadow-sm flex items-center justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">当前在线</div>
                    <div className="text-sm font-black text-gray-900">342</div>
                </div>
                <div className="flex-1 bg-white px-2 py-1.5 rounded-lg border border-purple-100 shadow-sm flex items-center justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">本场累计</div>
                    <div className="text-sm font-black text-gray-900">1,205</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-gray-100 bg-white shrink-0">
                <button
                    onClick={() => setActiveTab('STREAM')}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-wider relative transition-colors ${activeTab === 'STREAM' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Clock size={14} className={activeTab === 'STREAM' ? "text-blue-600" : "text-gray-400"} />
                        动态流
                    </div>
                    {activeTab === 'STREAM' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
                <div className="w-px h-3 bg-gray-100"></div>
                <button
                    onClick={() => setActiveTab('DATA')}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-wider relative transition-colors ${activeTab === 'DATA' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Users size={14} className={activeTab === 'DATA' ? "text-blue-600" : "text-gray-400"} />
                        用户数据
                    </div>
                    {activeTab === 'DATA' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            {activeTab === 'STREAM' ? (
                <>
                    {/* Header & Filter Bar */}
                    <div className="p-2 border-b border-gray-100 bg-white space-y-2 flex-shrink-0 z-10">
                        {/* Filter Controls */}
                        <div className="flex gap-2 text-xs">
                            {/* Event Type Filter */}
                            <div className="relative flex-1 min-w-[100px]">
                                <select
                                    className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md appearance-none outline-none focus:border-blue-500 font-medium text-gray-700"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as EventType | 'ALL')}
                                >
                                    <option value="ALL">所有事件</option>
                                    <option value="DANMAKU">弹幕发言</option>
                                    <option value="ANSWER_SELECT">答题选择</option>
                                    <option value="VOTE">投票</option>
                                    <option value="DEBATE">辩论</option>
                                    <option value="GANDI">Gandi/外链</option>
                                    <option value="SLICE_ENTER">进入切片</option>
                                    <option value="SLICE_COMPLETE">完成切片</option>
                                    <option value="LIVE_ENTER">进入直播</option>
                                    <option value="LIVE_EXIT">退出直播</option>
                                </select>
                                <Filter size={10} className="absolute left-2 top-1.5 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Team Filter */}
                            <div className="relative w-24">
                                <select
                                    className="w-full pl-2 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md appearance-none outline-none focus:border-blue-500 font-medium text-gray-700"
                                    value={filterTeam}
                                    onChange={(e) => setFilterTeam(e.target.value)}
                                >
                                    <option value="ALL">所有战队</option>
                                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜索姓名或学号..."
                                className="w-full pl-7 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs outline-none focus:border-blue-500 transition-colors"
                                value={filterStudentId}
                                onChange={(e) => setFilterStudentId(e.target.value)}
                            />
                            <Search size={10} className="absolute left-2.5 top-1.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Event List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative">
                        {filteredEvents.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <Filter size={24} className="mb-2 opacity-20" />
                                <p className="text-xs">没有符合条件的动态</p>
                            </div>
                        ) : (
                            filteredEvents.map(event => (
                                <div key={event.id} className="group flex gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200 animate-in slide-in-from-left-2 fade-in">
                                    {/* Avatar & Icon */}
                                    <div className="flex-shrink-0 relative">
                                        <img src={event.avatar} alt={event.studentName} className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white shadow-sm" />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-50">
                                            {getEventIcon(event.type)}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-900">{event.studentName}</span>
                                                    <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1 rounded">{event.studentId}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-[9px] font-bold text-gray-500">{event.teamName}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400 shrink-0">{event.time}</span>
                                        </div>

                                        <div className="mt-1.5 flex items-start gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getEventTypeColor(event.type)}`}>
                                                {getEventDescription(event.type)}
                                            </span>
                                            {event.content && (
                                                <p className="text-xs text-gray-700 leading-snug break-all font-medium">
                                                    {event.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <StudentDataList />
            )}
        </div>
    );
};

export default StudentTimeStream;

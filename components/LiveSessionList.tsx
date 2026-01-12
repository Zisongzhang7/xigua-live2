import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, User, Image as ImageIcon } from 'lucide-react';
import { LiveSession } from '../types';

interface LiveSessionListProps {
    sessions: LiveSession[];
    onAddSession: (session: Omit<LiveSession, 'id'>) => void;
    onDeleteSession: (id: string) => void;
    onUpdateSession: (id: string, updates: Partial<LiveSession>) => void;
    selectedSessionId?: string | null;
    onSelectSession?: (id: string) => void;
}

const LiveSessionList: React.FC<LiveSessionListProps> = ({ sessions, onAddSession, onDeleteSession, onUpdateSession, selectedSessionId, onSelectSession }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSession, setNewSession] = useState<Partial<LiveSession>>({
        name: '',
        hostName: '',
        startTime: ''
    });

    // Sort sessions by start time
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const getStatus = (startTime: string) => {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (now < start) return { label: '未播', color: 'bg-gray-100 text-gray-500' };
        if (now > start + twoHours) return { label: '已播', color: 'bg-gray-100 text-gray-400' };
        return { label: '直播中', color: 'bg-green-100 text-green-600 animate-pulse' };
    };

    const handleCreate = () => {
        if (newSession.name && newSession.hostName && newSession.startTime) {
            onAddSession(newSession as Omit<LiveSession, 'id'>);
            setNewSession({ name: '', hostName: '', startTime: '' });
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                    <Calendar size={16} className="text-blue-600" />
                    直播场次设置
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1 hover:bg-blue-100"
                >
                    <Plus size={12} /> {isAdding ? '取消' : '新增场次'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">场次名称（学生端显示名称）</label>
                        <input
                            type="text"
                            className="w-full text-xs p-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                            placeholder="例如：第一场：开幕式"
                            value={newSession.name}
                            onChange={e => setNewSession({ ...newSession, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">主播/嘉宾</label>
                            <input
                                type="text"
                                className="w-full text-xs p-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="姓名"
                                value={newSession.hostName}
                                onChange={e => setNewSession({ ...newSession, hostName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">开播时间</label>
                            <input
                                type="datetime-local"
                                className="w-full text-xs p-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                                value={newSession.startTime}
                                onChange={e => setNewSession({ ...newSession, startTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">封面图片 URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 text-xs p-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="https://..."
                                value={newSession.coverUrl || ''}
                                onChange={e => setNewSession({ ...newSession, coverUrl: e.target.value })}
                            />
                            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 text-xs font-bold hover:bg-gray-200">
                                <ImageIcon size={14} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!newSession.name || !newSession.hostName || !newSession.startTime}
                        className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        确认添加
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {sortedSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        暂无场次安排
                    </div>
                ) : (
                    sortedSessions.map(session => {
                        const status = getStatus(session.startTime);
                        const isSelected = selectedSessionId === session.id;
                        return (
                            <div
                                key={session.id}
                                onClick={() => onSelectSession?.(session.id)}
                                className={`group relative bg-white border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-gray-800 truncate" title={session.name}>{session.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                                <User size={10} /> {session.hostName}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDeleteSession(session.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 border-t border-gray-50 pt-2 mt-1">
                                    <Clock size={12} className="text-gray-400" />
                                    <span className="font-mono">
                                        {new Date(session.startTime).toLocaleString('zh-CN', {
                                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LiveSessionList;

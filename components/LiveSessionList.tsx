import React, { useRef, useEffect } from 'react';
import { Clock, Trash2, Edit2, User } from 'lucide-react';
import { LiveSession, LiveType } from '../types';

interface LiveSessionListProps {
    sessions: LiveSession[];
    liveType: LiveType;
    onDeleteSession: (id: string) => void;
    onUpdateSession: (id: string, updates: Partial<LiveSession>) => void;
    selectedSessionId?: string | null;
    onSelectSession?: (id: string) => void;
    onEditSession: (session: LiveSession) => void;
    variant?: 'default' | 'nav';
}

const LiveSessionList: React.FC<LiveSessionListProps> = ({ 
    sessions, 
    liveType, 
    onDeleteSession, 
    onUpdateSession, 
    selectedSessionId, 
    onSelectSession,
    onEditSession,
    variant = 'default'
}) => {
    const hasAutoSelected = useRef(false);

    // Auto-select nearest upcoming session
    useEffect(() => {
        if (!hasAutoSelected.current && sessions.length > 0 && onSelectSession && !selectedSessionId) {
            const now = Date.now();
            const sorted = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            const upcoming = sorted.find(s => new Date(s.startTime).getTime() > now);

            if (upcoming) {
                onSelectSession(upcoming.id);
            } else if (sorted.length > 0) {
                 // If no upcoming, select the last one (most recent)
                 onSelectSession(sorted[sorted.length - 1].id);
            }
            hasAutoSelected.current = true;
        }
    }, [sessions, onSelectSession, selectedSessionId]);

    // Sort sessions by start time
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const getStatus = (startTime: string) => {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (now < start) return { label: '未播', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
        if (now > start + twoHours) return { label: '已播', color: 'bg-gray-100 text-gray-400', dot: 'bg-gray-300' };
        return { label: '直播中', color: 'bg-green-100 text-green-600 animate-pulse', dot: 'bg-green-500' };
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className={`flex flex-col ${variant === 'nav' ? 'gap-1' : 'gap-3'} flex-1 overflow-y-auto pr-1 custom-scrollbar`}>
                {sortedSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        暂无场次安排
                    </div>
                ) : (
                    sortedSessions.map(session => {
                        const status = getStatus(session.startTime);
                        const isSelected = selectedSessionId === session.id;
                        const isEnded = status.label === '已播';

                        if (variant === 'nav') {
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession?.(session.id)}
                                    className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                                        isSelected 
                                        ? 'bg-white border-blue-600/30 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10' 
                                        : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                {session.name}
                                            </h4>
                                            {isEnded && <span className="text-[10px] bg-gray-100 text-gray-400 px-1 rounded">已结束</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                                                <span className={`${isSelected ? 'text-blue-600/70' : ''} font-medium`}>
                                                    {new Date(session.startTime).toLocaleString('zh-CN', {
                                                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons (Visible on Hover or Selected) */}
                                    <div className={`flex items-center gap-1 ${isSelected || 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteSession(session.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={session.id}
                                id={`session-${session.id}`}
                                onClick={() => onSelectSession?.(session.id)}
                                className={`group relative border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer ${isSelected
                                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10'
                                    : isEnded
                                        ? 'border-gray-100 bg-gray-50/50 hover:bg-white'
                                        : 'bg-white border-gray-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className={`flex gap-3 ${isEnded ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all' : ''}`}>
                                    {/* Thumbnail (Conditional) */}
                                    {liveType === LiveType.ORDINARY && session.coverUrl && (
                                        <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                            <img src={session.coverUrl} className="w-full h-full object-cover" alt="cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-gray-800 truncate" title={session.name}>{session.name}</h4>
                                            <div className="flex gap-1 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditSession(session);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="编辑"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteSession(session.id);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="删除"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                                <User size={10} /> {session.hostName}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1.5">
                                            <Clock size={12} className="text-gray-400" />
                                            <span className="font-mono">
                                                {new Date(session.startTime).toLocaleString('zh-CN', {
                                                    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        
                                        {/* Display Config Info */}
                                        <div className="mt-2 pt-2 border-t border-gray-100/50 flex flex-wrap gap-1">
                                            {liveType === LiveType.COURSE && session.linkedLessonName && (
                                                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-full">
                                                    关联: {session.linkedLessonName}
                                                </span>
                                            )}
                                            {liveType === LiveType.ORDINARY && session.visibleAudience && session.visibleAudience.length > 0 && (
                                                 <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-full">
                                                    可见: {session.visibleAudience.slice(0, 2).join(', ')}{session.visibleAudience.length > 2 ? `...等${session.visibleAudience.length}个` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
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

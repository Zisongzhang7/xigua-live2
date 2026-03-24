import React, { useRef, useEffect, useMemo } from 'react';
import { Clock, Trash2, Edit2, User, Users, PlayCircle, Video, FileJson, BookOpen, Hash, Settings2, AlertCircle } from 'lucide-react';
import { LiveSession, LiveHistoryItem, LiveType, PlaybackMethod } from '../types';

export type UnifiedSessionItem = 
    | (LiveSession & { _type: 'upcoming' })
    | (LiveHistoryItem & { _type: 'history' });

interface UnifiedSessionListProps {
    items: UnifiedSessionItem[];
    liveType: LiveType;
    selectedSessionId?: string | null;
    selectedHistoryId?: string | null;
    onSelectSession: (id: string) => void;
    onSelectHistory: (id: string) => void;
    onDeleteSession: (id: string) => void;
    onEditSession: (session: LiveSession) => void;
    onTogglePlayback: (item: LiveHistoryItem, enable: boolean) => void;
    onConfigurePlayback: (item: LiveHistoryItem) => void;
}

export const UnifiedSessionList: React.FC<UnifiedSessionListProps> = ({
    items,
    liveType,
    selectedSessionId,
    selectedHistoryId,
    onSelectSession,
    onSelectHistory,
    onDeleteSession,
    onEditSession,
    onTogglePlayback,
    onConfigurePlayback
}) => {
    const hasAutoSelected = useRef(false);

    // Auto-select nearest upcoming session or latest history
    useEffect(() => {
        if (!hasAutoSelected.current && items.length > 0 && !selectedSessionId && !selectedHistoryId) {
            const now = Date.now();
            const upcoming = items.find(item => item._type === 'upcoming' && new Date(item.startTime).getTime() > now);

            if (upcoming) {
                onSelectSession(upcoming.id);
            } else {
                const firstItem = items[0];
                if (firstItem._type === 'upcoming') {
                    onSelectSession(firstItem.id);
                } else {
                    onSelectHistory(firstItem.id);
                }
            }
            hasAutoSelected.current = true;
        }
    }, [items, selectedSessionId, selectedHistoryId, onSelectSession, onSelectHistory]);

    // Find the index where we transition from future to past
    const separatorIndex = useMemo(() => {
        const now = Date.now();
        // Since items are sorted descending (newest first), 
        // we find the first item whose start time is in the past.
        const index = items.findIndex(item => new Date(item.startTime).getTime() <= now);
        return index;
    }, [items]);

    const getLatePolicyText = (item: UnifiedSessionItem) => {
        if (item.latePolicy === 'block') return `迟到${item.lateTime || 0}分钟禁入`;
        if (item.latePolicy === 'record') return `迟到${item.lateTime || 0}分钟记迟到`;
        return '允许随时进入';
    };

    return (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6">
            {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    暂无场次安排
                </div>
            ) : (
                items.map((item, index) => {
                    const isSelected = item._type === 'upcoming' ? selectedSessionId === item.id : selectedHistoryId === item.id;
                    
                    const start = new Date(item.startTime).getTime();
                    const now = Date.now();
                    const isBeforeStart = now < start;
                    const broadcastCount = item._type === 'history' ? 1 : 0;

                    let cardClasses = 'group relative border rounded-xl p-3 transition-all cursor-pointer flex flex-col gap-2 ';
                    if (isSelected) {
                        cardClasses += 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 shadow-md';
                    } else if (isBeforeStart) {
                        cardClasses += 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md';
                    } else {
                        // Past sessions - gray background
                        cardClasses += 'bg-gray-50/80 border-gray-200 hover:border-gray-300 opacity-90 hover:opacity-100';
                    }

                    // Determine if we need to render the current time separator BEFORE this item
                    const renderSeparator = index === separatorIndex && separatorIndex !== -1;

                    return (
                        <React.Fragment key={`${item._type}-${item.id}`}>
                            {renderSeparator && (
                                <div className="flex items-center gap-3 my-2 opacity-60">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-300"></div>
                                    <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Clock size={10} /> 当前时间
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-300"></div>
                                </div>
                            )}
                            
                            <div
                                onClick={() => {
                                    if (item._type === 'upcoming') {
                                        onSelectSession(item.id);
                                    } else {
                                        onSelectHistory(item.id);
                                    }
                                }}
                                className={cardClasses}
                            >
                                {/* 1. 计划开播时间 (Elevated) & 场次名称 */}
                                <div className="flex flex-col gap-1.5 mb-1">
                                    {/* 开播时间层级提升，作为最醒目的元素 */}
                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center gap-1.5 font-black text-sm ${isBeforeStart ? 'text-blue-600' : 'text-gray-500'}`}>
                                            <Clock size={14} />
                                            <span>
                                                {new Date(item.startTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                        
                                        {/* 统一操作栏 (Hover/Selected 态显示) */}
                                        <div className={`flex items-center gap-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            {isBeforeStart ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditSession(item);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="编辑"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteSession(item.id);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="删除"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {/* 回放开关 */}
                                                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm" onClick={e => e.stopPropagation()}>
                                                        <span className={`text-[10px] font-bold ${(item as LiveHistoryItem).hasPlayback ? 'text-blue-600' : 'text-gray-400'}`}>
                                                            回放
                                                        </span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={!!(item as LiveHistoryItem).hasPlayback}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        if (!(item as LiveHistoryItem).playbackMethod) {
                                                                            onConfigurePlayback(item as LiveHistoryItem);
                                                                        } else {
                                                                            onTogglePlayback(item as LiveHistoryItem, true);
                                                                        }
                                                                    } else {
                                                                        onTogglePlayback(item as LiveHistoryItem, false);
                                                                    }
                                                                }}
                                                            />
                                                            <div className="w-6 h-3 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                    
                                                    {/* 回放配置按钮 */}
                                                    {(item as LiveHistoryItem).hasPlayback && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onConfigurePlayback(item as LiveHistoryItem); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors bg-white border border-gray-100 shadow-sm"
                                                            title="配置回放"
                                                        >
                                                            <Settings2 size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <h4 className={`font-bold text-[13px] truncate ${isBeforeStart ? 'text-gray-800' : 'text-gray-600'}`} title={item.name}>
                                        {item.name}
                                    </h4>
                                </div>

                                {/* Info Section */}
                                <div className="flex flex-col gap-1.5 mt-1">
                                    {/* 关联课节单独一行 */}
                                    {liveType === LiveType.COURSE && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50/50 p-1.5 rounded-md border border-gray-100/50">
                                            <BookOpen size={12} className="text-gray-400 shrink-0" />
                                            <span className="truncate" title={item.linkedLessonName || (item as LiveHistoryItem).lessonName || '未关联'}>
                                                {item.linkedLessonName || (item as LiveHistoryItem).lessonName || '未关联'}
                                            </span>
                                        </div>
                                    )}

                                    {/* 其他信息：主播、开播次数、迟到设置 */}
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px] text-gray-500">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <User size={12} className="text-gray-400 shrink-0" />
                                            <span className="truncate" title={item.hostName || '暂无主播'}>{item.hostName || '暂无主播'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Hash size={12} className="text-gray-400 shrink-0" />
                                            <span>开播次数: {broadcastCount}次</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 truncate col-span-2">
                                            <AlertCircle size={12} className="text-gray-400 shrink-0" />
                                            <span className="truncate" title={getLatePolicyText(item)}>
                                                {getLatePolicyText(item)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })
            )}
        </div>
    );
};

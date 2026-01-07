
import React, { useState, useEffect } from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Clock,
    ChevronDown,
    Layers,
    FileVideo,
    FileText,
    HelpCircle,
    CheckCircle2,
    Users
} from 'lucide-react';

export type SliceListStatus = 'IDLE' | 'ACTIVE' | 'USED';

export interface SliceItem {
    id: string;
    type: 'VIDEO' | 'QUIZ' | 'TEXT' | 'OTHER';
    title: string;
    duration?: string;
}

export interface SliceListCardProps {
    id: string;
    title: string;
    className?: string; // e.g. "高一(3)班"
    lessonName?: string; // e.g. "Unit 3 Conservation"
    slices?: SliceItem[];
    onDelete: () => void;
    dragHandle?: React.ReactNode;
    time?: string;

    // Controlled State
    status: SliceListStatus;
    isExpanded: boolean;

    // Callbacks
    onStatusChange: (status: SliceListStatus) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

export const SliceListCard: React.FC<SliceListCardProps> = ({
    id,
    title,
    className = '默认班级',
    lessonName = '未命名课节',
    slices = [],
    onDelete,
    dragHandle,
    time,
    status,
    isExpanded,
    onStatusChange,
    onExpandChange,
    isReadOnly = false
}) => {
    // Internal state to track which slice is currently "pushed" to students
    const [activeSliceId, setActiveSliceId] = useState<string | null>(null);
    // Mock completion stats: sliceId -> count
    const [completionStats, setCompletionStats] = useState<Record<string, number>>({});

    // Auto-expand on start
    const handleStartClass = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    const handleEndClass = () => {
        onStatusChange('USED');
        onExpandChange(false);
        setActiveSliceId(null);
    };

    const handleRestartClass = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
        setActiveSliceId(null);
        setCompletionStats({});
    };

    const toggleSlice = (sliceId: string) => {
        if (activeSliceId === sliceId) {
            // Close active slice
            setActiveSliceId(null);
        } else {
            // Open new slice
            setActiveSliceId(sliceId);
            // Reset stats for new slice (mock)
            setCompletionStats(prev => ({ ...prev, [sliceId]: 0 }));
        }
    };

    // Simulate real-time completion updates when a slice is active
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeSliceId) {
            interval = setInterval(() => {
                setCompletionStats(prev => ({
                    ...prev,
                    [activeSliceId]: Math.min((prev[activeSliceId] || 0) + Math.floor(Math.random() * 3), 45) // Mock max 45 students
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSliceId]);

    const getSliceIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <FileVideo size={14} />;
            case 'QUIZ': return <HelpCircle size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const getSliceTypeLabel = (type: string) => {
        switch (type) {
            case 'VIDEO': return '视频';
            case 'QUIZ': return '练习';
            case 'TEXT': return '图文';
            default: return '其它';
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
            {/* Header */}
            <div
                className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 cursor-pointer hover:bg-gray-50/80 transition-colors select-none"
                onClick={() => onExpandChange(!isExpanded)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {dragHandle && (
                        <div className="mr-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                            {dragHandle}
                        </div>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Layers size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">切片课资源</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title || '未命名资源'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{className}</span>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{lessonName}</span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                    {status === 'IDLE' ? (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            未开始
                        </span>
                    ) : status === 'USED' ? (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full border border-gray-300">
                            已结束
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">
                                上课中
                            </span>
                        </div>
                    )}
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-4">
                    {status === 'ACTIVE' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">切片列表 ({slices.length})</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {activeSliceId ? '正在推送内容' : '等待推送'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {slices.length > 0 ? slices.map(slice => {
                                    const isActive = activeSliceId === slice.id;
                                    return (
                                        <div
                                            key={slice.id}
                                            className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${isActive
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {getSliceIcon(slice.type)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                                                            {slice.title}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {getSliceTypeLabel(slice.type)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleSlice(slice.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive
                                                        ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                                                        }`}
                                                >
                                                    {isActive ? '结束' : '开启'}
                                                </button>
                                            </div>

                                            {/* Completion Stats Area */}
                                            {isActive && (
                                                <div className="mt-1 pt-2 border-t border-blue-100/50 flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center gap-1.5 text-blue-600">
                                                        <Users size={12} />
                                                        <span className="text-[10px] font-bold">已完成人数</span>
                                                    </div>
                                                    <span className="text-sm font-black text-blue-700 font-mono">
                                                        {completionStats[slice.id] || 0} <span className="text-[10px] text-blue-400 font-normal">人</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-6 text-gray-300 text-xs font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        暂无切片内容
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // IDLE or USED State Display
                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center text-gray-500 pb-2 border-b border-gray-200/50">
                                <span className="text-xs font-bold">课程信息概览</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">班级</span>
                                    <span className="text-sm font-bold text-gray-800">{className}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">课节</span>
                                    <span className="text-sm font-bold text-gray-800">{lessonName}</span>
                                </div>
                            </div>
                            <div className="pt-2">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">包含切片</span>
                                <div className="flex flex-wrap gap-1">
                                    {slices.slice(0, 3).map((s, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 bg-white border border-gray-200 rounded text-gray-500">
                                            {s.title}
                                        </span>
                                    ))}
                                    {slices.length > 3 && <span className="text-[10px] px-2 py-1 text-gray-400">+{slices.length - 3}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex gap-2">
                    {status === 'IDLE' && (
                        <ActionBtn onClick={handleStartClass} variant="primary" icon={<Play size={14} fill="currentColor" />}>开启课程</ActionBtn>
                    )}

                    {status === 'ACTIVE' && (
                        <ActionBtn onClick={handleEndClass} variant="secondary" icon={<XCircle size={14} />}>下课结算</ActionBtn>
                    )}

                    {status === 'USED' && (
                        <ActionBtn onClick={handleRestartClass} variant="primary" icon={<Play size={14} />}>重新上课</ActionBtn>
                    )}
                </div>

                {!isReadOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

// UI Helper
const ActionBtn = ({ onClick, variant, icon, children }: any) => {
    const getStyles = () => {
        switch (variant) {
            case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 hover:shadow-blue-200';
            default: return 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-100';
        }
    }

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${getStyles()}`}
        >
            {icon} {children}
        </button>
    )
};

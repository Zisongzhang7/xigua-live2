
import React from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Clock,
    ChevronDown,
    Gamepad2,
    MonitorPlay,
    ExternalLink
} from 'lucide-react';

export type GandiStatus = 'IDLE' | 'ACTIVE' | 'USED';

export interface GandiCardProps {
    id: string;
    title: string;
    projectId?: string; // From config.projectId
    onDelete: () => void;
    dragHandle?: React.ReactNode;
    time?: string;

    // Controlled State
    status: GandiStatus;
    isExpanded: boolean;

    // Callbacks
    onStatusChange: (status: GandiStatus) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

export const GandiCard: React.FC<GandiCardProps> = ({
    id,
    title,
    projectId,
    onDelete,
    dragHandle,
    time,
    status,
    isExpanded,
    onStatusChange,
    onExpandChange,
    isReadOnly = false
}) => {

    const handleStart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    const handleClose = () => {
        onStatusChange('USED');
        onExpandChange(false);
    };

    const handleRestart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-purple-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
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
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Gamepad2 size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Gandi 内嵌</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title || '未命名作品'}</h3>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                    {status === 'IDLE' ? (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            未开启
                        </span>
                    ) : status === 'USED' ? (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full border border-gray-300">
                            已结束
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">
                                运行中
                            </span>
                        </div>
                    )}
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-4">
                    {status === 'IDLE' && (
                        <div className="flex flex-col gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-900">
                                <MonitorPlay size={16} />
                                <span className="text-xs font-bold">作品预览</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-purple-700 truncate">{title}</span>
                                {projectId && <span className="text-[10px] font-bold text-purple-400 font-mono">ID: {projectId}</span>}
                            </div>
                            <div className="w-full h-32 bg-purple-100/50 rounded-lg flex flex-col items-center justify-center text-purple-300 gap-2 border border-purple-100 border-dashed">
                                <Gamepad2 size={24} />
                                <span className="text-[10px] font-bold">Gandi 作品封面占位</span>
                            </div>
                        </div>
                    )}

                    {status === 'ACTIVE' && (
                        <div className="flex flex-col gap-3 p-4 bg-green-50 rounded-xl border border-green-100 relative overflow-hidden">
                            {/* Background Decoration */}
                            <Gamepad2 className="absolute -right-4 -bottom-4 text-green-100 w-32 h-32 rotate-12" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2 text-green-800">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider">正在投放中</span>
                                </div>
                                <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-800 transition-colors">
                                    <ExternalLink size={10} /> 打开控制台
                                </a>
                            </div>

                            <div className="flex flex-col gap-1 relative z-10 mt-2">
                                <span className="text-lg font-black text-green-900 leading-tight">{title}</span>
                                <span className="text-[10px] font-bold text-green-600">作品 ID: {projectId || 'Unknown'}</span>
                            </div>
                        </div>
                    )}

                    {status === 'USED' && (
                        <div className="flex items-center justify-center p-8 text-gray-300 flex-col gap-2 border border-dashed border-gray-100 rounded-xl">
                            <span className="text-xs font-bold">本次投放已结束</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex gap-2">
                    {status === 'IDLE' && (
                        <ActionBtn onClick={handleStart} variant="primary" icon={<Play size={14} fill="currentColor" />}>开启作品</ActionBtn>
                    )}

                    {status === 'ACTIVE' && (
                        <ActionBtn onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>关闭作品</ActionBtn>
                    )}

                    {status === 'USED' && (
                        <ActionBtn onClick={handleRestart} variant="primary" icon={<Play size={14} />}>重新开启</ActionBtn>
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
            case 'primary': return 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100 hover:shadow-purple-200';
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

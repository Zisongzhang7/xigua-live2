
import React, { useState } from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Clock,
    ChevronDown,
    Cuboid, // Icon for Model
    Box,
    Eye,
    ZoomIn,
    MonitorPlay,
    Move3d
} from 'lucide-react';

export type ModelStatus = 'IDLE' | 'ACTIVE' | 'USED';

export interface ModelView {
    id: string;
    name: string;
}

export interface ModelCardProps {
    id: string;
    title: string;
    coverUrl?: string;
    views?: ModelView[]; // Custom views configuration
    onDelete: () => void;
    dragHandle?: React.ReactNode;
    time?: string;

    // Controlled State
    status: ModelStatus;
    isExpanded: boolean;

    // Callbacks
    onStatusChange: (status: ModelStatus) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
    id,
    title,
    coverUrl,
    views = [],
    onDelete,
    dragHandle,
    time,
    status,
    isExpanded,
    onStatusChange,
    onExpandChange,
    isReadOnly = false
}) => {
    const [activeViewId, setActiveViewId] = useState<string>('default');

    const handleStart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    const handleClose = () => {
        onStatusChange('USED');
        onExpandChange(false);
        setActiveViewId('default');
    };

    const handleRestart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    const handleViewChange = (viewId: string) => {
        setActiveViewId(viewId);
        // In a real app, this would trigger an event to the model viewer engine
        console.log(`Switching model ${id} to view: ${viewId}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-orange-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
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
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Cuboid size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">3D 模型</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title || '未命名模型'}</h3>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                    {status === 'IDLE' ? (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            未开启
                        </span>
                    ) : status === 'USED' ? (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full border border-gray-300">
                            已展示
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">
                                展示中
                            </span>
                        </div>
                    )}
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-4">
                    {status === 'IDLE' && (
                        <div className="flex flex-col gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="flex items-center gap-2 text-orange-900">
                                <Box size={16} />
                                <span className="text-xs font-bold">模型预览</span>
                            </div>

                            <div className="w-full h-32 bg-orange-100/50 rounded-lg flex flex-col items-center justify-center text-orange-300 gap-2 border border-orange-100 border-dashed relative overflow-hidden group/preview">
                                {coverUrl ? (
                                    <img src={coverUrl} alt="Model cover" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/preview:opacity-80 transition-opacity" />
                                ) : (
                                    <Move3d size={32} className="animate-pulse" />
                                )}
                                <span className="text-[10px] font-bold relative z-10">{coverUrl ? '' : '3D 模型占位符'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-orange-700 truncate">{title}</span>
                                <span className="text-[10px] font-bold text-orange-400">{views.length > 0 ? `${views.length} 个预设视角` : '标准视角'}</span>
                            </div>
                        </div>
                    )}

                    {status === 'ACTIVE' && (
                        <div className="space-y-4">
                            {/* Status Indicator */}
                            <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 text-green-800">
                                    <MonitorPlay size={14} />
                                    <span className="text-xs font-bold">模型正在投放中...</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-green-600">Live</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">模型控制</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlBtn
                                        active={activeViewId === 'default'}
                                        onClick={() => handleViewChange('default')}
                                        icon={<Eye size={14} />}
                                    >
                                        默认视角
                                    </ControlBtn>
                                    <ControlBtn
                                        active={activeViewId === 'zoom'}
                                        onClick={() => handleViewChange('zoom')}
                                        icon={<ZoomIn size={14} />}
                                    >
                                        近距离
                                    </ControlBtn>
                                </div>
                                {views.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50 border-dashed">
                                        {views.map(view => (
                                            <ControlBtn
                                                key={view.id}
                                                active={activeViewId === view.id}
                                                onClick={() => handleViewChange(view.id)}
                                                icon={<Move3d size={14} />}
                                            >
                                                {view.name}
                                            </ControlBtn>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'USED' && (
                        <div className="flex items-center justify-center p-6 text-gray-300 flex-col gap-2 border border-dashed border-gray-100 rounded-xl">
                            <Cuboid size={24} className="opacity-50" />
                            <span className="text-xs font-bold">模型展示已结束</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className={`mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30 ${isReadOnly ? 'opacity-80' : ''}`}>
                <div className="flex gap-2">
                    {status === 'IDLE' && (
                        <ActionBtn onClick={handleStart} variant="primary" icon={<Play size={14} fill="currentColor" />}>开启模型</ActionBtn>
                    )}

                    {status === 'ACTIVE' && (
                        <ActionBtn onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>关闭模型</ActionBtn>
                    )}

                    {status === 'USED' && (
                        <ActionBtn onClick={handleRestart} variant="primary" icon={<Play size={14} />}>重新展示</ActionBtn>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

// UI Helpers
const ActionBtn = ({ onClick, variant, icon, children }: any) => {
    const getStyles = () => {
        switch (variant) {
            case 'primary': return 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100 hover:shadow-orange-200';
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

const ControlBtn = ({ active, onClick, icon, children }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${active
            ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-100 ring-2 ring-orange-100'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
            }`}
    >
        {icon} {children}
    </button>
);

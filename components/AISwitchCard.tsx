
import React, { useState } from 'react';
import {
    Power,
    Settings2,
    Bot,
    Monitor,
    Maximize2,
    Minimize2,
    Network,
    Trash2
} from 'lucide-react';
import { SearchableSelector } from './LiveSetupComponents';

export type AISwitchStatus = 'IDLE' | 'ACTIVE' | 'USED';

export interface AISwitchCardProps {
    id: string;
    onDelete: () => void;
    dragHandle?: React.ReactNode;

    // Controlled Props
    status: AISwitchStatus;
    config?: {
        agentId?: string;
        displayMode?: 'LARGE' | 'SMALL' | 'IP';
    };

    // Callbacks
    onStatusChange: (status: AISwitchStatus) => void;
    onConfigChange: (config: any) => void;
    isReadOnly?: boolean;
}

const MOCK_AGENTS = [
    '数学辅导 Agent',
    '物理实验助手',
    '英语口语陪练',
    '全科答疑机器人',
    '课堂氛围调解员'
];

const DISPLAY_MODES = [
    { id: 'LARGE', label: '大窗模式', icon: <Maximize2 size={14} /> },
    { id: 'SMALL', label: '小窗模式', icon: <Minimize2 size={14} /> },
    { id: 'IP', label: 'IP 模式', icon: <Network size={14} /> }
];

export const AISwitchCard: React.FC<AISwitchCardProps> = ({
    id,
    onDelete,
    dragHandle,
    status,
    config = { agentId: undefined, displayMode: undefined }, // Fix default value
    onStatusChange,
    onConfigChange,
    isReadOnly = false
}) => {
    const [selectedAgent, setSelectedAgent] = useState(config.agentId || MOCK_AGENTS[0]);
    const [displayMode, setDisplayMode] = useState<'LARGE' | 'SMALL' | 'IP'>((config.displayMode as any) || 'LARGE');

    const handleUpdateConfig = (updates: any) => {
        onConfigChange({
            agentId: selectedAgent,
            displayMode: displayMode,
            ...updates
        });
    };

    const handleAgentChange = (agent: string) => {
        setSelectedAgent(agent);
        handleUpdateConfig({ agentId: agent });
    };

    const handleModeChange = (mode: 'LARGE' | 'SMALL' | 'IP') => {
        setDisplayMode(mode);
        handleUpdateConfig({ displayMode: mode });
    };

    const toggleStatus = () => {
        if (status === 'ACTIVE') {
            onStatusChange('IDLE'); // Or USED if strictly one-time, but switches are usually toggleable
        } else {
            onStatusChange('ACTIVE');
        }
    };

    const isActive = status === 'ACTIVE';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden group flex flex-col ${isActive ? 'border-purple-300 shadow-purple-100 ring-4 ring-purple-50' : 'border-gray-200 hover:shadow-md hover:border-purple-200'}`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b flex justify-between items-center select-none ${isActive ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50/30 border-gray-50'}`}>
                <div className="flex items-center gap-3">
                    {dragHandle && (
                        <div className="mr-1 flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                            {dragHandle}
                        </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-purple-100 text-purple-600'}`}>
                        <Bot size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">AI 助手</span>
                            {isActive && <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">AI 开关控制</h3>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {isActive ? '运行中' : '已就绪'}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            title="移除此开关"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
                {/* Agent Selection */}
                <SearchableSelector
                    label="选择智能体 (Agent)"
                    icon={<Bot size={14} />}
                    value={selectedAgent}
                    options={MOCK_AGENTS}
                    onChange={handleAgentChange}
                />

                {/* Display Mode Selection */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">显示模式</label>
                    <div className="grid grid-cols-3 gap-2">
                        {DISPLAY_MODES.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => handleModeChange(mode.id as any)}
                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${displayMode === mode.id
                                    ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold ring-1 ring-purple-200'
                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                            >
                                {mode.icon}
                                <span className="text-xs">{mode.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={`px-5 py-4 border-t border-gray-50 bg-gray-50/30 flex justify-end ${isReadOnly ? 'opacity-80' : ''}`}>
                <button
                    onClick={toggleStatus}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 ${isActive
                        ? 'bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-100' // Stop style
                        : 'bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300' // Start style
                        }`}
                >
                    <Power size={14} />
                    {isActive ? '关闭 AI 助手' : '开启 AI 助手'}
                </button>
            </div>
        </div>
    );
};

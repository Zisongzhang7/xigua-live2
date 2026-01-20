
import React, { useEffect } from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Users,
    BarChart2,
    Clock,
    ChevronDown
} from 'lucide-react';

export type VoteStatus = 'IDLE' | 'ACTIVE' | 'USED';

export interface VoteCardProps {
    id: string;
    title: string;
    onDelete: () => void;
    mockOptions?: { id: string; name?: string; label?: string }[];
    dragHandle?: React.ReactNode;
    time?: string;

    // Controlled Props (Passed from Parent)
    status: VoteStatus;
    votes: Record<string, number>;
    isExpanded: boolean;

    // Callbacks to update Parent
    onStatusChange: (status: VoteStatus) => void;
    onVotesUpdate: (votes: Record<string, number>) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

const DEFAULT_MOCK_OPTIONS: { id: string; name?: string; label?: string }[] = [
    { id: '1', name: '方案 A' },
    { id: '2', name: '方案 B' },
    { id: '3', name: '方案 C' }
];

export const VoteCard: React.FC<VoteCardProps> = ({
    id,
    title,
    onDelete,
    mockOptions = DEFAULT_MOCK_OPTIONS,
    dragHandle,
    time,
    status,
    votes,
    isExpanded,
    onStatusChange,
    onVotesUpdate,
    onExpandChange,
    isReadOnly = false
}) => {
    const totalVotes = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);

    // Initialize votes if empty
    useEffect(() => {
        if (Object.keys(votes).length === 0 && status === 'IDLE') {
            const initialVotes: Record<string, number> = {};
            mockOptions.forEach(o => initialVotes[o.id] = 0);
        }
    }, [mockOptions]);

    // Simulate incoming votes when ACTIVE
    useEffect(() => {
        let interval: any;
        if (status === 'ACTIVE') {
            interval = setInterval(() => {
                const randomOption = mockOptions[Math.floor(Math.random() * mockOptions.length)];
                // specific logic for vote simulation maybe simpler or same as quiz
                const newVotes = { ...votes, [randomOption.id]: (votes[randomOption.id] || 0) + 1 };
                onVotesUpdate(newVotes);
            }, 600); // Slightly faster for voting maybe?
        }
        return () => clearInterval(interval);
    }, [status, mockOptions, votes, onVotesUpdate]);

    const handleStart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
    };

    const handleClose = () => {
        onStatusChange('USED');
        onExpandChange(false);
    };

    const handleRestart = () => {
        const initialVotes: Record<string, number> = {};
        mockOptions.forEach(o => initialVotes[o.id] = 0);
        onVotesUpdate(initialVotes);

        onStatusChange('ACTIVE');
        onExpandChange(true);
    }

    // Calculate winner for highlighting (optional, helps read charts)
    const maxVotes = Math.max(...(Object.values(votes) as number[]));

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-purple-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
            {/* Card Header - Clickable for toggle */}
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
                        <BarChart2 size={16} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">投票</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title}</h3>
                    </div>
                </div>

                {/* Right Side: Status Badge & Toggle Icon */}
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
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                                <Users size={12} /> {totalVotes}
                            </span>
                        </div>
                    )}

                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Card Body - Collapsible Options */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-3">
                    {mockOptions.map((option, index) => {
                        const voteCount = votes[option.id] || 0;
                        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                        const isLeader = status !== 'IDLE' && totalVotes > 0 && voteCount === maxVotes;
                        const displayLabel = String.fromCharCode(65 + index); // Convert 0->A, 1->B...

                        return (
                            <div key={option.id} className="relative group/option">
                                {/* Progress Bar Background */}
                                {(status === 'ACTIVE' || status === 'USED') && (
                                    <div className="absolute inset-0 bg-gray-50 rounded-lg overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ease-out opacity-20 ${isLeader ? 'bg-purple-600' : 'bg-gray-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                )}

                                <div className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${status === 'IDLE'
                                    ? 'border-gray-100 bg-white hover:border-purple-300 hover:shadow-sm'
                                    : isLeader
                                        ? 'border-purple-200 bg-purple-50/10'
                                        : 'border-transparent bg-transparent'
                                    }`}>
                                    <div className="flex items-center gap-3 z-10 overflow-hidden">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black transition-all duration-300 shrink-0 ${status === 'IDLE'
                                            ? 'bg-gray-100 text-gray-400 group-hover/option:bg-purple-600 group-hover/option:text-white'
                                            : isLeader
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-200 scale-105'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {displayLabel}
                                        </div>
                                        <span className={`text-sm font-bold truncate transition-colors ${isLeader ? 'text-purple-900' : 'text-gray-700'}`}>
                                            {option.name || option.label}
                                        </span>
                                    </div>

                                    {(status === 'ACTIVE' || status === 'USED') && (
                                        <div className="flex items-center gap-2 z-10 shrink-0 animate-in fade-in">
                                            <span className={`text-xs font-bold tabular-nums ${isLeader ? 'text-purple-700' : 'text-gray-600'}`}>
                                                {voteCount} 票
                                            </span>
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded tabular-nums ${isLeader ? 'bg-purple-200 text-purple-800' : 'bg-white/60 text-gray-500'}`}>
                                                {percentage}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Card Footer Actions - Always Visible */}
            <div className={`mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30 ${isReadOnly ? 'opacity-80' : ''}`}>
                <div className="flex gap-2">
                    {status === 'IDLE' || status === 'USED' ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); status === 'USED' ? handleRestart() : handleStart(); }}
                            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-purple-100 hover:shadow-purple-200 active:scale-95"
                        >
                            <Play size={14} fill="currentColor" /> {status === 'USED' ? '重新投票' : '开启投票'}
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-black transition-all active:scale-95"
                        >
                            <XCircle size={14} /> 结束投票
                        </button>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                    title="删除此交互"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

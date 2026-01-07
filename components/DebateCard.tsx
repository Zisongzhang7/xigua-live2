import React, { useEffect, useState } from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Users,
    TrendingUp,
    Clock,
    ChevronDown,
    MessageSquare,
    Swords,
    Trophy,
    BarChart,
    Eye,
    EyeOff,
    UserCheck,
    MonitorPlay
} from 'lucide-react';

export type DebateStatus = 'IDLE' | 'PHASE1' | 'PHASE2' | 'PHASE3' | 'USED';

export interface DebateCardProps {
    id: string;
    title: string; // From config.title
    proView: string; // From config.pro.view
    conView: string; // From config.con.view
    time?: string;
    onDelete: () => void;
    dragHandle?: React.ReactNode;

    // Controlled State
    status: DebateStatus;
    votes: { pro: number; con: number };
    isExpanded: boolean;

    // Callbacks
    onStatusChange: (status: DebateStatus) => void;
    onVotesUpdate: (votes: { pro: number; con: number }) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

const MOCK_MVP_LIST = [
    { rank: 1, name: 'User_9527', pullRate: '85%' },
    { rank: 2, name: 'Alice_Wonder', pullRate: '72%' },
    { rank: 3, name: 'Bob_Builder', pullRate: '68%' },
];

export const DebateCard: React.FC<DebateCardProps> = ({
    id,
    title,
    proView,
    conView,
    time,
    onDelete,
    dragHandle,
    status,
    votes,
    isExpanded,
    onStatusChange,
    onVotesUpdate,
    onExpandChange,
    isReadOnly = false
}) => {
    // Local toggles for Phase 2 & 3
    const [allowVoteChange, setAllowVoteChange] = useState(true);
    const [showMainPage, setShowMainPage] = useState(true);
    const [showStageResult, setShowStageResult] = useState(true);

    // User 5: Local state for selected user in MVP list
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // Initialize votes if empty & Ensure animation trigger
    useEffect(() => {
        // User 1 & 2: Fix delayed mock data and NaN by defaulting immediately if undefined or empty
        const hasValidVotes = votes && typeof votes.pro === 'number' && typeof votes.con === 'number';
        if (status === 'PHASE1' && !hasValidVotes) {
            // Force an update to ensure data is present for rendering
            onVotesUpdate({ pro: 0, con: 0 });
        }
    }, [status, votes]);

    // Simulate Voting in Phase 1 & 2
    useEffect(() => {
        let interval: any;
        if (status === 'PHASE1' || status === 'PHASE2') {
            if (status === 'PHASE2' && !allowVoteChange) return; // Stop updates if vote change disabled

            interval = setInterval(() => {
                // Randomly increment pro or con
                const isPro = Math.random() > 0.45; // Slight bias just for fun
                const currentPro = typeof votes?.pro === 'number' ? votes.pro : 0;
                const currentCon = typeof votes?.con === 'number' ? votes.con : 0;

                onVotesUpdate({
                    pro: currentPro + (isPro ? 1 : 0),
                    con: currentCon + (!isPro ? 1 : 0)
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [status, allowVoteChange, votes, onVotesUpdate]);

    // User 2: Safe calculation to avoid NaN
    const safeVotes = {
        pro: typeof votes?.pro === 'number' ? votes.pro : 0,
        con: typeof votes?.con === 'number' ? votes.con : 0
    };
    const totalVotes = safeVotes.pro + safeVotes.con;
    const proPercent = totalVotes > 0 ? Math.round((safeVotes.pro / totalVotes) * 100) : 50;
    const conPercent = 100 - proPercent;

    // Handlers
    const handleStart = () => {
        onStatusChange('PHASE1');
        onExpandChange(true);
    };

    const handleRevealInitial = () => {
        onStatusChange('PHASE2');
    };

    const handleFinalSettlement = () => {
        onStatusChange('PHASE3');
    };

    const handleClose = () => {
        onStatusChange('USED');
        onExpandChange(false);
    };

    const handleRestart = () => {
        onVotesUpdate({ pro: 0, con: 0 });
        setAllowVoteChange(true);
        setShowMainPage(true);
        setShowStageResult(true);
        setSelectedUserId(null);
        onStatusChange('PHASE1');
        onExpandChange(true);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-indigo-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
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
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Swords size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">辩论</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {(status === 'PHASE1' || status === 'PHASE2') && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title || '未命名辩论'}</h3>
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
                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {status === 'PHASE1' ? '投票阶段' : status === 'PHASE2' ? '辩论中' : '结算'}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 tabular-nums">
                                <Users size={12} /> {totalVotes}
                            </span>
                        </div>
                    )}
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>

                {/* Phase: IDLE - Show Config */}
                {status === 'IDLE' && (
                    <div className="p-5 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">正方观点 (Pro)</div>
                            <p className="text-sm font-bold line-clamp-3">{proView || '暂无观点'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-900">
                            <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">反方观点 (Con)</div>
                            <p className="text-sm font-bold line-clamp-3">{conView || '暂无观点'}</p>
                        </div>
                    </div>
                )}

                {/* Phase: ACTIVE or USED - Show Visualization */}
                {(status !== 'IDLE') && (
                    <div className="p-5 space-y-6">
                        {/* 1. Vote Bar Visualization */}
                        <div className="space-y-3">
                            {/* User 3. Show Icon and Labels above progress bars */}
                            <div className="flex justify-between items-end px-1">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5 text-blue-600">
                                        <MessageSquare size={14} className="fill-current opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">正方</span>
                                    </div>
                                    <div className="text-blue-600 font-black text-2xl tabular-nums leading-none tracking-tight">{safeVotes.pro}</div>
                                </div>

                                {/* User 3: Remove center Icon and Title */}
                                <div className="flex flex-col items-center pb-1 opacity-0">
                                    {/* Spacer */}
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-red-600">
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">反方</span>
                                        <MessageSquare size={14} className="fill-current opacity-20 -scale-x-100" />
                                    </div>
                                    <div className="text-red-600 font-black text-2xl tabular-nums leading-none tracking-tight">{safeVotes.con}</div>
                                </div>
                            </div>
                            <div className="h-6 w-full flex rounded-full overflow-hidden relative">
                                <div className="h-full bg-blue-500 transition-all duration-500 flex items-center pl-2" style={{ width: `${proPercent}%` }}>
                                    {proPercent > 10 && <span className="text-[9px] font-black text-white/90">{proPercent}%</span>}
                                </div>
                                <div className="h-full bg-red-500 transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${conPercent}%` }}>
                                    {conPercent > 10 && <span className="text-[9px] font-black text-white/90">{conPercent}%</span>}
                                </div>

                                {/* Divider Line (Removed Icon per User 3) */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-white z-10"></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span className="truncate max-w-[45%] text-blue-600">{proView}</span>
                                <span className="truncate max-w-[45%] text-right text-red-600">{conView}</span>
                            </div>
                        </div>

                        {/* 2. Controls & List based on Phase */}
                        {status === 'PHASE2' && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 animate-in fade-in">
                                {/* User 4. Use switches for clearer controls */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${allowVoteChange ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-400'}`}>
                                            <UserCheck size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">允许持续投票</span>
                                    </div>
                                    <ToggleSwitch active={allowVoteChange} onClick={() => setAllowVoteChange(!allowVoteChange)} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${showMainPage ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-400'}`}>
                                            <BarChart size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">主屏幕显示投票页</span>
                                    </div>
                                    <ToggleSwitch active={showMainPage} onClick={() => setShowMainPage(!showMainPage)} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${showStageResult ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-400'}`}>
                                            {showStageResult ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">实时展示阶段结果</span>
                                    </div>
                                    <ToggleSwitch active={showStageResult} onClick={() => setShowStageResult(!showStageResult)} />
                                </div>
                            </div>
                        )}

                        {status === 'PHASE3' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
                                        <Trophy size={14} className="text-yellow-500" /> TOP 拉票榜
                                    </h4>
                                    {/* User 4. Removed toggle switch */}
                                </div>

                                {/* User 5. Removed main toggle for MVP list, always show */}
                                <div className="space-y-2">
                                    {MOCK_MVP_LIST.map((user, idx) => {
                                        const isSelected = selectedUserId === idx;
                                        return (
                                            <div key={idx} className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group/user transition-all ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-gray-100 hover:border-indigo-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700'}`}>
                                                        {user.rank}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-700">{user.name}</span>
                                                        <span className="text-[9px] font-bold text-gray-300">ID: 8832{idx}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                        {user.pullRate}
                                                    </div>
                                                    {/* User 5. Toggle selection button */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedUserId(isSelected ? null : idx); }}
                                                        className={`p-1.5 rounded-lg transition-colors ${isSelected
                                                            ? 'bg-indigo-600 text-white shadow-sm'
                                                            : 'text-gray-300 hover:text-indigo-600 hover:bg-indigo-50'
                                                            }`}
                                                        title={isSelected ? "取消展示" : "全屏展示该用户"}
                                                    >
                                                        <MonitorPlay size={14} fill={isSelected ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex gap-2">
                    {status === 'IDLE' && (
                        <ActionButton onClick={handleStart} variant="primary" icon={<Play size={14} fill="currentColor" />}>开启辩论</ActionButton>
                    )}

                    {status === 'PHASE1' && (
                        <>
                            <ActionButton onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>直接关闭</ActionButton>
                            <ActionButton onClick={handleRevealInitial} variant="primary" icon={<TrendingUp size={14} />}>公布结果 & 进入辩论</ActionButton>
                        </>
                    )}

                    {status === 'PHASE2' && (
                        <>
                            <ActionButton onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>直接关闭</ActionButton>
                            <ActionButton onClick={handleFinalSettlement} variant="primary" icon={<Trophy size={14} />}>最终结算</ActionButton>
                        </>
                    )}

                    {status === 'PHASE3' && (
                        <ActionButton onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>结束环节</ActionButton>
                    )}

                    {status === 'USED' && (
                        <ActionButton onClick={handleRestart} variant="primary" icon={<Play size={14} />}>重新开始</ActionButton>
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

// UI Helpers
const ActionButton = ({ onClick, variant, icon, children }: any) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${variant === 'primary'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-indigo-200'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-100'
            }`}
    >
        {icon} {children}
    </button>
);

const ToggleBtn = ({ label, active, onClick, icon }: any) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`flex items-center justify-center gap-2 p-2 rounded-lg text-[10px] font-bold transition-all border ${active
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
    >
        {icon} {label}
    </button>
);

const ToggleSwitch = ({ active, onClick }: any) => (
    <div
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${active ? 'bg-green-500' : 'bg-gray-300'}`}
    >
        <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
);

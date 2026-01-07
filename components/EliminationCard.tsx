
import React, { useState, useEffect } from 'react';
import {
    Play,
    XCircle,
    Trash2,
    Users,
    TrendingUp,
    Clock,
    ChevronDown,
    Trophy,
    CheckCircle2,
    XOctagon,
    ArrowRight,
    Target
} from 'lucide-react';

export type EliminationStatus = 'IDLE' | 'ACTIVE' | 'USED';

// Phase within a single question
export type QuestionPhase = 'ANSWERING' | 'REVEALED' | 'RESULT';

export interface EliminationCardProps {
    id: string;
    title: string;
    onDelete: () => void;
    dragHandle?: React.ReactNode;
    time?: string;

    // Configuration from Resource
    questions?: {
        id: string;
        topic: string;
        options: { id: string; name: string }[];
        correct: string; // '1', '2', etc. (1-based index string)
    }[];
    mode?: string; // '错误淘汰' or '最大错误数'

    // Controlled State
    status: EliminationStatus;

    // Logic State (Managed internally or passed down if strictly controlled, 
    // but for this mock level we often manage simulation internally or lift it up. 
    // Given the previous pattern, we might want to keep some internal for simulation simplicity
    // or lift it. Let's stick to internal simulation for the complex multi-stage logic 
    // not to clutter the parent too much, unless required.)
    // Actually, looking at QuizCard, 'votes' is passed in. 
    // For this complex multi-stage, I'll keep the stage logic internal 
    // but expose the main status 'ACTIVE'/'USED'.

    isExpanded: boolean;
    onStatusChange: (status: EliminationStatus) => void;
    onExpandChange: (expanded: boolean) => void;
    isReadOnly?: boolean;
}

export const EliminationCard: React.FC<EliminationCardProps> = ({
    id,
    title,
    questions = [],
    onDelete,
    dragHandle,
    time,
    status,
    isExpanded,
    onStatusChange,
    onExpandChange,
    isReadOnly = false
}) => {
    // --- Internal State for Game Logic ---
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [qPhase, setQPhase] = useState<QuestionPhase>('ANSWERING');

    // Mock Data State
    const [survivors, setSurvivors] = useState(1280); // Start with a crowd
    const [eliminated, setEliminated] = useState(0);
    const [votes, setVotes] = useState<Record<string, number>>({}); // { '0': count, '1': count } (0-based index for options)

    const currentQuestion = questions[currentQIndex];
    if (!currentQuestion) return null; // Should not happen if data is valid

    // --- Effects ---

    // 1. Reset when starting fresh
    useEffect(() => {
        if (status === 'IDLE') {
            setCurrentQIndex(0);
            setQPhase('ANSWERING');
            setSurvivors(1280);
            setEliminated(0);
            setVotes({});
        }
    }, [status]);

    // 2. Simulate Voting during 'ANSWERING' phase
    useEffect(() => {
        let interval: any;
        if (status === 'ACTIVE' && qPhase === 'ANSWERING') {
            interval = setInterval(() => {
                const numOptions = currentQuestion.options.length;
                const randomOptIndex = Math.floor(Math.random() * numOptions);
                setVotes(prev => ({
                    ...prev,
                    [randomOptIndex]: (prev[randomOptIndex] || 0) + Math.floor(Math.random() * 5) + 1
                }));
            }, 600);
        }
        return () => clearInterval(interval);
    }, [status, qPhase, currentQuestion]);

    // --- Handlers ---

    const handleStart = () => {
        onStatusChange('ACTIVE');
        onExpandChange(true);
        setCurrentQIndex(0);
        setQPhase('ANSWERING');
        setVotes({});
    };

    const handlePublishAnswer = () => {
        setQPhase('REVEALED');
    };

    const handleRevealResult = () => {
        // Calculate eliminations mock logic
        // Identify correct index (config uses 1-based string, e.g., "1")
        const correctIndex = parseInt(currentQuestion.correct) - 1;

        // Sum wrong votes
        let wrongVotes = 0;
        Object.keys(votes).forEach(key => {
            if (parseInt(key) !== correctIndex) {
                wrongVotes += votes[key];
            }
        });

        // In a real app we'd know exactly WHO voted what. 
        // Here we simulate that roughly 30% of existing survivors got it wrong (or use vote counts if they align)
        // Let's just assume the 'votes' we generated are a sample and scale impact, 
        // or just apply a "survival rate".

        // Simpler: Just cut survivors by a percentage for drama
        const eliminationRate = 0.2 + Math.random() * 0.3; // 20-50% elimination
        const newEliminated = Math.floor(survivors * eliminationRate);

        setSurvivors(prev => Math.max(0, prev - newEliminated));
        setEliminated(prev => prev + newEliminated);

        setQPhase('RESULT');
    };

    const handleNextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setQPhase('ANSWERING');
            setVotes({});
        } else {
            // End of game
            onStatusChange('USED');
            onExpandChange(false);
        }
    };

    const handleClose = () => {
        onStatusChange('USED');
        onExpandChange(false);
    };

    // --- Render Helpers ---

    const totalVotes = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-amber-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
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
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Trophy size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">一站到底</span>
                            {time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {time}
                                </span>
                            )}
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate" title={title}>{title || '未命名活动'}</h3>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                    {status === 'IDLE' ? (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            未开启
                        </span>
                    ) : status === 'USED' ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full border border-gray-300">
                                已结束
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                Q{currentQIndex + 1}/{questions.length}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 tabular-nums">
                                <Users size={12} /> {survivors}
                            </span>
                        </div>
                    )}
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>

                {/* IDLE State: Preview */}
                {status === 'IDLE' && (
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-2 text-amber-900">
                                <Target size={16} />
                                <span className="text-xs font-bold">题目总数</span>
                            </div>
                            <span className="text-sm font-black text-amber-600">{questions.length} 题</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">题目预览</p>
                            {questions.map((q, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">Q{idx + 1}</span>
                                    <p className="text-xs font-bold text-gray-600 line-clamp-1">{q.topic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACTIVE State */}
                {status === 'ACTIVE' && (
                    <div className="p-5 space-y-6">
                        {/* 1. Global Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center">
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">幸存勇士</span>
                                <span className="text-2xl font-black text-green-600 tabular-nums">{survivors}</span>
                            </div>
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">淘汰人数</span>
                                <span className="text-2xl font-black text-red-600 tabular-nums">{eliminated}</span>
                            </div>
                        </div>

                        {/* 2. Current Question */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px]">Q{currentQIndex + 1}</span>
                                    {currentQuestion.topic}
                                </h4>
                                {qPhase === 'RESULT' && (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                                        本轮已结算
                                    </span>
                                )}
                            </div>

                            {/* Options Visualization */}
                            <div className="space-y-2">
                                {currentQuestion.options.map((opt, idx) => {
                                    const voteCount = votes[idx] || 0;
                                    const percent = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : '0.0';
                                    const isCorrect = (idx + 1).toString() === currentQuestion.correct;

                                    // Visual State logic
                                    const showResult = qPhase === 'REVEALED' || qPhase === 'RESULT';
                                    const isHighlight = showResult && isCorrect;
                                    const isGrayOut = showResult && !isCorrect;

                                    return (
                                        <div key={idx} className="relative group">
                                            {/* Bar BG */}
                                            <div className="absolute inset-0 bg-gray-50 rounded-lg overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-700 ease-out opacity-10 ${isHighlight ? 'bg-green-500' : 'bg-gray-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                            <div className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${isHighlight ? 'border-green-200 bg-green-50/10' :
                                                isGrayOut ? 'border-transparent opacity-60' :
                                                    'border-gray-100 hover:border-blue-200'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black
                                                        ${isHighlight ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}
                                                    `}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className={`text-xs font-bold ${isHighlight ? 'text-green-800' : 'text-gray-700'}`}>
                                                        {opt.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {showResult && isCorrect && <CheckCircle2 size={16} className="text-green-500" />}
                                                    {showResult && !isCorrect && <XOctagon size={16} className="text-red-200" />}
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-black text-gray-700 tabular-nums">{voteCount}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 tabular-nums">{percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex gap-2">
                    {status === 'IDLE' && (
                        <ActionBtn onClick={handleStart} variant="primary" icon={<Play size={14} fill="currentColor" />}>开启挑战</ActionBtn>
                    )}

                    {status === 'ACTIVE' && (
                        <>
                            {qPhase === 'ANSWERING' && (
                                <ActionBtn onClick={handlePublishAnswer} variant="primary" icon={<CheckCircle2 size={14} />}>公布答案</ActionBtn>
                            )}
                            {qPhase === 'REVEALED' && (
                                <ActionBtn onClick={handleRevealResult} variant="danger" icon={<TrendingUp size={14} />}>揭晓结果</ActionBtn>
                            )}
                            {qPhase === 'RESULT' && (
                                <ActionBtn onClick={handleNextQuestion} variant="primary" icon={<ArrowRight size={14} />}>
                                    {currentQIndex < questions.length - 1 ? '下一题' : '结束全部'}
                                </ActionBtn>
                            )}

                            <ActionBtn onClick={handleClose} variant="secondary" icon={<XCircle size={14} />}>关闭</ActionBtn>
                        </>
                    )}

                    {status === 'USED' && (
                        <ActionBtn onClick={handleStart} variant="primary" icon={<Play size={14} />}>重新开启</ActionBtn>
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
            case 'primary': return 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100';
            case 'danger': return 'bg-red-500 hover:bg-red-600 text-white shadow-red-100';
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

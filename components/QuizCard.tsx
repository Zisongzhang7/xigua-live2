
import React, { useEffect } from 'react';
import {
  Play,
  XCircle,
  Trash2,
  Users,
  PieChart,
  Award,
  Clock,
  ChevronDown,
  GripVertical
} from 'lucide-react';

export type QuizStatus = 'IDLE' | 'ACTIVE' | 'REVEALED' | 'USED';

export interface QuizCardProps {
  id: string;
  title: string;
  onDelete: () => void;
  mockOptions?: { id: string; name?: string; label?: string; isCorrect?: boolean }[];
  dragHandle?: React.ReactNode;
  time?: string;

  // Controlled Props (Passed from Parent)
  status: QuizStatus;
  votes: Record<string, number>;
  isExpanded: boolean;

  // Callbacks to update Parent
  onStatusChange: (status: QuizStatus) => void;
  onVotesUpdate: (votes: Record<string, number>) => void;
  onExpandChange: (expanded: boolean) => void;
  isReadOnly?: boolean;
}

const DEFAULT_MOCK_OPTIONS: { id: string; name?: string; label?: string; isCorrect?: boolean }[] = [
  { id: 'A', name: '三长一短选最短', isCorrect: false },
  { id: 'B', name: '三短一长选最长', isCorrect: false },
  { id: 'C', name: '参差不齐C无敌', isCorrect: true },
  { id: 'D', name: '以上全不对', isCorrect: false },
];

export const QuizCard: React.FC<QuizCardProps> = ({
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
  const totalVotes = Object.values(votes).reduce((a: number, b: number) => a + b, 0);

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
        const newVotes = { ...votes, [randomOption.id]: (votes[randomOption.id] || 0) + 1 };
        onVotesUpdate(newVotes);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [status, mockOptions, votes, onVotesUpdate]);

  const handleStart = () => {
    onStatusChange('ACTIVE');
    onExpandChange(true);
  };

  const handleReveal = () => onStatusChange('REVEALED');

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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all duration-300 overflow-hidden group flex flex-col h-fit">
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
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Award size={16} strokeWidth={3} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">答题</span>
              {time && (
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> {time}
                </span>
              )}
              {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
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
              已使用
            </span>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
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
            const percentage = (totalVotes as number) > 0 ? Math.round((voteCount / (totalVotes as number)) * 100) : 0;
            const isWinner = status === 'REVEALED' && option.isCorrect;
            const displayLabel = String.fromCharCode(65 + index); // Convert 0->A, 1->B...

            return (
              <div key={option.id} className="relative group/option">
                {/* Progress Bar Background */}
                {(status === 'ACTIVE' || status === 'REVEALED') && (
                  <div className="absolute inset-0 bg-gray-50 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out opacity-20 ${isWinner ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}

                <div className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${status === 'IDLE' || status === 'USED'
                  ? 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-sm'
                  : isWinner
                    ? 'border-green-200 bg-green-50/10'
                    : 'border-transparent bg-transparent'
                  }`}>
                  <div className="flex items-center gap-3 z-10 overflow-hidden">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black transition-all duration-300 shrink-0 ${isWinner
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110'
                      : status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 group-hover/option:bg-blue-600 group-hover/option:text-white'
                      }`}>
                      {displayLabel}
                    </div>
                    <span className={`text-sm font-bold truncate transition-colors ${isWinner ? 'text-green-800' : 'text-gray-700'}`}>
                      {option.name || option.label}
                    </span>
                  </div>

                  {(status === 'ACTIVE' || status === 'REVEALED') && (
                    <div className="flex items-center gap-2 z-10 shrink-0 animate-in fade-in">
                      <span className={`text-xs font-bold tabular-nums ${isWinner ? 'text-green-700' : 'text-gray-600'}`}>
                        {voteCount} 票
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded tabular-nums ${isWinner ? 'bg-green-200 text-green-800' : 'bg-white/60 text-gray-500'}`}>
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
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200 active:scale-95"
            >
              <Play size={14} fill="currentColor" /> {status === 'USED' ? '再次开启' : '开启答题'}
            </button>
          ) : (
            <>
              {status === 'ACTIVE' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleReveal(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
                >
                  <PieChart size={14} /> 公布答案
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-black transition-all active:scale-95"
              >
                <XCircle size={14} /> {status === 'REVEALED' ? '关闭' : '结束'}
              </button>
            </>
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

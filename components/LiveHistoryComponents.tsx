import React, { useState } from 'react';
import { 
    Clock, 
    User, 
    Users, 
    PlayCircle, 
    Upload, 
    Video, 
    FileJson, 
    X, 
    Check,
    ChevronRight,
    Calendar
} from 'lucide-react';
import { LiveHistoryItem, LiveType, PlaybackMethod } from '../types';

interface HistoryCardProps {
    item: LiveHistoryItem;
    liveType: LiveType;
    onTogglePlayback: (item: LiveHistoryItem, enable: boolean) => void;
    onConfigurePlayback: (item: LiveHistoryItem) => void;
    onSelect?: (item: LiveHistoryItem) => void;
    isSelected?: boolean;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ 
    item, 
    liveType, 
    onTogglePlayback, 
    onConfigurePlayback,
    onSelect,
    isSelected
}) => {
    return (
        <div 
            onClick={() => onSelect?.(item)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                isSelected 
                ? 'bg-blue-50/30 border-blue-400 shadow-md ring-1 ring-blue-400' 
                : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
            }`}
        >
            <div className="flex gap-3">
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h5 className="text-xs font-bold text-gray-800 truncate leading-tight mb-1" title={item.name}>
                                {liveType === LiveType.COURSE 
                                    ? `${item.className || ''} ${item.lessonName || ''}` 
                                    : item.name}
                            </h5>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
                            {liveType === LiveType.ORDINARY && (
                                <div className="flex items-center gap-1">
                                    <User size={10} /> {item.hostName}
                                </div>
                            )}
                             <div className="flex items-center gap-1">
                                <Clock size={10} /> 
                                <span>
                                    {new Date(item.startTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    {item.endTime && ` - ${new Date(item.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 mt-1">
                             <div className="flex items-center gap-1">
                                <Users size={10} /> {item.participantCount || 0}人参与
                            </div>
                            {liveType === LiveType.ORDINARY ? (
                                <div className="truncate max-w-[150px]" title={item.visibleAudience}>
                                    可见: {item.visibleAudience}
                                </div>
                            ) : (
                                 <div className="truncate max-w-[150px]" title={item.linkedLessonId}>
                                    关联: {item.lessonName}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Playback Toggle Section */}
                <div className="flex flex-col items-end justify-between min-w-[80px]">
                     <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <span className={`text-[10px] font-bold ${item.hasPlayback ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.hasPlayback ? '回放已开' : '回放关闭'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={item.hasPlayback}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Opening: Check if configured first or open config
                                        if (!item.playbackMethod) {
                                            onConfigurePlayback(item);
                                        } else {
                                            onTogglePlayback(item, true);
                                        }
                                    } else {
                                        onTogglePlayback(item, false);
                                    }
                                }}
                            />
                            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    {item.hasPlayback && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onConfigurePlayback(item); }}
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 font-medium"
                        >
                           {item.playbackMethod === 'RECORDED_LESSON' ? <Video size={10} /> : <FileJson size={10} />}
                           {item.playbackMethod === 'RECORDED_LESSON' ? '录播课' : 'JSON数据'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PlaybackConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    liveType: LiveType;
    onConfirm: (method: PlaybackMethod, config?: any) => void;
}

export const PlaybackConfigModal: React.FC<PlaybackConfigModalProps> = ({ isOpen, onClose, liveType, onConfirm }) => {
    const [method, setMethod] = useState<PlaybackMethod | null>(null);
    const [file, setFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (method) {
            onConfirm(method, { file });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-gray-900">开启回放</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-sm text-gray-500 font-medium">请选择回放生成方式：</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {liveType === LiveType.COURSE && (
                            <button
                                onClick={() => setMethod('RECORDED_LESSON')}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                    method === 'RECORDED_LESSON' 
                                    ? 'border-blue-500 bg-blue-50/50' 
                                    : 'border-gray-100 hover:border-blue-200 bg-white'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    method === 'RECORDED_LESSON' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">关联录播课</div>
                                    <div className="text-xs text-gray-400 mt-0.5">自动关联课程下的录播视频资源</div>
                                </div>
                                {method === 'RECORDED_LESSON' && <Check size={18} className="ml-auto text-blue-500" />}
                            </button>
                        )}

                        <button
                            onClick={() => setMethod('UPLOAD_JSON')}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                method === 'UPLOAD_JSON' 
                                ? 'border-blue-500 bg-blue-50/50' 
                                : 'border-gray-100 hover:border-blue-200 bg-white'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                method === 'UPLOAD_JSON' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <FileJson size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">上传回放数据 (JSON)</div>
                                <div className="text-xs text-gray-400 mt-0.5">上传包含信令数据的 JSON 文件</div>
                                {method === 'UPLOAD_JSON' && (
                                    <div className="mt-2">
                                         <label className="flex items-center gap-2 text-xs text-blue-600 font-bold cursor-pointer hover:underline">
                                            <Upload size={12} />
                                            {file ? file.name : '点击选择文件'}
                                            <input type="file" className="hidden" accept=".json" onChange={e => setFile(e.target.files?.[0] || null)} />
                                        </label>
                                    </div>
                                )}
                            </div>
                            {method === 'UPLOAD_JSON' && <Check size={18} className="ml-auto text-blue-500" />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">取消</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!method || (method === 'UPLOAD_JSON' && !file)}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                    >
                        确认开启
                    </button>
                </div>
            </div>
        </div>
    );
};

interface HistoryListModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: LiveHistoryItem[];
    liveType: LiveType;
    onTogglePlayback: (item: LiveHistoryItem, enable: boolean) => void;
    onConfigurePlayback: (item: LiveHistoryItem) => void;
}

export const HistoryListModal: React.FC<HistoryListModalProps> = ({ isOpen, onClose, history, liveType, onTogglePlayback, onConfigurePlayback }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in-95">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                         <h3 className="text-lg font-black text-gray-900">全部开播历史</h3>
                         <p className="text-xs text-gray-400 mt-0.5">共 {history.length} 场直播记录</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
                    {history.map(item => (
                        <HistoryCard 
                            key={item.id} 
                            item={item} 
                            liveType={liveType}
                            onTogglePlayback={onTogglePlayback}
                            onConfigurePlayback={onConfigurePlayback}
                        />
                    ))}
                    {history.length === 0 && (
                        <div className="text-center py-20 text-gray-400">暂无历史记录</div>
                    )}
                </div>
            </div>
        </div>
    );
};

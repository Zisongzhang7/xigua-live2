import React, { useState } from 'react';
import { History, PlayCircle, Upload, ChevronRight, X, Calendar, Clock, Users, BookOpen, FileJson, Video, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { LiveType, LiveHistoryItem, PlaybackMethod } from '../types';

interface LiveHistoryListProps {
    historyItems: LiveHistoryItem[];
    streamType: LiveType;
    onUpdateItem: (id: string, updates: Partial<LiveHistoryItem>) => void;
}

const HistoryCard: React.FC<{
    item: LiveHistoryItem;
    streamType: LiveType;
    onTogglePlayback: () => void;
}> = ({ item, streamType, onTogglePlayback }) => {
    return (
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="flex gap-3">
                <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                    <img src={item.coverUrl} className="w-full h-full object-cover" alt={item.name} />
                    {item.hasPlayback && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle size={20} className="text-white/90" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {streamType === LiveType.ORDINARY ? (
                        // Normal Live Card Layout
                        <>
                            <h5 className="text-xs font-bold text-gray-800 truncate mb-1">{item.name}</h5>
                            <div className="flex flex-wrap gap-y-1 gap-x-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1"><Users size={10} /> 主播: {item.hostName}</span>
                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {item.endTime ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??:??'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                <span>{item.participantCount}人参与</span>
                                <span className="bg-gray-100 px-1.5 rounded text-gray-500 truncate max-w-[100px]">可见: {item.visibleAudience || '全员'}</span>
                            </div>
                        </>
                    ) : (
                        // Course Live Card Layout
                        <>
                            <h5 className="text-xs font-bold text-gray-800 truncate mb-1">
                                {item.className} <span className="mx-1 text-gray-300">|</span> {item.lessonName}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                                <Clock size={10} />
                                <span>{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {item.endTime ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??:??'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-400">{item.participantCount}人参与</span>
                                <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 max-w-[120px] truncate">
                                    <BookOpen size={10} /> 关联: {item.linkedLessonId || '未关联'}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {/* Playback Toggle Section */}
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500">回放开关</span>
                    {item.hasPlayback ? (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            {item.playbackMethod === 'RECORDED_LESSON' ? '录播课' : 'JSON上传'}
                        </span>
                    ) : (
                        <span className="text-[10px] text-gray-400">未开启</span>
                    )}
                </div>
                <button 
                    onClick={onTogglePlayback}
                    className={`relative w-8 h-4 rounded-full transition-colors ${item.hasPlayback ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${item.hasPlayback ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
};

const PlaybackConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    streamType: LiveType;
    onConfirm: (method: PlaybackMethod, config: any) => void;
}> = ({ isOpen, onClose, streamType, onConfirm }) => {
    const [method, setMethod] = useState<PlaybackMethod>(streamType === LiveType.COURSE ? 'RECORDED_LESSON' : 'UPLOAD_JSON');
    const [file, setFile] = useState<File | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        onConfirm(method, { 
            file: file?.name, 
            lessonId: selectedLessonId 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900">开启回放</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">回放方式</label>
                        <div className="grid grid-cols-2 gap-2">
                            {streamType === LiveType.COURSE && (
                                <button
                                    onClick={() => setMethod('RECORDED_LESSON')}
                                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                        method === 'RECORDED_LESSON' 
                                        ? 'bg-blue-50 border-blue-500 text-blue-600' 
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <Video size={14} /> 录播课
                                </button>
                            )}
                            <button
                                onClick={() => setMethod('UPLOAD_JSON')}
                                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    method === 'UPLOAD_JSON' 
                                    ? 'bg-blue-50 border-blue-500 text-blue-600' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                } ${streamType === LiveType.ORDINARY ? 'col-span-2' : ''}`}
                            >
                                <FileJson size={14} /> 上传 JSON
                            </button>
                        </div>
                    </div>

                    {method === 'UPLOAD_JSON' && (
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase">上传回放文件</label>
                             <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-white hover:border-blue-400 transition-colors cursor-pointer group">
                                <Upload size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-xs text-gray-500 font-medium">点击上传 .json 文件</span>
                             </div>
                        </div>
                    )}

                    {method === 'RECORDED_LESSON' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">选择关联录播</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                                value={selectedLessonId}
                                onChange={e => setSelectedLessonId(e.target.value)}
                            >
                                <option value="">请选择课程视频...</option>
                                <option value="L1">第一课：认识数字 (2024-01-10)</option>
                                <option value="L2">第二课：加减法入门 (2024-01-12)</option>
                            </select>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-100"
                >
                    确认开启
                </button>
            </div>
        </div>
    );
};

const HistoryListModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    items: LiveHistoryItem[];
    streamType: LiveType;
    onTogglePlayback: (item: LiveHistoryItem) => void;
}> = ({ isOpen, onClose, items, streamType, onTogglePlayback }) => {
    if (!isOpen) return null;

    // Sort by most recently played (mock logic using startTime desc for now, or added logic)
    // Requirement: "Latest played at the top"
    // Assuming startTime is a good proxy for "played time" for history
    const sortedItems = [...items].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <History size={20} className="text-purple-500" />
                        全部历史回放
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedItems.map(item => (
                            <HistoryCard 
                                key={item.id} 
                                item={item} 
                                streamType={streamType} 
                                onTogglePlayback={() => onTogglePlayback(item)} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveHistoryList: React.FC<LiveHistoryListProps> = ({ historyItems, streamType, onUpdateItem }) => {
    const [viewMoreOpen, setViewMoreOpen] = useState(false);
    const [configModalState, setConfigModalState] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });

    const handleTogglePlayback = (item: LiveHistoryItem) => {
        if (item.hasPlayback) {
            // If already on, toggle off directly? Or ask confirmation?
            // "Playback switch default closed, open appears modal..."
            // Usually toggle off is immediate.
            onUpdateItem(item.id, { hasPlayback: false, playbackMethod: undefined, playbackConfig: undefined });
        } else {
            // Turn ON -> Open Config Modal
            setConfigModalState({ isOpen: true, itemId: item.id });
        }
    };

    const handleConfigConfirm = (method: PlaybackMethod, config: any) => {
        if (configModalState.itemId) {
            onUpdateItem(configModalState.itemId, {
                hasPlayback: true,
                playbackMethod: method,
                playbackConfig: config
            });
        }
    };

    // Show only top 3 items in the preview list
    const previewItems = historyItems.slice(0, 3);

    return (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h4 className="text-xs font-black text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-3 mb-4">
                <History size={14} className="text-purple-500" />
                开播历史
            </h4>
            
            <div className="space-y-3">
                {previewItems.map(item => (
                    <HistoryCard 
                        key={item.id} 
                        item={item} 
                        streamType={streamType} 
                        onTogglePlayback={() => handleTogglePlayback(item)} 
                    />
                ))}
                {historyItems.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs italic">暂无开播记录</div>
                )}
            </div>

            {historyItems.length > 3 && (
                <button 
                    onClick={() => setViewMoreOpen(true)}
                    className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-purple-600 font-bold flex items-center justify-center gap-1 transition-colors group"
                >
                    查看更多 <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            )}

            <PlaybackConfigModal 
                isOpen={configModalState.isOpen}
                onClose={() => setConfigModalState({ isOpen: false, itemId: null })}
                streamType={streamType}
                onConfirm={handleConfigConfirm}
            />

            <HistoryListModal
                isOpen={viewMoreOpen}
                onClose={() => setViewMoreOpen(false)}
                items={historyItems}
                streamType={streamType}
                onTogglePlayback={handleTogglePlayback}
            />
        </div>
    );
};

export default LiveHistoryList;

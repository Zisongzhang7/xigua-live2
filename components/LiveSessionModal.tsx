import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, ImageIcon, GraduationCap, BookOpen, UserCircle, Hash, FileSpreadsheet, Download } from 'lucide-react';
import { LiveSession, LiveType } from '../types';
import { CascadingSearchSelector, SearchableMultiSelect, TagItem, ModeTab, DB } from './LiveSetupComponents';

interface LiveSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Partial<LiveSession>) => void;
    initialData?: Partial<LiveSession>;
    liveType: LiveType;
    isEditing: boolean;
}

const LiveSessionModal: React.FC<LiveSessionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    liveType,
    isEditing
}) => {
    const defaultState: Partial<LiveSession> = {
        name: '',
        hostName: '',
        startTime: '',
        coverUrl: '',
        linkedLessonId: '',
        linkedLessonName: '',
        visibleAudience: [],
        audienceMode: 'CLASS'
    };

    const [sessionData, setSessionData] = useState<Partial<LiveSession>>(defaultState);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSessionData(initialData || defaultState);
        }
    }, [isOpen, initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSessionData(prev => ({ ...prev, coverUrl: url }));
        }
    };

    const handleAudienceAddItem = (val: string) => {
        const current = sessionData.visibleAudience || [];
        if (!current.includes(val)) {
            setSessionData(prev => ({ ...prev, visibleAudience: [...current, val] }));
        }
    };

    const handleAudienceRemoveItem = (val: string) => {
        const current = sessionData.visibleAudience || [];
        setSessionData(prev => ({ ...prev, visibleAudience: current.filter(i => i !== val) }));
    };

    const handleSave = () => {
        // Validation
        if (!sessionData.name || !sessionData.hostName || !sessionData.startTime) {
            alert('请填写必要信息（名称、主播、时间）');
            return;
        }

        if (liveType === LiveType.COURSE && !sessionData.linkedLessonName) {
            alert('请选择关联课节');
            return;
        }

        if (liveType === LiveType.ORDINARY && (!sessionData.visibleAudience || sessionData.visibleAudience.length === 0)) {
            alert('请配置可见人群');
            return;
        }

        onSave(sessionData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">{isEditing ? '编辑场次' : '新增场次'}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">配置直播场次的基础信息与权限</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">场次名称 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-white text-gray-900 text-sm p-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="例如：第一场：开幕式"
                            value={sessionData.name}
                            onChange={e => setSessionData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <p className="text-[10px] text-gray-400">将在学生端显示的场次标题</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">主播/嘉宾 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full bg-white text-gray-900 text-sm p-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="姓名"
                                value={sessionData.hostName}
                                onChange={e => setSessionData(prev => ({ ...prev, hostName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">开播时间 <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                className="w-full bg-white text-gray-900 text-sm p-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={sessionData.startTime}
                                onChange={e => setSessionData(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Conditional Fields based on Live Type */}
                    {liveType === LiveType.ORDINARY && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">封面图片</label>
                            <div className="flex items-center gap-4">
                                {sessionData.coverUrl ? (
                                    <div className="relative w-32 h-20 rounded-lg overflow-hidden group/cover border border-gray-200 shadow-sm">
                                        <img src={sessionData.coverUrl} className="w-full h-full object-cover" alt="preview" />
                                        <button
                                            onClick={() => setSessionData(prev => ({ ...prev, coverUrl: '' }))}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity text-white"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 flex flex-col items-center justify-center gap-1 transition-colors bg-gray-50"
                                    >
                                        <ImageIcon size={20} />
                                        <span>上传封面</span>
                                    </button>
                                )}
                                <div className="text-xs text-gray-400">
                                    <p>建议尺寸: 4:3</p>
                                    <p>支持 JPG, PNG, GIF</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    )}

                    {liveType === LiveType.COURSE && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">关联课节 <span className="text-red-500">*</span></label>
                            <CascadingSearchSelector
                                onSelect={(c, l) => setSessionData(prev => ({ ...prev, linkedLessonName: `${c} - ${l}`, linkedLessonId: l }))}
                            />
                            {sessionData.linkedLessonName && (
                                <div className="mt-2">
                                    <TagItem label={sessionData.linkedLessonName} onRemove={() => setSessionData(prev => ({ ...prev, linkedLessonName: '', linkedLessonId: '' }))} />
                                </div>
                            )}
                        </div>
                    )}

                    {liveType === LiveType.ORDINARY && (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-700 block">可见人群 <span className="text-red-500">*</span></label>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="grid grid-cols-4 gap-1 p-1 bg-gray-200/50 rounded-lg mb-3">
                                    <ModeTab active={sessionData.audienceMode === 'CLASS'} onClick={() => setSessionData(prev => ({ ...prev, audienceMode: 'CLASS' }))} icon={<GraduationCap size={14} />} label="按班级" />
                                    <ModeTab active={sessionData.audienceMode === 'COURSE'} onClick={() => setSessionData(prev => ({ ...prev, audienceMode: 'COURSE' }))} icon={<BookOpen size={14} />} label="按课程" />
                                    <ModeTab active={sessionData.audienceMode === 'USER_TYPE'} onClick={() => setSessionData(prev => ({ ...prev, audienceMode: 'USER_TYPE' }))} icon={<UserCircle size={14} />} label="按类型" />
                                    <ModeTab active={sessionData.audienceMode === 'ID'} onClick={() => setSessionData(prev => ({ ...prev, audienceMode: 'ID' }))} icon={<Hash size={14} />} label="按学号" />
                                </div>

                                <div className="min-h-[60px]">
                                    {sessionData.audienceMode === 'ID' ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                        <FileSpreadsheet size={14} />
                                                        上传Excel
                                                    </button>
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                        <Download size={14} />
                                                        下载模板
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-gray-400">支持批量导入</span>
                                            </div>
                                            <textarea
                                                placeholder="请输入学号，多个学号用逗号分隔..."
                                                className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                                                value={sessionData.visibleAudience?.join(', ')}
                                                onChange={(e) => setSessionData(prev => ({ ...prev, visibleAudience: e.target.value.split(/[,，\n]/).map(s => s.trim()).filter(Boolean) }))}
                                            />
                                        </div>
                                    ) : (
                                        <SearchableMultiSelect
                                            mode={sessionData.audienceMode || 'CLASS'}
                                            options={sessionData.audienceMode === 'CLASS' ? DB.CLASSES : sessionData.audienceMode === 'COURSE' ? DB.COURSES : DB.USER_TYPES}
                                            onAdd={handleAudienceAddItem}
                                        />
                                    )}
                                    {sessionData.audienceMode !== 'ID' && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(sessionData.visibleAudience || []).map(item => (
                                                <TagItem key={item} label={item} onRemove={() => handleAudienceRemoveItem(item)} />
                                            ))}
                                            {(!sessionData.visibleAudience || sessionData.visibleAudience.length === 0) && (
                                                <span className="text-xs text-gray-400 py-1">暂未选择任何人群</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-colors text-sm"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm"
                    >
                        {isEditing ? '保存修改' : '确认创建'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveSessionModal;

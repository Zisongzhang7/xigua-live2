import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Clock,
    Trash2,
    ChevronDown,
    X,
    Search,
    Check,
    RotateCcw,
    Filter,
    Tag as TagIcon,
    Plus,
    GraduationCap,
    BookOpen,
    ChevronRight,
    GripVertical,
} from 'lucide-react';
import { InteractionCategory, InteractiveResource } from '../types';

// Mock Database for Selectors - duplicated for now to avoid dependency circles if exported from view
export const DB = {
    CLASSES: ['一年级一班', '一年级二班', '一年级三班', '二年级一班', '三年级二班', '高一实验班'],
    COURSES: ['初中数学特训', '高考英语提分', '少儿编程基础', '物理竞赛辅导', '语文文言文赏析'],
    USER_TYPES: ['普通学生', 'VIP学生', '教师账号', '助教账号', '家长账号', '临时访客'],
    LESSONS: ['第一课：认识数字', '第二课：拼音基础', '第三课：简单加法']
};

export const InteractionCategoryGroup: React.FC<{ label: string; count: number; children: React.ReactNode }> = ({ label, count, children }) => (
    <div className="space-y-4">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-2 border-l-2 border-blue-500">{label} ({count})</h4>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 items-start">{children}</div>
    </div>
);

export const InfoItem: React.FC<{ label: string; content: string }> = ({ label, content }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium">
            {content || '暂无内容'}
        </div>
    </div>
);

export const TagItem: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
        {label}
        <button onClick={onRemove} className="hover:bg-blue-50 rounded p-0.5 transition-colors">
            <X size={12} />
        </button>
    </span>
);

export const ModeTab: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all w-full ${active
            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
            : 'text-gray-500 hover:bg-gray-200/50'
            }`}
    >
        {icon} {label}
    </button>
);

export const InteractionToggle: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-row items-center gap-2 px-3 py-2 rounded-lg border transition-all group h-10 ${active
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
            : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
            }`}
    >
        <div className={`${active ? 'text-white' : 'text-current'}`}>
            {icon}
        </div>
        <span className="text-xs font-bold whitespace-nowrap">{label}</span>
    </button>
);

export const CascadingSearchSelector: React.FC<{ onSelect: (cls: string, lesson: string) => void }> = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [classSearch, setClassSearch] = useState('');
    const [lessonSearch, setLessonSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredClasses = DB.CLASSES.filter(c => c.toLowerCase().includes(classSearch.toLowerCase()));

    // In a real app, lessons might depend on the active class, but here we use the flat list or filter if mock data supported it.
    // For now, we show all lessons or mock filtering.
    const filteredLessons = DB.LESSONS.filter(l => l.toLowerCase().includes(lessonSearch.toLowerCase()));

    const handleSelectLesson = (lesson: string) => {
        if (activeClass && lesson) {
            onSelect(activeClass, lesson);
            setIsOpen(false);
            setActiveClass(null); // Reset or keep selection? Usually keep.
            // Reset searches for next time
            setClassSearch('');
            setLessonSearch('');
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all ${isOpen ? 'ring-2 ring-blue-100 border-blue-500' : 'hover:border-blue-300'}`}
            >
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">关联课节</span>
                    <span className="text-sm font-bold text-gray-700">
                        点击选择班级与课节...
                    </span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-[500px] mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Column 1: Classes */}
                    <div className="w-1/2 border-r border-gray-100 flex flex-col h-[320px]">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    value={classSearch}
                                    onChange={e => setClassSearch(e.target.value)}
                                    placeholder="搜索班级..."
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                            {filteredClasses.map(cls => (
                                <div
                                    key={cls}
                                    onClick={() => setActiveClass(cls)}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-between group transition-all ${activeClass === cls
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cls}
                                    <ChevronRight size={14} className={`text-gray-300 transition-colors ${activeClass === cls ? 'text-blue-500' : 'group-hover:text-gray-400'}`} />
                                </div>
                            ))}
                            {filteredClasses.length === 0 && <div className="p-4 text-center text-xs text-gray-300">无匹配班级</div>}
                        </div>
                    </div>

                    {/* Column 2: Lessons */}
                    <div className="w-1/2 flex flex-col h-[320px] bg-gray-50/30">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={lessonSearch}
                                    onChange={e => setLessonSearch(e.target.value)}
                                    placeholder={activeClass ? "搜索课节..." : "请先选择班级"}
                                    disabled={!activeClass}
                                    className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                            {!activeClass ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                    <GraduationCap size={24} className="opacity-20" />
                                    <span className="text-xs font-bold">请先从左侧选择班级</span>
                                </div>
                            ) : (
                                <>
                                    {filteredLessons.map(l => (
                                        <div
                                            key={l}
                                            onClick={() => handleSelectLesson(l)}
                                            className="px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all truncate"
                                        >
                                            {l}
                                        </div>
                                    ))}
                                    {filteredLessons.length === 0 && <div className="p-4 text-center text-xs text-gray-300">无匹配课节</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export interface ResourceSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: InteractiveResource[];
    onSelect: (resource: InteractiveResource) => void;
    allowedCategories?: InteractionCategory[]; // New Prop
}

export const ResourceSelectionModal: React.FC<ResourceSelectionModalProps> = ({ isOpen, onClose, resources, onSelect, allowedCategories }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
    const [labelSearch, setLabelSearch] = useState('');
    const labelDropdownRef = useRef<HTMLDivElement>(null);

    const ALL_LABELS = useMemo(() => {
        return Array.from(new Set(resources.flatMap(r => r.labels))).sort();
    }, [resources]);

    const filteredLabels = useMemo(() => {
        return ALL_LABELS.filter(l => l.toLowerCase().includes(labelSearch.toLowerCase()));
    }, [ALL_LABELS, labelSearch]);

    const filteredResources = useMemo(() => {
        let baseResources = [...resources];

        // 1. Inject Virtual AI Switch Resource if allowed
        const isAISwitchAllowed = !allowedCategories || allowedCategories.includes(InteractionCategory.AI_SWITCH);
        if (isAISwitchAllowed) {
            const virtualAI: InteractiveResource = {
                id: 'SYS_AI_SWITCH',
                name: 'AI 助手开关 (系统)',
                category: InteractionCategory.AI_SWITCH,
                templateName: '系统组件',
                creator: 'System',
                modifiedAt: new Date().toLocaleString(),
                labels: ['系统', 'AI'],
                config: {
                    agentId: '数学辅导 Agent',
                    displayMode: 'LARGE'
                }
            };
            baseResources.unshift(virtualAI);
        }

        return baseResources.filter(res => {
            // Filter by allowedCategories if present
            if (allowedCategories && allowedCategories.length > 0) {
                if (!allowedCategories.includes(res.category)) return false;
            }

            const matchSearch = res.name.toLowerCase().includes(search.toLowerCase());
            const matchCategory = !selectedCategory || res.category === selectedCategory;
            const matchLabels = selectedLabels.length === 0 || selectedLabels.every(l => res.labels.includes(l));
            return matchSearch && matchCategory && matchLabels;
        });
    }, [resources, search, selectedCategory, selectedLabels, allowedCategories]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
                setIsLabelDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const resetAllFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedLabels([]);
        setLabelSearch('');
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    const isFiltered = search !== '' || selectedCategory !== '' || selectedLabels.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">选择交互资源</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Select from your interaction library</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
                </div>

                {/* Filters Bar */}
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="搜索资源名称..."
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-100 appearance-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="">全部交互类型</option>
                                {(allowedCategories || Object.values(InteractionCategory)).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        <div className="relative" ref={labelDropdownRef}>
                            <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <button
                                onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-10 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm flex items-center justify-between overflow-hidden"
                            >
                                <span className="truncate">
                                    {selectedLabels.length === 0 ? '筛选标签' : `已选 ${selectedLabels.length} 个标签`}
                                </span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLabelDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isLabelDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-gray-100">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                autoFocus
                                                value={labelSearch} onChange={e => setLabelSearch(e.target.value)}
                                                placeholder="搜索标签..."
                                                className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-gray-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                        {filteredLabels.map(label => (
                                            <div
                                                key={label}
                                                onClick={() => toggleLabel(label)}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedLabels.includes(label) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${selectedLabels.includes(label) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                                    {selectedLabels.includes(label) && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-xs font-bold ${selectedLabels.includes(label) ? 'text-blue-600' : 'text-gray-600'}`}>{label}</span>
                                            </div>
                                        ))}
                                        {filteredLabels.length === 0 && <div className="p-4 text-center text-xs text-gray-400">无匹配标签</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {selectedLabels.map(label => (
                                <span key={label} className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 animate-in zoom-in-95">
                                    {label}
                                    <button onClick={() => toggleLabel(label)} className="hover:bg-blue-500 rounded p-0.5"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        {isFiltered && (
                            <button
                                onClick={resetAllFilters}
                                className="text-[10px] font-black text-red-500 hover:underline flex items-center gap-1 transition-all"
                            >
                                <RotateCcw size={12} /> 清除所有筛选
                            </button>
                        )}
                    </div>
                </div>

                {/* List Results */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.length > 0 ? filteredResources.map(res => (
                            <div
                                key={res.id}
                                className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-50/50 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-widest">{res.category}</span>
                                        <span className="text-[9px] font-mono text-gray-400">ID: {res.id}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{res.name}</h4>
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {res.labels.map(l => (
                                            <span key={l} className="text-[9px] font-bold text-gray-500 px-2 py-0.5 bg-gray-50 rounded border border-gray-100">#{l}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${res.creator}`} className="w-6 h-6 rounded-full bg-gray-100 shadow-sm" />
                                        <span className="text-[10px] font-bold text-gray-500">{res.creator}</span>
                                    </div>
                                    {res.category === InteractionCategory.COURSE_SLICE ? (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => onSelect(res)}
                                                className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black hover:bg-blue-100 transition-all whitespace-nowrap"
                                            >
                                                添加全部
                                            </button>
                                            <button
                                                onClick={() => onSelect({ ...res, _mode: 'homework_only' } as any)}
                                                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all whitespace-nowrap"
                                            >
                                                仅加作业
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onSelect(res)}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                        >
                                            添加
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400">
                                <div className="p-6 bg-gray-50 rounded-full mb-6">
                                    <Search size={48} className="opacity-20" />
                                </div>
                                <p className="text-sm font-black text-gray-600">没有找到符合条件的交互资源</p>
                                <button onClick={resetAllFilters} className="mt-4 text-xs font-bold text-blue-600 hover:underline">尝试重置筛选条件</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SearchableSelector: React.FC<{ label: string, icon: React.ReactNode, value: string, options: string[], onChange: (v: string) => void }> = ({ label, icon, value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-1.5" ref={ref}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative">
                <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-blue-400 transition-all shadow-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        {icon} <span className="text-xs font-bold">{value}</span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="搜索或选择..."
                                    className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-gray-900 outline-none"
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.map(opt => (
                                <button key={opt} onClick={() => { onChange(opt); setOpen(false); setSearch(''); }} className={`w-full text-left px-4 py-3 text-xs font-bold ${value === opt ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    {opt}
                                </button>
                            ))}
                            {filtered.length === 0 && <div className="p-4 text-center text-xs text-gray-400">无匹配结果</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SearchableMultiSelect: React.FC<{ mode: string, options: string[], onAdd: (v: string) => void }> = ({ mode, options, onAdd }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative" ref={ref}>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    onFocus={() => setOpen(true)}
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`输入关键词搜索${mode === 'CLASS' ? '班级' : mode === 'COURSE' ? '课程' : '用户类型'}`}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-gray-900 outline-none focus:border-blue-500 shadow-sm"
                />
            </div>
            {open && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto animate-in zoom-in-95 duration-200">
                    {filtered.length > 0 ? filtered.map(opt => (
                        <button key={opt} onClick={() => { onAdd(opt); setSearch(''); setOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-50 last:border-0">
                            {opt}
                        </button>
                    )) : <div className="p-4 text-center text-xs text-gray-400">无匹配结果</div>}
                </div>
            )}
        </div>
    );
};

export const InteractionItemView: React.FC<{
    title: string;
    type: string;
    time: string;
    onDelete: () => void;
    dragHandle?: React.ReactNode;
    isReadOnly?: boolean;
}> = ({ title, type, time, onDelete, dragHandle, isReadOnly = false }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all group flex items-start gap-3">
        {dragHandle && <div className="mt-1">{dragHandle}</div>}
        <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">{type}</span>
                <span className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Clock size={12} /> {time}</span>
            </div>
            <h5 className="text-sm font-black text-gray-900 mb-4">{title}</h5>
        </div>
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={onDelete}
                className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-500 transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    </div>
);

export interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, labels: string[]) => void;
    existingLabels?: string[];
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave, existingLabels = [] }) => {
    const [name, setName] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [inputLabel, setInputLabel] = useState('');
    const [showLabelDropdown, setShowLabelDropdown] = useState(false);

    // Filter labels based on input
    const filteredLabels = useMemo(() => {
        return existingLabels.filter(l =>
            l.toLowerCase().includes(inputLabel.toLowerCase()) &&
            !labels.includes(l)
        );
    }, [existingLabels, inputLabel, labels]);

    const handleAddLabel = (labelToAdd?: string) => {
        const target = labelToAdd || inputLabel;
        if (target && !labels.includes(target)) {
            setLabels([...labels, target]);
            setInputLabel('');
            setShowLabelDropdown(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200" onClick={() => setShowLabelDropdown(false)}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-900">另存为模板</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">模板名称</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                            placeholder="请输入模板名称..."
                            autoFocus
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">标签</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={inputLabel}
                                onClick={(e) => { e.stopPropagation(); setShowLabelDropdown(true); }}
                                onChange={(e) => { setInputLabel(e.target.value); setShowLabelDropdown(true); }}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                placeholder="选择或输入新标签..."
                            />
                            <button onClick={() => handleAddLabel()} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-xl font-bold transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Auto-complete Dropdown */}
                        {showLabelDropdown && filteredLabels.length > 0 && (
                            <div className="absolute top-[70px] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                                {filteredLabels.map(label => (
                                    <div
                                        key={label}
                                        onClick={(e) => { e.stopPropagation(); handleAddLabel(label); }}
                                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 text-sm font-bold text-gray-700 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {labels.map(label => (
                                <span key={label} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                    {label}
                                    <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-blue-800"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">
                        取消
                    </button>
                    <button
                        onClick={() => {
                            if (name) {
                                onSave(name, labels);
                                setName('');
                                setLabels([]);
                                onClose();
                            }
                        }}
                        disabled={!name}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, content, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{content}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold text-sm transition-colors">
                        取消
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-100">
                        确定
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ResizableLayout: React.FC<{
    left: React.ReactNode;
    middle: React.ReactNode;
    right: React.ReactNode;
    initialWidths?: number[];
}> = ({ left, middle, right, initialWidths = [25, 50, 25] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widths, setWidths] = useState(initialWidths); // Percentages
    const isDragging = useRef<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current === null || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const relativeX = e.clientX - containerRect.left;
            const percentageX = (relativeX / containerWidth) * 100;

            setWidths(prev => {
                const newWidths = [...prev];
                if (isDragging.current === 0) {
                    // Dragging first divider (between Left and Middle)
                    const minWidth = 15; // Minimum 15%
                    const maxLeft = 100 - newWidths[2] - minWidth; // Ensure Middle has min width
                    const newLeft = Math.max(minWidth, Math.min(percentageX, maxLeft));

                    newWidths[0] = newLeft;
                    newWidths[1] = 100 - newLeft - newWidths[2];
                } else {
                    // Dragging second divider (between Middle and Right)
                    const minWidth = 15;
                    const leftWidth = newWidths[0];
                    const minDividerPos = leftWidth + minWidth;
                    const maxDividerPos = 100 - minWidth;

                    const validPos = Math.max(minDividerPos, Math.min(percentageX, maxDividerPos));

                    newWidths[1] = validPos - leftWidth;
                    newWidths[2] = 100 - validPos;
                }
                return newWidths;
            });
        };

        const handleMouseUp = () => {
            isDragging.current = null;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDrag = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = index;
        document.body.style.cursor = 'col-resize';
    };

    return (
        <div className="flex w-full h-full overflow-hidden" ref={containerRef}>
            <div style={{ width: `${widths[0]}%` }} className="h-full overflow-hidden flex flex-col min-w-[200px]">
                {left}
            </div>

            <div
                className="w-4 -ml-2 hover:bg-blue-500/10 cursor-col-resize z-20 flex items-center justify-center shrink-0 group transition-colors select-none"
                onMouseDown={(e) => startDrag(0, e)}
            >
                <div className="w-px h-8 bg-gray-300 group-hover:bg-blue-500 transition-colors"></div>
            </div>

            <div style={{ width: `${widths[1]}%` }} className="h-full overflow-hidden flex flex-col min-w-[200px]">
                {middle}
            </div>

            <div
                className="w-4 -ml-2 hover:bg-blue-500/10 cursor-col-resize z-20 flex items-center justify-center shrink-0 group transition-colors select-none"
                onMouseDown={(e) => startDrag(1, e)}
            >
                <div className="w-px h-8 bg-gray-300 group-hover:bg-blue-500 transition-colors"></div>
            </div>

            <div style={{ width: `${widths[2]}%` }} className="h-full overflow-hidden flex flex-col min-w-[200px]">
                {right}
            </div>
        </div>
    );
};

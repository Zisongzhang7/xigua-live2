import React, { useState } from 'react';
import { Mic, Video, Layout, PictureInPicture, Maximize, StopCircle } from 'lucide-react';

export const LiveControlPanel: React.FC = () => {
    // Mode: 'NONE' | 'FULLSCREEN' | 'PIP'
    const [cutInMode, setCutInMode] = useState<'NONE' | 'FULLSCREEN' | 'PIP'>('NONE');
    const [audioSource, setAudioSource] = useState('default');
    const [videoSource, setVideoSource] = useState('facetime');

    const toggleMode = (mode: 'FULLSCREEN' | 'PIP') => {
        if (cutInMode === mode) {
            setCutInMode('NONE');
        } else {
            setCutInMode(mode);
        }
    };

    return (
        <div className="bg-gray-200/50 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-300 rounded-lg flex items-center px-3 py-2 text-sm font-bold text-gray-700 shadow-sm hover:border-blue-400 transition-colors relative">
                    <Mic size={16} className="text-gray-500 mr-2 absolute left-3 pointer-events-none" />
                    <select
                        className="w-full pl-6 bg-transparent outline-none appearance-none cursor-pointer"
                        value={audioSource}
                        onChange={(e) => setAudioSource(e.target.value)}
                    >
                        <option value="default">默认麦克风 (Default)</option>
                        <option value="external">外接麦克风 (External USB)</option>
                        <option value="system">系统内录 (System Audio)</option>
                    </select>
                </div>
                <div className="flex-1 bg-white border border-gray-300 rounded-lg flex items-center px-3 py-2 text-sm font-bold text-gray-700 shadow-sm hover:border-blue-400 transition-colors relative">
                    <Video size={16} className="text-gray-500 mr-2 absolute left-3 pointer-events-none" />
                    <select
                        className="w-full pl-6 bg-transparent outline-none appearance-none cursor-pointer"
                        value={videoSource}
                        onChange={(e) => setVideoSource(e.target.value)}
                    >
                        <option value="facetime">FaceTime HD Camera</option>
                        <option value="obs">OBS Virtual Camera</option>
                        <option value="capture">采集卡 (Capture Card)</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => toggleMode('FULLSCREEN')}
                    className={`flex-1 py-3 rounded-lg font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${cutInMode === 'FULLSCREEN'
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        }`}
                >
                    {cutInMode === 'FULLSCREEN' ? (
                        <>
                            <StopCircle size={16} />
                            停止全屏
                        </>
                    ) : (
                        <>
                            <Maximize size={16} />
                            全屏切入
                        </>
                    )}
                </button>
                <button
                    onClick={() => toggleMode('PIP')}
                    className={`flex-1 py-3 rounded-lg font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${cutInMode === 'PIP'
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        }`}
                >
                    {cutInMode === 'PIP' ? (
                        <>
                            <StopCircle size={16} />
                            停止画中画
                        </>
                    ) : (
                        <>
                            <PictureInPicture size={16} />
                            画中画切入
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const ObsControlPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'OBS' | 'OTHER'>('OBS');
    const [activeScene, setActiveScene] = useState<string>('scene1');

    const scenes = [
        { id: 'scene1', name: '全屏人像', color: 'bg-indigo-500' },
        { id: 'scene2', name: '左人右课件', color: 'bg-blue-500' },
        { id: 'scene3', name: '画中画', color: 'bg-cyan-500' },
        { id: 'scene4', name: '休息 Video', color: 'bg-teal-500' },
        { id: 'scene5', name: '连线', color: 'bg-purple-500' },
        { id: 'scene6', name: '结束', color: 'bg-gray-500' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-6 border-b border-gray-200 px-2 shrink-0">
                <button
                    onClick={() => setActiveTab('OBS')}
                    className={`py-3 text-xs font-black uppercase tracking-widest relative ${activeTab === 'OBS' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    OBS 场景
                    {activeTab === 'OBS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('OTHER')}
                    className={`py-3 text-xs font-black uppercase tracking-widest relative ${activeTab === 'OTHER' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    其他设置
                    {activeTab === 'OTHER' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {activeTab === 'OBS' ? (
                    <div className="grid grid-cols-4 gap-2">
                        {scenes.map(scene => (
                            <button
                                key={scene.id}
                                onClick={() => setActiveScene(scene.id)}
                                className={`rounded-lg p-2 flex flex-col items-center justify-center gap-1.5 transition-all group relative overflow-hidden ${activeScene === scene.id
                                    ? 'ring-2 ring-offset-1 ring-blue-600 bg-blue-50 shadow-md'
                                    : 'hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${scene.color} text-white shadow-sm shrink-0`}>
                                    <Layout size={12} />
                                </div>
                                <span className={`text-[10px] font-bold truncate w-full text-center ${activeScene === scene.id ? 'text-blue-700' : 'text-gray-600'}`}>{scene.name}</span>
                                {activeScene === scene.id && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold">
                        暂无其他设置
                    </div>
                )}
            </div>
        </div>
    );
};

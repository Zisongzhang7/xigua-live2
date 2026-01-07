import React, { useState } from 'react';
import { Mic, Video, Layout, PictureInPicture, Maximize, StopCircle, MicOff, VideoOff } from 'lucide-react';

export const LiveControlPanel: React.FC = () => {
    // Mode: 'NONE' | 'FULLSCREEN' | 'PIP'
    const [cutInMode, setCutInMode] = useState<'NONE' | 'FULLSCREEN' | 'PIP'>('NONE');
    const [audioSource, setAudioSource] = useState('default');
    const [videoSource, setVideoSource] = useState('facetime');
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

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
                <div className={`flex-1 bg-white border rounded-lg flex items-center px-3 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors relative ${isMicMuted ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
                    {isMicMuted ? (
                        <MicOff size={16} className="text-red-500 mr-2 shrink-0" />
                    ) : (
                        <Mic size={16} className="text-gray-500 mr-2 shrink-0" />
                    )}
                    <select
                        className="flex-1 bg-transparent outline-none appearance-none cursor-pointer min-w-0"
                        value={audioSource}
                        onChange={(e) => setAudioSource(e.target.value)}
                        disabled={isMicMuted}
                    >
                        <option value="default">默认麦克风 (Default)</option>
                        <option value="external">外接麦克风 (External USB)</option>
                        <option value="system">系统内录 (System Audio)</option>
                    </select>
                    <button
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        className={`ml-2 p-1.5 rounded-md transition-all ${isMicMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                        title={isMicMuted ? "开启麦克风" : "关闭麦克风"}
                    >
                        {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                </div>
                <div className={`flex-1 bg-white border rounded-lg flex items-center px-3 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors relative ${isCameraOff ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
                    {isCameraOff ? (
                        <VideoOff size={16} className="text-red-500 mr-2 shrink-0" />
                    ) : (
                        <Video size={16} className="text-gray-500 mr-2 shrink-0" />
                    )}
                    <select
                        className="flex-1 bg-transparent outline-none appearance-none cursor-pointer min-w-0"
                        value={videoSource}
                        onChange={(e) => setVideoSource(e.target.value)}
                        disabled={isCameraOff}
                    >
                        <option value="facetime">FaceTime HD Camera</option>
                        <option value="obs">OBS Virtual Camera</option>
                        <option value="capture">采集卡 (Capture Card)</option>
                    </select>
                    <button
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={`ml-2 p-1.5 rounded-md transition-all ${isCameraOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                        title={isCameraOff ? "开启摄像头" : "关闭摄像头"}
                    >
                        {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
                    </button>
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

// Types for OBS Scene Data
interface ObsTransform {
    positionX: number;
    positionY: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    sourceWidth: number;
    sourceHeight: number;
    width: number;
    height: number;
    cropLeft: number;
    cropTop: number;
    cropRight: number;
    cropBottom: number;
    boundsType: 'OBS_BOUNDS_NONE' | 'OBS_BOUNDS_STRETCH' | 'OBS_BOUNDS_SCALE_INNER' | 'OBS_BOUNDS_SCALE_OUTER' | 'OBS_BOUNDS_SCALE_TO_WIDTH' | 'OBS_BOUNDS_SCALE_TO_HEIGHT' | 'OBS_BOUNDS_MAX_ONLY';
    boundsWidth: number;
    boundsHeight: number;
    alignment: number;
}

interface ObsSceneItem {
    sceneItemId: number;
    sourceName: string;
    inputKind: string | null;
    sceneItemTransform: ObsTransform;
    sceneItemEnabled: boolean;
    sceneItemIndex: number;
}

interface ObsScene {
    name: string;
    items: ObsSceneItem[];
}

export const ObsControlPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'OBS' | 'OTHER'>('OBS');
    const [activeSceneName, setActiveSceneName] = useState<string>('场景');
    const [programSceneName, setProgramSceneName] = useState<string>('场景'); // The currently live scene

    // Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionConfig, setConnectionConfig] = useState({
        ip: '127.0.0.1',
        port: '4455',
        password: ''
    });

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate connection delay
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
        }, 1500);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    // Mock Data based on User Request
    const mockScenes: ObsScene[] = [
        {
            name: '场景',
            items: [
                {
                    sceneItemId: 4,
                    sourceName: "1111",
                    inputKind: "screen_capture",
                    sceneItemEnabled: true,
                    sceneItemIndex: 0,
                    sceneItemTransform: {
                        alignment: 5, boundsAlignment: 0, boundsHeight: 0, boundsType: "OBS_BOUNDS_NONE", boundsWidth: 0,
                        cropBottom: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropToBounds: false,
                        height: 1080, positionX: 0, positionY: 0, rotation: 0,
                        scaleX: 0.3191489279270172, scaleY: 0.3191489279270172,
                        sourceHeight: 3384, sourceWidth: 6016, width: 1920
                    }
                } as any, // Relaxing type for brevity with full JSON props
                {
                    sceneItemId: 5,
                    sourceName: "视频采集设备",
                    inputKind: "macos-avcapture",
                    sceneItemEnabled: true,
                    sceneItemIndex: 1,
                    sceneItemTransform: {
                        alignment: 5, boundsAlignment: 0, boundsHeight: 0, boundsType: "OBS_BOUNDS_NONE", boundsWidth: 0,
                        cropBottom: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropToBounds: false,
                        height: 0, positionX: -545, positionY: -187, rotation: 112.53272247314453,
                        scaleX: 1, scaleY: 1,
                        sourceHeight: 0, sourceWidth: 0, width: 0
                    }
                } as any,
                {
                    sceneItemId: 6,
                    sourceName: "macOS 屏幕采集",
                    inputKind: "screen_capture",
                    sceneItemEnabled: true,
                    sceneItemIndex: 2,
                    sceneItemTransform: {
                        alignment: 5, boundsAlignment: 0, boundsHeight: 0, boundsType: "OBS_BOUNDS_NONE", boundsWidth: 0,
                        cropBottom: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropToBounds: false,
                        height: 312, positionX: 1320, positionY: 747, rotation: 0,
                        scaleX: 0.09225399047136307, scaleY: 0.09219858050346375,
                        sourceHeight: 3384, sourceWidth: 6016, width: 555
                    }
                } as any,
                {
                    sceneItemId: 7,
                    sourceName: "图像幻灯片放映",
                    inputKind: "slideshow_v2",
                    sceneItemEnabled: true,
                    sceneItemIndex: 3,
                    sceneItemTransform: {
                        alignment: 5, boundsAlignment: 0, boundsHeight: 0, boundsType: "OBS_BOUNDS_NONE", boundsWidth: 0,
                        cropBottom: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropToBounds: false,
                        height: 1080, positionX: -1564, positionY: -389, rotation: 0,
                        scaleX: 1, scaleY: 1,
                        sourceHeight: 1080, sourceWidth: 1920, width: 1920
                    }
                } as any
            ]
        },
        { name: '场景 2 (Empty)', items: [] },
        { name: '场景 3 (Empty)', items: [] }
    ];

    const activeSceneData = mockScenes.find(s => s.name === activeSceneName);

    const handleSwitchScene = (sceneName: string) => {
        setProgramSceneName(sceneName);
        setActiveSceneName(sceneName);
    };

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

            <div className="flex-1 overflow-hidden">
                {activeTab === 'OBS' ? (
                    isConnected ? (
                        <div className="h-full flex flex-col p-3">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-gray-500">已连接至 {connectionConfig.ip}:{connectionConfig.port}</span>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                    断开连接
                                </button>
                            </div>

                            {/* Main Layout: Tree View (60%) + Preview (40%) */}
                            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                                {/* Column 1: Tree View (Approx 60% -> col-span-7) */}
                                <div className="col-span-7 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
                                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
                                        <h4 className="text-xs font-black text-gray-700">场景 & 来源</h4>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                        {mockScenes.map(scene => {
                                            const isExpanded = activeSceneName === scene.name;
                                            const isProgram = programSceneName === scene.name;

                                            return (
                                                <div key={scene.name} className="mb-1">
                                                    {/* Scene Row */}
                                                    <div
                                                        onClick={() => setActiveSceneName(scene.name)}
                                                        className={`px-2 py-2 rounded-md cursor-pointer flex items-center justify-between group transition-colors ${activeSceneName === scene.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            {/* Caret */}
                                                            <div className={`text-gray-400 transition-transform duration-200 ${activeSceneName === scene.name ? 'rotate-90' : ''}`}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M9 18l6-6-6-6" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Layout size={14} className={activeSceneName === scene.name ? 'text-blue-600' : 'text-gray-500'} />
                                                                <span className={`text-xs font-bold truncate ${activeSceneName === scene.name ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                    {scene.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions: Always Visible Switch Button */}
                                                        <div className="flex items-center gap-2 pl-2">
                                                            {isProgram ? (
                                                                <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-black shadow-sm tracking-wide">
                                                                    PGM
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSwitchScene(scene.name);
                                                                    }}
                                                                    className="bg-white border border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 text-[10px] px-3 py-1 rounded font-bold transition-all shadow-sm hover:shadow"
                                                                >
                                                                    切换
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Sources Children */}
                                                    {activeSceneName === scene.name && (
                                                        <div className="pl-6 pr-2 py-1 space-y-0.5">
                                                            {scene.items.length > 0 ? (
                                                                scene.items.map((item) => (
                                                                    <div key={item.sceneItemId} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 group/source">
                                                                        <div className="w-px h-3 bg-gray-200"></div>
                                                                        <div className="w-3.5 h-3.5 flex items-center justify-center bg-gray-100 rounded text-gray-500">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.sceneItemEnabled ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                                                        </div>
                                                                        <span className={`text-[11px] font-medium truncate flex-1 ${!item.sceneItemEnabled ? 'opacity-50 line-through' : ''}`}>
                                                                            {item.sourceName}
                                                                        </span>
                                                                        <span className="text-[9px] text-gray-300 font-mono hidden group-hover/source:block">
                                                                            ID:{item.sceneItemId}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="pl-4 py-1 text-[10px] text-gray-400 italic">空场景 (No Sources)</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Column 2: Layout Preview (Approx 40% -> col-span-5) */}
                                <div className="col-span-5 flex flex-col min-h-0">
                                    <div className="bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden h-full">
                                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 shrink-0">
                                            <h4 className="text-xs font-black text-gray-700">布局预览</h4>
                                        </div>
                                        <div className="flex-1 bg-gray-800 p-2 flex items-center justify-center relative overflow-hidden">
                                            <div className="aspect-video w-full bg-black relative shadow-2xl overflow-hidden max-h-full">
                                                {activeSceneData?.items.map(item => {
                                                    if (!item.sceneItemEnabled) return null;

                                                    const t = item.sceneItemTransform;
                                                    const canvasW = 1920;
                                                    const canvasH = 1080;

                                                    let width = t.boundsType !== 'OBS_BOUNDS_NONE' ? t.boundsWidth : (t.sourceWidth * t.scaleX);
                                                    let height = t.boundsType !== 'OBS_BOUNDS_NONE' ? t.boundsHeight : (t.sourceHeight * t.scaleY);

                                                    if (width === 0) width = 100;
                                                    if (height === 0) height = 100;

                                                    const left = (t.positionX / canvasW) * 100;
                                                    const top = (t.positionY / canvasH) * 100;
                                                    const wPct = (width / canvasW) * 100;
                                                    const hPct = (height / canvasH) * 100;

                                                    return (
                                                        <div
                                                            key={item.sceneItemId}
                                                            className="absolute border border-blue-500/50 bg-blue-500/20 hover:bg-blue-500/40 transition-colors flex items-start justify-start p-0.5 text-[6px] text-white/80 overflow-hidden"
                                                            style={{
                                                                left: `${left}%`,
                                                                top: `${top}%`,
                                                                width: `${wPct}%`,
                                                                height: `${hPct}%`,
                                                                transform: `rotate(${t.rotation}deg)`,
                                                                zIndex: item.sceneItemIndex
                                                            }}
                                                            title={`${item.sourceName} (${Math.round(width)}x${Math.round(height)})`}
                                                        >
                                                            <div className="bg-black/60 px-1 rounded truncate max-w-full inline-block backdrop-blur-sm">
                                                                {item.sourceName}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 flex flex-col items-center justify-center h-full">
                            <div className="w-full max-w-[320px] space-y-5">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3 text-gray-400">
                                        <Layout size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">OBS 连接设置</h3>
                                    <p className="text-xs text-gray-400 mt-1">请输入 OBS WebSocket 服务信息进行连接</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <label className="w-16 text-right text-xs font-black text-gray-700">IP地址:</label>
                                        <input
                                            type="text"
                                            value={connectionConfig.ip}
                                            onChange={(e) => setConnectionConfig({ ...connectionConfig, ip: e.target.value })}
                                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="127.0.0.1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="w-16 text-right text-xs font-black text-gray-700">端口:</label>
                                        <input
                                            type="text"
                                            value={connectionConfig.port}
                                            onChange={(e) => setConnectionConfig({ ...connectionConfig, port: e.target.value })}
                                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="4455"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="w-16 text-right text-xs font-black text-gray-700">密码:</label>
                                        <input
                                            type="password"
                                            value={connectionConfig.password}
                                            onChange={(e) => setConnectionConfig({ ...connectionConfig, password: e.target.value })}
                                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-[76px] mt-2">
                                    <button
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                连接中...
                                            </>
                                        ) : (
                                            '连接 OBS'
                                        )}
                                    </button>
                                    {!isConnecting && <span className="text-xs font-bold text-red-100 bg-red-500/10 px-2 py-1 rounded text-red-500">未连接</span>}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold">
                        暂无其他设置
                    </div>
                )}
            </div>
        </div>
    );
};


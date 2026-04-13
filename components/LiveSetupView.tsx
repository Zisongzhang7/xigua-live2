
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ChevronLeft,
  ChevronRight,
  History,
  PlayCircle,
  Upload,
  Maximize2,
  Minimize2,
  Mic,
  Video,
  MicOff,
  VideoOff,
  Monitor,
  Info,
  Users,
  Plus,
  MessageSquare,
  Sparkles,
  Link2,
  Gift,
  Settings2,
  Save,
  FolderOpen,
  List,
  Clock,
  Play,
  TestTube2,
  Trash2,
  ChevronDown,
  X,
  Search,
  AlertCircle,
  GraduationCap,
  BookOpen,
  UserCircle,
  PictureInPicture2,
  Hash,
  Copy,
  FileSpreadsheet,
  Download,
  GripVertical,
  LayoutList,
  Check,
  Filter,
  BarChart2,
  Tag as TagIcon,
  RotateCcw,
  FileStack,
  RefreshCcw,
  StopCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { LiveStream, LiveType, InteractionCategory, InteractiveResource, InteractionItem, LiveSession, LiveHistoryItem, PlaybackMethod } from '../types';
import { PlaybackConfigModal } from './LiveHistoryComponents';
import { UnifiedSessionList, UnifiedSessionItem } from './UnifiedSessionList';
import { COMMON_LABELS } from '../App';
import LiveSessionModal from './LiveSessionModal';
import CreateLiveModal from './CreateLiveModal';
import StudentTimeStream, { MutedUser } from './StudentTimeStream';
import { QuizCard, QuizStatus } from './QuizCard';
import { VoteCard, VoteStatus } from './VoteCard';
import { DebateCard, DebateStatus } from './DebateCard';
import { EliminationCard, EliminationStatus } from './EliminationCard';
import { GandiCard, GandiStatus } from './GandiCard';
import { LinkCard, LinkStatus } from './LinkCard';
import { ModelCard, ModelStatus } from './ModelCard';
import { SliceListCard, SliceListStatus } from './SliceListCard';
import { AISwitchCard, AISwitchStatus } from './AISwitchCard';
import { db } from '../services/db';
import {
  InteractionCategoryGroup,
  TagItem,
  ModeTab,
  InteractionToggle,
  CascadingSearchSelector,
  ResourceSelectionModal,
  SearchableSelector,
  SearchableMultiSelect,
  InteractionItemView,
  DB,
  SaveTemplateModal,
  ConfirmModal,
  ResizableLayout
} from './LiveSetupComponents';
import { ObsControlPanel } from './LiveStreamControls';
import { LinkMicPanel } from './LinkMicPanel';
import { liveAuthService } from '../services/LiveAuthService';

interface LiveSetupViewProps {
  stream: LiveStream;
  resources: InteractiveResource[];
  onBack: () => void;
  onSaveStream?: (stream: LiveStream) => void;
  allLabels: string[];
}

// Mock Database for Selectors
// DB imported from LiveSetupComponents


const MAIN_CATEGORIES = [
  InteractionCategory.COURSE_SLICE,
  InteractionCategory.VIDEO,
  InteractionCategory.GANDI_EMBED,
  InteractionCategory.LINK
];



const OVERLAY_CATEGORIES = [
  InteractionCategory.QUIZ,
  InteractionCategory.DEBATE,
  InteractionCategory.ONE_STAND,
  InteractionCategory.VOTE,
  InteractionCategory.VOTE,
  InteractionCategory.MODEL,
  InteractionCategory.AI_SWITCH
];

const parseTime = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

type AudienceMode = 'CLASS' | 'COURSE' | 'USER_TYPE' | 'ID';

interface InteractionState {
  status: QuizStatus | VoteStatus | DebateStatus | EliminationStatus | GandiStatus | LinkStatus | ModelStatus | SliceListStatus | AISwitchStatus;
  votes: Record<string, number> | { pro: number; con: number };
  isExpanded: boolean;
}

const LiveSetupView: React.FC<LiveSetupViewProps> = ({ stream: initialStream, resources, onBack, onSaveStream, allLabels }) => {
  const [stream, setStream] = useState<LiveStream>(initialStream);

  // Monitor Fullscreen Logic
  const monitorCardRef = useRef<HTMLDivElement>(null);
  const [isMonitorFullscreen, setIsMonitorFullscreen] = useState(false);

  const toggleMonitorFullscreen = () => {
    if (!document.fullscreenElement) {
      monitorCardRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMonitorFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  console.log("LiveSetupView mounting", stream);

  // Viewport Mode: SETUP | LIVE
  const [isLiveMode, setIsLiveMode] = useState(false);

  /** 弹幕禁言：动态流与 OBS「禁言用户」面板共用 */
  const [mutedUsersMap, setMutedUsersMap] = useState<Record<string, MutedUser>>({});
  const handleMuteUser = useCallback((u: Pick<MutedUser, 'studentId' | 'studentName' | 'avatar' | 'teamName'>) => {
    setMutedUsersMap(prev => ({
      ...prev,
      [u.studentId]: { ...u, mutedAt: Date.now() }
    }));
  }, []);
  const handleUnmuteUser = useCallback((studentId: string) => {
    setMutedUsersMap(prev => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  }, []);
  const mutedUsersList = useMemo((): MutedUser[] => {
    return (Object.values(mutedUsersMap) as MutedUser[]).sort((a, b) => b.mutedAt - a.mutedAt);
  }, [mutedUsersMap]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectionModalCategoryFilter, setSelectionModalCategoryFilter] = useState<InteractionCategory[] | undefined>(undefined);
  const [selectedMainTrackId, setSelectedMainTrackId] = useState<string | null>(null); // New State for focusing Main item
  const [activeMainTrackId, setActiveMainTrackId] = useState<string | null>(null); // Currently Live Main Item
  const [completedMainTrackIds, setCompletedMainTrackIds] = useState<Set<string>>(new Set()); // History of played items
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); // Selected Session for Start Live
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null); // State for selected history session
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateFilterName, setTemplateFilterName] = useState('');
  const [templateFilterTags, setTemplateFilterTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [templateFilterCreator, setTemplateFilterCreator] = useState('');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null); // Track loaded template
  const [currentTemplateName, setCurrentTemplateName] = useState<string | null>(null); // Track loaded template name
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false); // New modal state
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; content: string; onConfirm: () => void }>({ isOpen: false, title: '', content: '', onConfirm: () => { } });


  // Initialize from stream data
  const [interactionsList, setInteractionsList] = useState<InteractionItem[]>(initialStream.configuredInteractions || []);
  // Auto-save interactions to DB whenever interactionsList changes
  // REMOVED: This logic is now handled by the Session Switching Logic below
  /*
  useEffect(() => {
    if (stream && stream.id) {
      db.streams.update(stream.id, { configuredInteractions: interactionsList });
    }
  }, [interactionsList, stream.id]);
  */


  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Auto-play Engine
  const [isTestLiveModalOpen, setIsTestLiveModalOpen] = useState(false);
  const [testStudentIds, setTestStudentIds] = useState('');
  const [isTestLive, setIsTestLive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          const nextTime = t + 1;
          interactionsList.forEach(item => {
            const triggerSecs = parseTime(item.time);
            if (Math.abs(triggerSecs - nextTime) < 1 && item.triggerMode === 'AUTO_TIME') {
              // Trigger logic: Set status to ACTIVE/VOTING/ANSWERING based on type
              // For now, we update state if it's currently IDLE (default)
              const currentState = getInteractionState(item.id);
              // Simple heuristic mapping
              let newStatus: any = 'ACTIVE';
              if (item.type === InteractionCategory.QUIZ) newStatus = 'ACTIVE';
              if (item.type === InteractionCategory.VOTE) newStatus = 'ACTIVE';
              if (item.type === InteractionCategory.DEBATE) newStatus = 'PHASE1';

              if (currentState.status === 'IDLE') {
                updateInteractionState(item.id, { status: newStatus });
              }
            }
          });
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, interactionsList]);

  // Fetch templates for the modal using Dexie
  const templates = useLiveQuery(() => db.templates.toArray(), []) || [];

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchName = !templateFilterName || t.name.toLowerCase().includes(templateFilterName.toLowerCase());
      const matchTags = templateFilterTags.length === 0 || (t.labels && templateFilterTags.every(tag => t.labels.includes(tag)));
      const matchCreator = !templateFilterCreator || (t.creator && t.creator.toLowerCase().includes(templateFilterCreator.toLowerCase()));
      return matchName && matchTags && matchCreator;
    });
  }, [templates, templateFilterName, templateFilterTags, templateFilterCreator]);

  // MOCK HISTORY replaced with State
  const [historyList, setHistoryList] = useState<LiveHistoryItem[]>(Array.from({ length: 15 }).map((_, i) => ({
    id: `h${i + 1}`,
    name: `第${15 - i}场：${['开幕式', '专家讲座', '互动答疑', '期末复习', '考前冲刺'][i % 5]}`,
    coverUrl: `https://images.unsplash.com/photo-${['1544531586-fde5298cdd40', '1517486808906-6ca8b3f04846', '1524178232363-1fb2b075b655'][i % 3]}?q=80&w=200`,
    startTime: new Date(Date.now() - (i + 1) * 86400000).toISOString(), // Past dates
    endTime: new Date(Date.now() - (i + 1) * 86400000 + 7200000).toISOString(),
    hostName: ['张老师', '李教授', '王老师'][i % 3],
    participantCount: 500 + i * 50,
    hasPlayback: i % 2 === 0,
    playbackMethod: i % 2 === 0 ? 'UPLOAD_JSON' : undefined,
    visibleAudience: ['高一(3)班', '高一(4)班'],
    className: '高一(3)班',
    lessonName: `第${15 - i}课：函数基础`,
    linkedLessonId: `L00${i + 1}`,
    configuredInteractions: [
      {
        id: `h-q-${i}`,
        title: '开场测验：基础概念回顾',
        type: InteractionCategory.QUIZ,
        time: '00:05:00',
        track: 'OVERLAY',
        triggerMode: 'MANUAL',
        config: {
          options: [{ text: '概念A' }, { text: '概念B' }, { text: '概念C' }],
          correctAnswer: '1'
        }
      },
      {
        id: `h-v-${i}`,
        title: '互动投票：你最感兴趣的章节',
        type: InteractionCategory.VOTE,
        time: '00:45:00',
        track: 'OVERLAY',
        triggerMode: 'MANUAL',
        config: {
          options: [{ text: '章节1' }, { text: '章节2' }, { text: '章节3' }]
        }
      }
    ]
  })));

  const [playbackModalConfig, setPlaybackModalConfig] = useState<{ isOpen: boolean; item: LiveHistoryItem | null }>({ isOpen: false, item: null });

  const handleTogglePlayback = (item: LiveHistoryItem, enable: boolean) => {
    setHistoryList(prev => prev.map(h =>
      h.id === item.id ? { ...h, hasPlayback: enable } : h
    ));
  };

  const handleConfigurePlayback = (item: LiveHistoryItem) => {
    setPlaybackModalConfig({ isOpen: true, item });
  };

  const handlePlaybackConfirm = (method: PlaybackMethod, config?: any) => {
    if (playbackModalConfig.item) {
      setHistoryList(prev => prev.map(h =>
        h.id === playbackModalConfig.item!.id ? { ...h, hasPlayback: true, playbackMethod: method, playbackConfig: config } : h
      ));
    }
  };

  // Sort history by start time descending (latest first)
  const sortedHistory = [...historyList].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const combinedSessions = useMemo<UnifiedSessionItem[]>(() => {
    const upcoming = (stream.sessions || []).map(s => ({ ...s, _type: 'upcoming' as const }));
    const history = historyList.map(h => ({ ...h, _type: 'history' as const }));
    return [...upcoming, ...history].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [stream.sessions, historyList]);


  // Sync interactionsList changes to stream state and persist
  useEffect(() => {
    if (interactionsList !== initialStream.configuredInteractions) {
      const updatedStream = { ...stream, configuredInteractions: interactionsList };
      onSaveStream?.(updatedStream);
    }
  }, [interactionsList]);

  // State Container for Interaction Runtime Data
  const [interactionStates, setInteractionStates] = useState<Record<string, InteractionState>>({});

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Device Selection States
  const [selectedMic, setSelectedMic] = useState('默认麦克风 (Built-in)');
  const [selectedCam, setSelectedCam] = useState('FaceTime HD Camera');
  const [selectedScreen, setSelectedScreen] = useState('不共享');

  // Lifted States for Controls
  const [cutInMode, setCutInMode] = useState<'NONE' | 'FULLSCREEN' | 'PIP'>('NONE');
  const [audioSource, setAudioSource] = useState('default');
  const [videoSource, setVideoSource] = useState('facetime');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isObsCollapsed, setIsObsCollapsed] = useState(false);

  // --- Auth Flow Logic ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authModalType, setAuthModalType] = useState<'NONE' | 'LOGIN' | 'CONFLICT' | 'NO_PERMISSION'>('NONE');
  const [authConflictInfo, setAuthConflictInfo] = useState<any>(null);
  const [authStudentId, setAuthStudentId] = useState('');
  const [hasPassedAuth, setHasPassedAuth] = useState(false);

  const checkAuthStatus = async () => {
    setIsCheckingAuth(true);
    try {
      // 1. Check Token
      const hasToken = liveAuthService.checkToken();
      if (!hasToken) {
        setAuthModalType('LOGIN');
        setHasPassedAuth(false);
        setIsCheckingAuth(false);
        return;
      }

      // 2. Check Permission
      const sessionId = selectedSessionId || 'default-session';
      const hasPermission = await liveAuthService.checkPermission(sessionId);

      if (hasPermission) {
        // Success
        setAuthModalType('NONE');
        setHasPassedAuth(true);
      } else {
        setHasPassedAuth(false);
        // 3. Check Conflict
        const conflictResult = await liveAuthService.checkConflict(sessionId);
        if (conflictResult.code === 'CONFLICT') {
          setAuthConflictInfo(conflictResult.conflictInfo);
          setAuthModalType('CONFLICT');
        } else {
          setAuthModalType('NO_PERMISSION');
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // alert("鉴权服务异常，请稍后重试"); // Don't alert on auto-check
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Initial check on mount or session change
  useEffect(() => {
    checkAuthStatus();
  }, [selectedSessionId]);

  const handleEnterRoom = async () => {
    if (hasPassedAuth) {
      setupMedia();
    } else {
      checkAuthStatus();
    }
  };

  const handleAuthLogin = async () => {
    if (!authStudentId.trim()) return;
    setIsCheckingAuth(true);
    await liveAuthService.login(authStudentId);
    // Retry check
    await checkAuthStatus();
  };

  const handleAuthRegister = async (dropConflict: boolean) => {
    setIsCheckingAuth(true);
    const sessionId = selectedSessionId || 'default-session';
    await liveAuthService.registerClass(sessionId, dropConflict);
    // Retry check
    await checkAuthStatus();
  };
  // -----------------------

  const toggleCutInMode = (mode: 'FULLSCREEN' | 'PIP') => {
    if (cutInMode === mode) {
      setCutInMode('NONE');
    } else {
      setCutInMode(mode);
    }
  };

  // Audience Configuration
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('CLASS');
  const [selectedItems, setSelectedItems] = useState<Record<AudienceMode, string[]>>({
    CLASS: ['一年级一班'],
    COURSE: [],
    USER_TYPE: ['普通学生'],
    ID: []
  });

  // Interaction Toggles
  const [interactions, setInteractions] = useState({
    danmaku: true,
    weakenBackgroundAudio: false, // New sub-switch state
    confirmDanmaku: false, // New sub-switch state: confirm before sending
    im: true,
    team: false,
    linkMic: false,
    // redEnvelope: false, // Removed
    // linkUp: true // Removed
  });

  // --- Session Switching Logic ---

  // 1. When interactionsList changes, sync it back to the CURRENT selected session in the stream object
  useEffect(() => {
    if (selectedSessionId) {
      setStream(prevStream => {
        const updatedSessions = (prevStream.sessions || []).map(s => {
          if (s.id === selectedSessionId) {
            return { ...s, configuredInteractions: interactionsList };
          }
          return s;
        });

        // Only update if actually changed to avoid loop
        const currentSession = prevStream.sessions?.find(s => s.id === selectedSessionId);
        if (JSON.stringify(currentSession?.configuredInteractions) !== JSON.stringify(interactionsList)) {
          const newStream = { ...prevStream, sessions: updatedSessions };
          // Persist immediately
          db.streams.update(prevStream.id, { sessions: updatedSessions });
          return newStream;
        }
        return prevStream;
      });
    }
  }, [interactionsList, selectedSessionId]);

  // 2. When selectedSessionId changes, load that session's interactions into interactionsList
  useEffect(() => {
    if (selectedSessionId) {
      const session = stream.sessions?.find(s => s.id === selectedSessionId);
      if (session) {
        setInteractionsList(session.configuredInteractions || []);
      }
    }
  }, [selectedSessionId]); // Dependency on ID only, looking up in current stream state

  // 2b. When selectedHistoryId changes, load that history item's interactions into interactionsList
  useEffect(() => {
    if (selectedHistoryId) {
      const historyItem = historyList.find(h => h.id === selectedHistoryId);
      if (historyItem) {
        setInteractionsList(historyItem.configuredInteractions || []);
      }
    }
  }, [selectedHistoryId, historyList]);

  // Audio/Video Visualizer Logic
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaPermissionError, setMediaPermissionError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const setupMedia = async () => {
    try {
      setMediaPermissionError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // 请求视频和音频权限
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        streamRef.current = mediaStream;

        // 设置视频流
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.muted = true; // 本地预览静音，防止回声
        }

        // 设置音频分析
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            setAudioLevel(average / 128);
          }
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } else {
        console.warn("Media devices not supported in this environment");
        setMediaPermissionError("浏览器不支持媒体设备访问");
      }
    } catch (err: any) {
      console.error("Media Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMediaPermissionError("摄像头或麦克风权限被拒绝");
      } else if (err.name === 'NotFoundError') {
        setMediaPermissionError("未检测到摄像头或麦克风设备");
      } else {
        setMediaPermissionError("媒体设备初始化失败");
      }
    }
  };

  useEffect(() => {
    setupMedia();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Set initial selected main track if available
  useEffect(() => {
    if (!selectedMainTrackId && interactionsList.some(i => i.track === 'MAIN')) {
      const firstMain = interactionsList.find(i => i.track === 'MAIN');
      if (firstMain) setSelectedMainTrackId(firstMain.id);
    }
  }, [interactionsList]);

  const toggleInteraction = (key: keyof typeof interactions) => {
    setInteractions(prev => {
      // If turning off danmaku, also turn off weakenBackgroundAudio? Or just keep it state.
      // Let's just toggle.
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleDownloadHistoryData = (historyId: string) => {
    const historyItem = historyList.find(h => h.id === historyId);
    if (!historyItem) return;

    const dataToDownload = {
      ...historyItem,
      downloadedAt: new Date().toISOString(),
      source: 'LiveMaster Control'
    };

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-data-${historyItem.id}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateStream = (updatedStream: LiveStream) => {
    setStream(updatedStream);
    onSaveStream?.(updatedStream);
    onSaveStream?.(updatedStream);
    setIsEditModalOpen(false);
  };

  const handleAddSession = (session: Omit<LiveSession, 'id'>) => {
    const newSession: LiveSession = { ...session, id: `sess-${Date.now()}` };
    const updatedStream = { ...stream, sessions: [...(stream.sessions || []), newSession] };
    handleUpdateStream(updatedStream);
  };

  const handleDeleteSession = (id: string) => {
    const updatedSessions = (stream.sessions || []).filter(s => s.id !== id);
    const updatedStream = { ...stream, sessions: updatedSessions };
    handleUpdateStream(updatedStream);

    if (selectedSessionId === id) {
      if (updatedSessions.length > 0) {
        // Select the first available session if the current one is deleted
        setSelectedSessionId(updatedSessions[0].id);
      } else {
        // No sessions left
        setSelectedSessionId(null);
      }
    }
  };

  const confirmDeleteSession = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认删除场次',
      content: '删除后无法恢复，是否确认删除该直播场次？',
      onConfirm: () => {
        handleDeleteSession(id);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateSession = (id: string, updates: Partial<LiveSession>) => {
    const updatedStream = {
      ...stream,
      sessions: (stream.sessions || []).map(s => s.id === id ? { ...s, ...updates } : s)
    };
    handleUpdateStream(updatedStream);
  };

  const removeItem = (mode: AudienceMode, val: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [mode]: prev[mode].filter(i => i !== val)
    }));
  };

  const addItem = (mode: AudienceMode, val: string) => {
    if (!selectedItems[mode].includes(val)) {
      setSelectedItems(prev => ({
        ...prev,
        [mode]: [...prev[mode], val]
      }));
    }
  };



  const handleAddInteraction = (categories?: InteractionCategory[]) => {
    // Special handling for AI Switch: Add directly without resource selection
    if (categories && categories.length === 1 && categories[0] === InteractionCategory.AI_SWITCH) {
      const newInteraction: InteractionItem = {
        id: `AI-${Date.now()}`,
        title: 'AI 助手开关',
        type: InteractionCategory.AI_SWITCH,
        time: '00:00',
        label: '系统组件',
        track: 'OVERLAY',
        triggerMode: 'MANUAL',
        duration: 0,
        config: {
          agentId: '数学辅导 Agent',
          displayMode: 'LARGE'
        }
      };

      setInteractionsList(prev => [...prev, newInteraction]);
      return;
    }

    setSelectionModalCategoryFilter(categories);
    setIsSelectionModalOpen(true);
  };

  const handleResourceSelected = (resource: InteractiveResource) => {
    // Special Case: Course Slice Resource - Explode into multiple items
    if (resource.category === InteractionCategory.COURSE_SLICE && resource.config?.slices) {
      const mode = (resource as any)._mode;
      const originalSlices = resource.config?.slices || [];
      const slices = mode === 'homework_only'
        ? originalSlices.filter((s: any) => s.title.includes('作业') || s.type === 'TEXT')
        : originalSlices;

      const newItems: InteractionItem[] = [{
        id: `IR-SLICE-${Date.now()}`,
        resourceId: resource.id,
        title: resource.name, // Use the resource name (Lesson Name)
        type: InteractionCategory.COURSE_SLICE,
        time: '00:00',
        label: resource.name,
        config: {
          ...resource.config,
          slices: slices // Use filtered slices
        },
        track: 'MAIN',
        triggerMode: 'MANUAL',
        duration: 0
      }];

      setInteractionsList(prev => {
        const newList = [...prev];
        if (selectedMainTrackId) {
          const selectedIndex = prev.findIndex(item => item.id === selectedMainTrackId);
          if (selectedIndex !== -1) {
            newList.splice(selectedIndex + 1, 0, ...newItems);
            return newList;
          }
        }
        newList.push(...newItems);
        return newList;
      });

      // Select the first slice
      if (newItems.length > 0) {
        setSelectedMainTrackId(newItems[0].id);
      }

      setIsSelectionModalOpen(false);
      return;
    }

    const isMain = MAIN_CATEGORIES.includes(resource.category);

    const newInteraction: InteractionItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      resourceId: resource.id,
      title: resource.name,
      type: resource.category,
      time: '00:00',
      label: '从资源库导入',
      config: resource.config,
      track: isMain ? 'MAIN' : 'OVERLAY',
      parentId: !isMain ? (selectedMainTrackId || undefined) : undefined,
      triggerMode: 'MANUAL',
      duration: 300
    };

    setInteractionsList(prev => {
      const newList = [...prev];
      if (isMain && selectedMainTrackId) {
        const selectedIndex = prev.findIndex(item => item.id === selectedMainTrackId);
        if (selectedIndex !== -1) {
          newList.splice(selectedIndex + 1, 0, newInteraction);
          return newList;
        }
      }
      newList.push(newInteraction);
      return newList;
    });

    if (isMain) {
      setSelectedMainTrackId(newInteraction.id);
    }

    setIsSelectionModalOpen(false);
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractionsList(interactionsList.filter(item => item.id !== id));
    setInteractionStates(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setInteractionsList(interactionsList.map(item =>
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  const handleUpdateInteraction = (id: string, changes: Partial<InteractionItem>) => {
    setInteractionsList(interactionsList.map(item => item.id === id ? { ...item, ...changes } : item));
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newList = [...interactionsList];
    const item = newList.splice(draggedItemIndex, 1)[0];
    if (!item) return;

    newList.splice(index, 0, item);

    setInteractionsList(newList);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const getInteractionState = (id: string): InteractionState => {
    return interactionStates[id] || { status: 'IDLE', votes: {}, isExpanded: false };
  };

  const updateInteractionState = (id: string, partial: Partial<InteractionState>) => {
    setInteractionStates(prev => {
      const current = prev[id] || { status: 'IDLE', votes: {}, isExpanded: false };
      return {
        ...prev,
        [id]: { ...current, ...partial }
      };
    });
  };

  const handleStartMainItem = (id: string) => {
    // If there is currently an active item, mark it as completed
    if (activeMainTrackId && activeMainTrackId !== id) {
      setCompletedMainTrackIds(prev => new Set(prev).add(activeMainTrackId));
    }

    // Set new item as active
    setActiveMainTrackId(id);

    // Also select it to show its overlay content
    setSelectedMainTrackId(id);
  };

  const handleStopMainItem = (id: string) => {
    if (activeMainTrackId === id) {
      setActiveMainTrackId(null);
      setCompletedMainTrackIds(prev => new Set(prev).add(id));
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && template.items) {
      setConfirmConfig({
        isOpen: true,
        title: '确认加载模板',
        content: `是否确认加载模板 “${template.name}”？\n此操作将覆盖当前已配置的所有交互内容。`,
        onConfirm: () => {
          // 1. Create a map of Old ID -> New ID
          const idMap = new Map<string, string>();
          template.items.forEach(item => {
            idMap.set(item.id, `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
          });

          // 2. Map items with new IDs and updated parentId
          const newItems = template.items.map(item => ({
            ...item,
            id: idMap.get(item.id)!,
            parentId: item.parentId ? idMap.get(item.parentId) : undefined
          }));
          setInteractionsList(newItems);
          setCurrentTemplateId(templateId);
          setCurrentTemplateName(template.name);
          setIsTemplateModalOpen(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      console.error("Template data missing or invalid:", template);
      alert("无法加载模板：模板数据不完整 (缺少 items 配置)");
    }
  };

  const handleSaveTemplate = () => {
    if (currentTemplateId) {
      setConfirmConfig({
        isOpen: true,
        title: '确认保存',
        content: '是否确认覆盖当前模板的配置？此操作不仅影响当前直播，还会更新所有使用此模板的场景。',
        onConfirm: async () => {
          await db.templates.update(currentTemplateId, {
            items: interactionsList,
            interactionCount: interactionsList.length,
            modifiedAt: new Date().toLocaleString()
          });
          // Optional: Add toast success here
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handleSaveAsTemplate = async (name: string, labels: string[]) => {
    const newId = `IT-${Date.now()}`;
    await db.templates.add({
      id: newId,
      name: name,
      labels: labels,
      interactionCount: interactionsList.length,
      creator: '当前用户', // Should be dynamic in real app
      modifiedAt: new Date().toLocaleString(),
      items: interactionsList
    });
    setCurrentTemplateId(newId);
    setCurrentTemplateName(name);
    // alert('新模板已创建！'); // Optional feedback
  };

  const handleClearInteractions = () => {
    setConfirmConfig({
      isOpen: true,
      title: '确认清空',
      content: '确认要清空当前所有交互配置吗？此操作无法撤销。',
      onConfirm: () => {
        setInteractionsList([]);
        setCurrentTemplateId(null);
        setCurrentTemplateName(null);
        setInteractionStates({});
        setSelectedMainTrackId(null);
        setActiveMainTrackId(null);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleStartTestLive = () => {
    setIsTestLive(true);
    setIsLiveMode(true);
    setIsTestLiveModalOpen(false);
  };

  const startLiveValidation = useMemo(() => {
    // 1. Must select a session OR a history item to restart
    if (selectedHistoryId) return { valid: true, msg: '' };

    if (!selectedSessionId) return { valid: false, msg: '未选择直播场次' };

    const session = stream.sessions?.find(s => s.id === selectedSessionId);
    if (!session) return { valid: false, msg: '选择的场次无效' };

    // 2. Session Data Validation based on Type
    if (stream.type === LiveType.ORDINARY) {
      if (!session.visibleAudience || session.visibleAudience.length === 0) {
        return { valid: false, msg: '该场次未配置可见人群' };
      }
    } else {
      // COURSE
      if (!session.linkedLessonId) {
        return { valid: false, msg: '该场次未关联课节' };
      }
    }

    return { valid: true, msg: '' };
  }, [stream.type, selectedSessionId, selectedHistoryId, stream.sessions]);

  const [sessionModalConfig, setSessionModalConfig] = useState<{ isOpen: boolean; isEditing: boolean; data?: Partial<LiveSession> }>({ isOpen: false, isEditing: false });

  const handleOpenAddSession = () => {
    // Open modal instead of direct add
    setSessionModalConfig({ isOpen: true, isEditing: false });
  };

  const handleOpenEditSession = (session: LiveSession) => {
    setSessionModalConfig({ isOpen: true, isEditing: true, data: session });
  };

  const handleSaveSessionModal = (sessionData: Partial<LiveSession>) => {
    if (sessionModalConfig.isEditing && sessionModalConfig.data?.id) {
      handleUpdateSession(sessionModalConfig.data.id, sessionData);
    } else {
      // Add new session
      const newSession: LiveSession = {
        id: `sess-${Date.now()}`,
        name: sessionData.name || '未命名场次',
        hostName: sessionData.hostName || stream.teacher || '',
        startTime: sessionData.startTime || new Date().toISOString().substring(0, 16),
        coverUrl: sessionData.coverUrl,
        linkedLessonId: sessionData.linkedLessonId,
        linkedLessonName: sessionData.linkedLessonName,
        visibleAudience: sessionData.visibleAudience || [],
        audienceMode: sessionData.audienceMode,
        // Late Config
        latePolicy: sessionData.latePolicy,
        lateTime: sessionData.lateTime,
        lateBlockMessage: sessionData.lateBlockMessage,
        // Initialize other fields
        configuredInteractions: [],
        mediaConfig: undefined,
        obsConfig: undefined
      };

      const updatedStream = { ...stream, sessions: [...(stream.sessions || []), newSession] };
      handleUpdateStream(updatedStream);
      // Automatically select the new session
      setSelectedSessionId(newSession.id);
    }
    // Close modal
    setSessionModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5]">
      {/* Toolbar */}
      <div className={`border-b px-3 py-1.5 flex justify-between items-center z-10 shadow-sm transition-colors duration-300 ${isLiveMode ? (isTestLive ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100') : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors flex items-center gap-0.5 font-medium text-[10px]"
          >
            <ChevronLeft size={14} />
            退出
          </button>
          <div className="h-3 w-px bg-gray-200 mx-1"></div>
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-xs font-bold text-gray-800 truncate max-w-[300px]">
                {stream.name}
              </h2>
              <span className="px-1 py-0.5 rounded-full text-[9px] font-black border border-gray-200 bg-white text-gray-600 whitespace-nowrap leading-none">
                {stream.type === LiveType.COURSE ? '课程' : '普通'}
              </span>
              {!isLiveMode && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap leading-none"
                >
                  编辑
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Playback/Live Controls */}
        {isLiveMode && (
          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTestLive ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTestLive ? 'bg-orange-500' : 'bg-red-500'}`}></span>
              </span>
              <span className={`${isTestLive ? 'text-orange-500' : 'text-red-500'} font-black text-[10px] uppercase tracking-wider`}>
                {isTestLive ? '测试中' : '直播中'}
              </span>
              <div className="w-px h-3 bg-gray-300 mx-1" />
              <div className="font-mono text-sm font-bold text-gray-800">00:12:45</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 relative">
          {isLiveMode ? (
            <>
              <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 rounded-md border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all flex items-center gap-1 text-[10px] font-bold shadow-sm"
              >
                <RefreshCcw size={12} /> 全量刷新
              </button>
              <button
                onClick={() => {
                  setIsLiveMode(false);
                  setIsTestLive(false);
                }}
                className={`px-3 py-1 rounded-md text-white transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold active:scale-95 ${isTestLive ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
              >
                <StopCircle size={12} fill="currentColor" /> {isTestLive ? '结束' : '停止'}
              </button>
            </>
          ) : (
            <>

              <button
                onClick={() => setIsTestLiveModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <TestTube2 size={14} />
                测试
              </button>
              {/* Tooltip Wrapper */}
              <div
                className="relative group/tooltip"
                title={!startLiveValidation.valid ? startLiveValidation.msg : ''}
              >
                <button
                  onClick={() => {
                    setIsLiveMode(true);
                    if (selectedHistoryId) {
                      setSelectedHistoryId(null);
                    }
                  }}
                  disabled={!startLiveValidation.valid}
                  className={`px-4 py-1.5 rounded-lg transition-all shadow-lg flex items-center gap-1.5 text-xs font-bold active:scale-95 ${!startLiveValidation.valid
                    ? 'bg-gray-300 text-white cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                    }`}
                >
                  <Play size={14} fill="white" />
                  开始直播
                </button>
                {/* Custom Tooltip for better visibility if browser tooltip is not enough */}
                {!startLiveValidation.valid && (
                  <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none">
                    {startLiveValidation.msg}
                    <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizableLayout
          initialWidths={[20, 45, 35]}
          left={
            <div className="h-full flex flex-col overflow-hidden bg-white border-r border-gray-200">

              {/* Basic Info / Student Stream */}
              {isLiveMode ? (
                <div className="h-full overflow-y-auto custom-scrollbar p-4">
                  <StudentTimeStream
                    mutedUsers={mutedUsersMap}
                    onMuteUser={handleMuteUser}
                  />
                </div>
              ) : (
                <>
                  {/* Unified Session List Container */}
                  <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-white">
                      <h3 className="text-sm font-bold text-gray-800">所有场次 ({combinedSessions.length})</h3>
                      <button
                        onClick={handleOpenAddSession}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center gap-1 text-xs font-bold"
                      >
                        <Plus size={14} /> 新增场次
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col p-3">
                      <UnifiedSessionList
                        items={combinedSessions}
                        liveType={stream.type}
                        selectedSessionId={selectedSessionId}
                        selectedHistoryId={selectedHistoryId}
                        onSelectSession={(id) => {
                          setSelectedSessionId(id);
                          setSelectedHistoryId(null);
                        }}
                        onSelectHistory={(id) => {
                          setSelectedHistoryId(id);
                          setSelectedSessionId(null);
                        }}
                        onDeleteSession={confirmDeleteSession}
                        onEditSession={handleOpenEditSession}
                        onTogglePlayback={handleTogglePlayback}
                        onConfigurePlayback={handleConfigurePlayback}
                      />
                    </div>
                  </div>
                </>

              )}

            </div>
          }
          middle={
            <div className="h-full flex flex-col gap-6 overflow-hidden py-6 px-3">
              {/* Data Dashboard View when History item is selected */}
              {selectedHistoryId && !isLiveMode ? (
                <div className="flex-1 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm mb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <BarChart2 size={16} className="text-blue-600" />
                        数据看板 - {historyList.find(h => h.id === selectedHistoryId)?.name || '历史场次'}
                      </h3>
                      <div className="flex flex-col gap-1.5 mt-3 text-[11px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          <span>
                            计划开播：{new Date(historyList.find(h => h.id === selectedHistoryId)?.startTime || Date.now()).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Play size={12} className="text-gray-400" />
                          <span>
                            实际开播：{new Date(historyList.find(h => h.id === selectedHistoryId)?.startTime || Date.now()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {historyList.find(h => h.id === selectedHistoryId)?.endTime ? new Date(historyList.find(h => h.id === selectedHistoryId)!.endTime!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '未结束'}
                            <span className="ml-1 text-gray-400">
                              (时长: {
                                (() => {
                                  const h = historyList.find(h => h.id === selectedHistoryId);
                                  if (!h || !h.endTime) return '未知';
                                  const start = new Date(h.startTime).getTime();
                                  const end = new Date(h.endTime).getTime();
                                  const diffMins = Math.round((end - start) / 60000);
                                  return `${diffMins}分钟`;
                                })()
                              })
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadHistoryData(selectedHistoryId)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Download size={14} />
                      下载本场数据
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <StudentTimeStream
                      mutedUsers={mutedUsersMap}
                      onMuteUser={handleMuteUser}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Monitor (Moved Here) */}
                  <div
                    ref={monitorCardRef}
                    className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col shrink-0"
                  >
                    <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Integrated Controls */}
                        <div className="flex items-center gap-2">
                          {/* Audio Control */}
                          <div className={`flex items-center px-2 py-1.5 rounded-lg border text-xs font-bold transition-colors ${isMicMuted ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
                            <button
                              onClick={() => setIsMicMuted(!isMicMuted)}
                              className={`mr-1.5 p-0.5 rounded hover:bg-black/5 transition-colors ${isMicMuted ? 'text-red-500' : 'text-gray-500'}`}
                              title={isMicMuted ? "开启麦克风" : "关闭麦克风"}
                            >
                              {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                            </button>
                            <select
                              className="bg-transparent outline-none appearance-none cursor-pointer min-w-[100px] max-w-[140px] truncate"
                              value={audioSource}
                              onChange={(e) => setAudioSource(e.target.value)}
                              disabled={isMicMuted}
                            >
                              <option value="default">默认麦克风</option>
                              <option value="external">外接麦克风</option>
                              <option value="system">系统内录</option>
                            </select>
                            <ChevronDown size={12} className="text-gray-400 ml-1" />
                          </div>

                          {/* Video Control */}
                          <div className={`flex items-center px-2 py-1.5 rounded-lg border text-xs font-bold transition-colors ${isCameraOff ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
                            <button
                              onClick={() => setIsCameraOff(!isCameraOff)}
                              className={`mr-1.5 p-0.5 rounded hover:bg-black/5 transition-colors ${isCameraOff ? 'text-red-500' : 'text-gray-500'}`}
                              title={isCameraOff ? "开启摄像头" : "关闭摄像头"}
                            >
                              {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
                            </button>
                            <select
                              className="bg-transparent outline-none appearance-none cursor-pointer min-w-[100px] max-w-[140px] truncate"
                              value={videoSource}
                              onChange={(e) => setVideoSource(e.target.value)}
                              disabled={isCameraOff}
                            >
                              <option value="facetime">FaceTime HD</option>
                              <option value="obs">OBS Virtual</option>
                              <option value="capture">采集卡</option>
                            </select>
                            <ChevronDown size={12} className="text-gray-400 ml-1" />
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={handleEnterRoom}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-1.5 rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95"
                          >
                            {isCheckingAuth ? '验证中...' : '进入房间'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={toggleMonitorFullscreen}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                          title={isMonitorFullscreen ? "退出全屏" : "全屏"}
                        >
                          {isMonitorFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-[#0c0c0c] relative flex items-center justify-center group overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {/* Fallback Cover Image (Background) */}
                      <img
                        src={stream.coverUrl}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale z-0"
                        alt="Preview Background"
                      />

                      {/* Real Video Element */}
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        autoPlay
                        playsInline
                        muted
                      />

                      {/* Auth UI Overlay */}
                      {authModalType !== 'NONE' && (
                        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">

                          {/* Login UI */}
                          {authModalType === 'LOGIN' && (
                            <div className="w-full max-w-[280px] flex flex-col items-center">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                <UserCircle size={20} />
                              </div>
                              <h3 className="text-base font-black text-gray-900">登录账号</h3>
                              <p className="text-[10px] text-gray-500 mt-1 mb-4 text-center">请输入学号以验证观看权限</p>

                              <input
                                type="text"
                                value={authStudentId}
                                onChange={(e) => setAuthStudentId(e.target.value)}
                                placeholder="请输入学号"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-blue-500 focus:bg-white outline-none transition-all mb-3 text-center"
                                autoFocus
                              />
                              <button
                                onClick={handleAuthLogin}
                                disabled={!authStudentId.trim() || isCheckingAuth}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                              >
                                {isCheckingAuth ? '登录中...' : '登录并进入'}
                              </button>
                            </div>
                          )}

                          {/* Conflict UI */}
                          {authModalType === 'CONFLICT' && (
                            <div className="w-full max-w-[320px] flex flex-col items-center">
                              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle size={20} />
                              </div>
                              <h3 className="text-base font-black text-gray-900">课程冲突</h3>

                              <div className="bg-orange-50 rounded-lg p-3 my-3 border border-orange-100 w-full text-center">
                                <div className="text-[10px] text-orange-800 font-bold mb-0.5">检测到冲突课程</div>
                                <div className="text-xs font-black text-gray-900 truncate">
                                  {authConflictInfo?.conflictingClassName} {authConflictInfo?.conflictingLessonName}
                                </div>
                                <div className="text-[10px] text-gray-600 truncate mt-0.5">{authConflictInfo?.conflictingCourseName}</div>
                              </div>

                              <div className="flex flex-col gap-2 w-full">
                                <button
                                  onClick={() => handleAuthRegister(true)}
                                  disabled={isCheckingAuth}
                                  className="w-full py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
                                >
                                  {isCheckingAuth ? '处理中...' : '退订冲突课程并注册直播课程'}
                                </button>
                                <button
                                  onClick={() => setAuthModalType('LOGIN')}
                                  className="w-full py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all"
                                >
                                  换号登录
                                </button>
                              </div>
                            </div>
                          )}

                          {/* No Permission UI */}
                          {authModalType === 'NO_PERMISSION' && (
                            <div className="w-full max-w-[320px] flex flex-col items-center">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                <BookOpen size={20} />
                              </div>
                              <h3 className="text-base font-black text-gray-900">未报名</h3>

                              <div className="bg-blue-50 rounded-lg p-3 my-3 border border-blue-100 w-full text-center">
                                <div className="text-xs font-bold text-blue-800">当前账号无直播关联课程权限</div>
                              </div>

                              <div className="flex flex-col gap-2 w-full">
                                <button
                                  onClick={() => handleAuthRegister(false)}
                                  disabled={isCheckingAuth}
                                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                  {isCheckingAuth ? '报名中...' : '注册课程'}
                                </button>
                                <button
                                  onClick={() => setAuthModalType('LOGIN')}
                                  className="w-full py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all"
                                >
                                  换号登录
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Overlay for Non-Camera Active Items */}
                      {(() => {
                        const activeItem = interactionsList.find(i => i.id === activeMainTrackId);
                        if (activeItem) {
                          return (
                            <div className="absolute inset-0 bg-gray-900 z-20 flex flex-col items-center justify-center text-white p-8 text-center">
                              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                {activeItem.type === InteractionCategory.VIDEO ? <Video size={32} /> :
                                  activeItem.type === InteractionCategory.COURSE_SLICE ? <LayoutList size={32} /> :
                                    activeItem.type === InteractionCategory.GANDI_EMBED ? <Sparkles size={32} /> :
                                      <Link2 size={32} />}
                              </div>
                              <h3 className="text-xl font-bold mb-2">{activeItem.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold uppercase">{activeItem.type}</span>
                                <span className="px-2 py-1 bg-green-500/80 rounded text-xs font-bold uppercase animate-pulse">LIVE</span>
                              </div>
                              <p className="mt-6 text-sm text-gray-400 max-w-[80%]">
                                当前画面正在展示非摄像头内容，预览画面已隐藏
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Error Message Overlay */}
                      {mediaPermissionError && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 z-20">
                          <AlertCircle size={32} className="text-amber-500 mb-2" />
                          <p className="text-xs text-white font-bold mb-1">{mediaPermissionError}</p>
                          <p className="text-[10px] text-gray-400">请检查浏览器权限设置或设备连接</p>
                        </div>
                      )}

                      {/* Audio Visualizer Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-gray-900/40 backdrop-blur rounded-full overflow-hidden flex items-center z-30 pointer-events-none">
                        <Mic size={10} className="text-white/80 mr-2 flex-shrink-0 ml-1" />
                        <div className="flex-1 h-full bg-gray-700/50 rounded-full relative overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
                            style={{ width: `${Math.min(100, audioLevel * 150)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Cut-In Controls Footer */}
                    <div className="p-3 flex gap-3 bg-white border-t border-gray-50">
                      <button
                        onClick={() => toggleCutInMode('FULLSCREEN')}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${cutInMode === 'FULLSCREEN'
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
                            <Maximize2 size={16} />
                            全屏切入
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleCutInMode('PIP')}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${cutInMode === 'PIP'
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
                            <PictureInPicture2 size={16} />
                            画中画切入
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Content: Always show Controls, but maybe reset key to force re-render on session switch */}
                  <div className={`${isObsCollapsed ? 'h-auto shrink-0' : 'flex-1 overflow-hidden'} flex flex-col bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-300`}>
                    {(selectedSessionId || isLiveMode) ? (
                      <>
                        {/* Removed LiveControlPanel, controls moved to header */}
                        <ObsControlPanel
                          key={`obs-${selectedSessionId || 'live'}`}
                          isCollapsed={isObsCollapsed}
                          onToggleCollapse={() => setIsObsCollapsed(!isObsCollapsed)}
                          mutedUsers={mutedUsersList}
                          onUnmuteUser={handleUnmuteUser}
                        />
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Settings2 size={48} className="mb-4 text-gray-200" />
                        <p className="text-sm font-bold">暂无直播场次</p>
                        <p className="text-xs mt-1">请在左侧新增场次</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          }
          right={
            <div className="h-full flex flex-col gap-6 overflow-hidden py-6 pr-6 pl-3">
              {(selectedSessionId || selectedHistoryId || isLiveMode) ? (
                <>
                  {interactions.linkMic ? (
                    <LinkMicPanel onClose={() => toggleInteraction('linkMic')} />
                  ) : (
                    /* Fixed Functions */
                    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-2 flex items-center gap-2 flex-wrap">
                      {/* Danmaku Group */}
                      <div className={`flex items-center gap-1 p-1 rounded-lg border transition-all duration-300 shrink-0 ${interactions.danmaku ? 'bg-blue-50 border-blue-100 pr-2' : 'bg-gray-50 border-gray-100'}`}>
                        <InteractionToggle active={interactions.danmaku} onClick={() => toggleInteraction('danmaku')} icon={<MessageSquare size={16} />} label="弹幕" />

                        {interactions.danmaku && (
                          <div className="flex items-center gap-2 ml-1 border-l border-blue-200 pl-2 animate-in fade-in slide-in-from-left-2">
                            <label className="flex items-center gap-1 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="accent-blue-600 rounded-sm w-3 h-3 cursor-pointer"
                                checked={interactions.weakenBackgroundAudio}
                                onChange={() => toggleInteraction('weakenBackgroundAudio')}
                              />
                              <span className="text-[10px] font-bold text-blue-600/80 group-hover:text-blue-700 whitespace-nowrap">弱化背景音</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="accent-blue-600 rounded-sm w-3 h-3 cursor-pointer"
                                checked={interactions.confirmDanmaku}
                                onChange={() => toggleInteraction('confirmDanmaku')}
                              />
                              <span className="text-[10px] font-bold text-blue-600/80 group-hover:text-blue-700 whitespace-nowrap">发送前确认</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-gray-100 mx-1 shrink-0"></div>

                      <InteractionToggle active={interactions.im} onClick={() => toggleInteraction('im')} icon={<Link2 size={16} />} label="IM" />
                      <InteractionToggle active={interactions.team} onClick={() => toggleInteraction('team')} icon={<Users size={16} />} label="战队面板" />
                      <InteractionToggle active={interactions.linkMic} onClick={() => toggleInteraction('linkMic')} icon={<Mic size={16} />} label="连麦" />
                    </div>
                  )}

                  {/* Overlay Track - Moved Here */}
                  {/* Unified Interaction List */}
                  <div className="flex-1 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 sticky top-0 z-20 backdrop-blur-sm">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                        <List size={16} className="text-blue-600" />
                        交互列表 {selectedHistoryId && '(历史回溯)'}
                        {currentTemplateName && (
                          <span className="text-gray-400 text-xs ml-1 font-normal flex items-center gap-1">
                            - {currentTemplateName}
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => setIsTemplateModalOpen(true)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="读取模板"
                        >
                          <FolderOpen size={14} />
                        </button>

                        {currentTemplateId && (
                          <button
                            onClick={handleSaveTemplate}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="保存模板"
                          >
                            <Save size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => setIsSaveAsModalOpen(true)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="另存为模板"
                        >
                          <Copy size={14} />
                        </button>

                        <div className="w-px h-3 bg-gray-200 mx-1"></div>

                        <button
                          onClick={() => handleAddInteraction()}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-200"
                          title="添加交互"
                        >
                          <Plus size={14} />
                          <span className="text-xs font-bold">添加交互</span>
                        </button>

                        <div className="w-px h-3 bg-gray-200 mx-1"></div>

                        <button
                          onClick={handleClearInteractions}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="清空"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                      {Object.values(InteractionCategory).map(cat => {
                        const catItems = interactionsList.filter(i => i.type === cat);
                        if (catItems.length === 0) return null;
                        return (
                          <InteractionCategoryGroup key={cat} label={cat} count={catItems.length}>
                            {catItems.map(item => {
                              const state = getInteractionState(item.id);

                              if (item.type === InteractionCategory.QUIZ) {
                                return (
                                  <QuizCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    mockOptions={item.config?.options?.map((opt: any, idx: number) => ({
                                      ...opt,
                                      isCorrect: (idx + 1).toString() === item.config?.correctAnswer
                                    }))}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status}
                                    votes={state.votes}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onVotesUpdate={(v) => updateInteractionState(item.id, { votes: v })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.VOTE) {
                                return (
                                  <VoteCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    mockOptions={item.config?.options}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as VoteStatus}
                                    votes={state.votes}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onVotesUpdate={(v) => updateInteractionState(item.id, { votes: v })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.DEBATE) {
                                const votes = (state.votes as { pro: number; con: number }) || { pro: 0, con: 0 };
                                return (
                                  <DebateCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    proView={item.config?.pro?.view}
                                    conView={item.config?.con?.view}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as DebateStatus}
                                    votes={votes}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onVotesUpdate={(v) => updateInteractionState(item.id, { votes: v })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.ONE_STAND) {
                                return (
                                  <EliminationCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    questions={item.config?.questions}
                                    mode={item.config?.mode}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as EliminationStatus}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.GANDI_EMBED) {
                                return (
                                  <GandiCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    projectId={item.config?.projectId}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as GandiStatus}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.LINK) {
                                return (
                                  <LinkCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    url={item.config?.url}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as LinkStatus}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.MODEL) {
                                return (
                                  <ModelCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    coverUrl={item.config?.coverUrl}
                                    views={item.config?.views}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as ModelStatus}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.AI_SWITCH) {
                                return (
                                  <AISwitchCard
                                    key={item.id}
                                    id={item.id}
                                    status={state.status as AISwitchStatus}
                                    config={item.config}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onConfigChange={(c) => handleUpdateInteraction(item.id, { config: c })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              if (item.type === InteractionCategory.COURSE_SLICE) {
                                return (
                                  <SliceListCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    className={item.config?.className}
                                    lessonName={item.config?.lessonName}
                                    slices={item.config?.slices}
                                    onDelete={() => handleDeleteInteraction(item.id)}
                                    status={state.status as SliceListStatus}
                                    isExpanded={state.isExpanded}
                                    onStatusChange={(s) => updateInteractionState(item.id, { status: s })}
                                    onExpandChange={(e) => updateInteractionState(item.id, { isExpanded: e })}
                                    isReadOnly={!!selectedHistoryId}
                                  />
                                );
                              }

                              return (
                                <InteractionItemView
                                  key={item.id}
                                  title={item.title}
                                  type={item.type}
                                  time={item.time}
                                  onDelete={() => handleDeleteInteraction(item.id)}
                                  isReadOnly={!!selectedHistoryId}
                                />
                              );
                            })}
                          </InteractionCategoryGroup>
                        );
                      })}
                      {interactionsList.length === 0 && (
                        <div className="py-20 text-center text-gray-400 italic text-sm">暂无交互配置，点击右上角按钮添加</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                  <List size={48} className="mb-4 text-gray-200" />
                  <p className="text-sm font-bold">暂无交互列表</p>
                  <p className="text-xs mt-1">请先选择一个直播场次</p>
                </div>
              )}
            </div>
          }
        />
      </div >
      {/* Modals ... */}

      <LiveSessionModal
        isOpen={sessionModalConfig.isOpen}
        onClose={() => setSessionModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveSessionModal}
        initialData={sessionModalConfig.data}
        liveType={stream.type}
        isEditing={sessionModalConfig.isEditing}
      />


      <PlaybackConfigModal
        isOpen={playbackModalConfig.isOpen}
        onClose={() => setPlaybackModalConfig({ ...playbackModalConfig, isOpen: false })}
        liveType={stream.type}
        onConfirm={handlePlaybackConfirm}
      />

      < CreateLiveModal
        isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        onCreate={handleUpdateStream} editStream={stream}
      />

      <ResourceSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        resources={[...resources]}
        onSelect={handleResourceSelected}
        allowedCategories={selectionModalCategoryFilter}
      />

      <SaveTemplateModal
        isOpen={isSaveAsModalOpen}
        onClose={() => setIsSaveAsModalOpen(false)}
        onSave={handleSaveAsTemplate}
        existingLabels={allLabels}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        content={confirmConfig.content}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Live Test Modal */}
      {
        isTestLiveModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <TestTube2 size={20} className="text-orange-500" />
                  直播测试
                </h3>
                <button onClick={() => setIsTestLiveModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg flex items-start gap-2">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>测试模式下，仅指定的测试账号可见直播内容。开始测试后，请使用测试账号登录学习端，从【通知】中进入直播间。</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">测试账号 (学号)</label>
                  <textarea
                    className="w-full h-32 p-3 text-sm bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none resize-none transition-all placeholder:text-gray-300 font-mono"
                    placeholder="请输入学号，多个学号请用英文逗号分隔&#10;例如: 2024001,2024002"
                    value={testStudentIds}
                    onChange={(e) => setTestStudentIds(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-6 pt-2 flex gap-3">
                <button
                  onClick={() => setIsTestLiveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleStartTestLive}
                  // disabled={!testStudentIds.trim()} // 学号非必填
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
                >
                  开始直播测试
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        isTemplateModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" onClick={() => setIsTemplateModalOpen(false)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">选择交互模板</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Select Template to Load</p>
                </div>
                <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
              </div>

              <div className="px-8 py-4 bg-white border-b border-gray-100 flex gap-4 sticky top-0 z-10 items-center">
                <input
                  placeholder="搜索模板名称..."
                  value={templateFilterName}
                  onChange={e => setTemplateFilterName(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none focus:bg-white transition-all"
                />

                {/* Tag Dropdown */}
                <div className="relative w-1/4">
                  <button
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-left flex items-center justify-between hover:bg-white hover:border-blue-400 transition-all ${isTagDropdownOpen ? 'ring-2 ring-blue-100 border-blue-400' : ''}`}
                  >
                    <span className={`truncate ${templateFilterTags.length ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                      {templateFilterTags.length > 0 ? `已选 ${templateFilterTags.length} 个标签` : '筛选标签...'}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {isTagDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsTagDropdownOpen(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 max-h-60 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {allLabels.map(label => (
                            <button
                              key={label}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplateFilterTags(prev =>
                                  prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${templateFilterTags.includes(label)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-300'
                                }`}
                            >
                              {label}
                            </button>
                          ))}
                          {allLabels.length === 0 && <span className="text-gray-400 text-xs p-2">无可用标签</span>}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <input
                  placeholder="筛选创建人..."
                  value={templateFilterCreator}
                  onChange={e => setTemplateFilterCreator(e.target.value)}
                  className="w-1/4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none focus:bg-white transition-all"
                />

                {/* Clear Button */}
                {(templateFilterName || templateFilterTags.length > 0 || templateFilterCreator) && (
                  <button
                    onClick={() => {
                      setTemplateFilterName('');
                      setTemplateFilterTags([]);
                      setTemplateFilterCreator('');
                    }}
                    className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all whitespace-nowrap"
                  >
                    清除筛选
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                {filteredTemplates.map(tpl => (
                  <div
                    key={tpl.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadTemplate(tpl.id);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileStack size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tpl.name}</h3>
                    </div>
                    <div className="space-y-2 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold">包含交互:</span> {tpl.interactionCount} 个
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold">创建人:</span> {tpl.creator || '未知'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tpl.labels.map(l => <span key={l} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{l}</span>)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadTemplate(tpl.id);
                      }}
                      className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      确认使用
                    </button>
                  </div>
                ))}
                {filteredTemplates.length === 0 && <div className="col-span-full text-center text-gray-400 py-10">暂无匹配模板</div>}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default LiveSetupView;



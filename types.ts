export enum LiveStatus {
  LIVE = 'LIVE',
  NOT_STARTED = 'NOT_STARTED'
}

export enum LiveType {
  COURSE = 'COURSE',
  ORDINARY = 'ORDINARY'
}

export enum InteractionCategory {
  DEBATE = '辩论',
  QUIZ = '答题',
  DISCUSSION = '主题讨论',
  VOTE = '投票',
  MODEL = '模型',
  GANDI_EMBED = 'Gandi 内嵌',
  LINK = '外链',
  ONE_STAND = '一站到底',
  COURSE_SLICE = '切片课资源',
  VIDEO = '视频',
  AI_SWITCH = 'AI 开关'
}

export type TrackType = 'MAIN' | 'OVERLAY';

export type TriggerMode = 'MANUAL' | 'AUTO_TIME' | 'AUTO_END';

export interface InteractionItem {
  id: string;
  title: string;
  type: InteractionCategory;
  time: string;
  label?: string;
  resourceId?: string;
  config?: any;

  // New Dual-Track Fields
  track: TrackType;
  triggerMode: TriggerMode;
  duration?: number;
  parentId?: string;
  autoClose?: boolean;
}

export interface ObsConfig {
  activeSceneName: string;
  programSceneName: string;
  connectionConfig: {
    ip: string;
    port: string;
    password?: string;
  };
}

export interface MediaConfig {
  audioSource: string;
  videoSource: string;
  isMicMuted: boolean;
  isCameraOff: boolean;
  cutInMode: 'NONE' | 'FULLSCREEN' | 'PIP';
}

export interface LiveSession {
  id: string;
  name: string;
  hostName: string;
  coverUrl?: string;
  startTime: string; // ISO string

  // Extended fields for consolidated configuration
  linkedLessonId?: string; // For Course Live
  linkedLessonName?: string; // For Course Live (Display)
  visibleAudience?: string[]; // For Normal Live (List of strings for simplicity or IDs)
  audienceMode?: 'CLASS' | 'COURSE' | 'USER_TYPE' | 'ID'; // Store the mode

  // Late Configuration
  latePolicy?: 'unlimited' | 'block' | 'record';
  lateTime?: number;
  lateBlockMessage?: string;

  // Per-session configuration
  configuredInteractions?: InteractionItem[];
  mediaConfig?: MediaConfig;
  obsConfig?: ObsConfig;
}

export type PlaybackMethod = 'RECORDED_LESSON' | 'UPLOAD_JSON';

export interface LiveHistoryItem extends LiveSession {
  endTime?: string;
  participantCount?: number;
  visibleAudience?: string[]; // For Normal Live (Type fixed to match LiveSession)
  className?: string; // For Course Live
  lessonName?: string; // For Course Live
  linkedLessonId?: string; // For Course Live
  hasPlayback: boolean;
  playbackMethod?: PlaybackMethod;
  playbackConfig?: any;
}

export interface LiveStream {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  type: LiveType;
  teacher: string;
  status: LiveStatus;
  startTime?: string;
  sessions?: LiveSession[];
  // configuredInteractions is now moved to LiveSession, but keeping here for legacy support if needed or as default
  configuredInteractions?: InteractionItem[];
}

export interface FilterParams {
  name: string;
  id: string;
  type: string;
}

export interface InteractiveResource {
  id: string;
  name: string;
  category: InteractionCategory;
  templateName: string;
  creator: string;
  modifiedAt: string;
  labels: string[];
  config?: any;
}

export interface InteractionTemplate {
  id: string;
  name: string;
  labels: string[];
  interactionCount: number;
  creator: string;
  modifiedAt: string;
  items?: InteractionItem[];
}

/**
 * PRD 模式：元素说明（按“页面作用域 + 元素 selector”存储）
 * key 建议为 `${scopeKey}::${selector}`，便于快速定位与去重。
 */
export interface PrdNote {
  key: string;
  scopeKey: string;
  selector: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

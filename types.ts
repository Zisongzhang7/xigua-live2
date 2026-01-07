
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
  CAMERA = '直播流'
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

export interface LiveSession {
  id: string;
  name: string;
  hostName: string;
  coverUrl?: string;
  startTime: string; // ISO string
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
  configuredInteractions?: InteractionItem[];
}

export interface FilterParams {
  name: string;
  id: string;
  teacher: string;
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

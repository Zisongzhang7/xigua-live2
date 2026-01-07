
import Dexie, { Table } from 'dexie';
import { LiveStream, InteractiveResource, InteractionTemplate, InteractionCategory, LiveStatus, LiveType } from '../types';

// --- 1. 丰富的交互资源数据 ---
const INITIAL_RESOURCES: InteractiveResource[] = [
  // QUIZ (答题)
  {
    id: 'IR-Q01', name: '几何基础有奖问答', category: InteractionCategory.QUIZ, templateName: '默认答题模板', labels: ['数学', '有奖', '基础'], creator: '张老师', modifiedAt: '2024-05-18 10:20',
    config: { topic: '三角形内角和是多少度？', isSingle: true, options: [{ id: 'A', name: '180度' }, { id: 'B', name: '360度' }, { id: 'C', name: '90度' }], correctAnswer: '1', rewardScore: 10 }
  },
  {
    id: 'IR-Q02', name: '初一英语单词竞速', category: InteractionCategory.QUIZ, templateName: '快速抢答模板', labels: ['英语', '竞赛', '初一'], creator: '李老师', modifiedAt: '2024-05-19 09:15',
    config: { topic: 'Apple的意思是？', isSingle: true, options: [{ id: 'A', name: '苹果' }, { id: 'B', name: '香蕉' }, { id: 'C', name: '橘子' }], correctAnswer: '1', rewardScore: 5 }
  },
  {
    id: 'IR-Q03', name: '古诗词填空-静夜思', category: InteractionCategory.QUIZ, templateName: '国学模板', labels: ['语文', '古诗'], creator: '王老师', modifiedAt: '2024-05-21 16:30',
    config: { topic: '床前明月光，疑是地上__？', isSingle: true, options: [{ id: 'A', name: '霜' }, { id: 'B', name: '糖' }, { id: 'C', name: '脏' }], correctAnswer: '1', rewardScore: 8 }
  },

  // DEBATE (辩论)
  {
    id: 'IR-D01', name: 'AI对人类是福是祸', category: InteractionCategory.DEBATE, templateName: '标准辩论', labels: ['科技', '思辨', '热门'], creator: '赵老师', modifiedAt: '2024-05-20 14:00',
    config: { title: '人工智能发展利大于弊', pro: { view: '利大于弊，提高效率' }, con: { view: '弊大于利，由于失业' } }
  },

  // VOTE (投票)
  {
    id: 'IR-V01', name: '最喜欢的暑期活动', category: InteractionCategory.VOTE, templateName: '多选投票', labels: ['活动', '调研'], creator: '行政处', modifiedAt: '2024-05-22 11:00',
    config: { name: '今年暑假大家想去哪里研学？', isSingle: false, options: [{ id: '1', name: '北京故宫' }, { id: '2', name: '上海科技馆' }, { id: '3', name: '西安兵马俑' }, { id: '4', name: '海南海边' }], rewardScore: 2 }
  },
  {
    id: 'IR-V02', name: '班长选举投票', category: InteractionCategory.VOTE, templateName: '匿名投票', labels: ['班务', '重要'], creator: '张老师', modifiedAt: '2024-05-23 09:00',
    config: { name: '请投出你心目中的班长', isSingle: true, options: [{ id: '1', name: '小明 - 乐于助人' }, { id: '2', name: '小红 - 学习委员' }, { id: '3', name: '小刚 - 体育健将' }], rewardScore: 0 }
  },

  // DISCUSSION (讨论)
  {
    id: 'IR-DS01', name: '如何看待手机进校园', category: InteractionCategory.DISCUSSION, templateName: '开放讨论', labels: ['素质教育', '讨论'], creator: '德育处', modifiedAt: '2024-05-24 15:20',
    config: { topic: '手机该不该进校园？', desc: '请大家畅所欲言，并在讨论区发表你的看法，每人限时发言60秒。', totalTime: 600 }
  },

  // MODEL (3D模型)
  {
    id: 'IR-M01', name: '人体心脏结构3D展示', category: InteractionCategory.MODEL, templateName: '生物教具', labels: ['生物', '3D', '科普'], creator: '刘老师', modifiedAt: '2024-05-25 10:00',
    config: { name: '心脏解剖模型', url: 'https://models.example.com/heart.glb' }
  },

  // LINK (外链)
  {
    id: 'IR-L01', name: '期中考试复习资料', category: InteractionCategory.LINK, templateName: '课件分发', labels: ['资料', '复习'], creator: '教务处', modifiedAt: '2024-05-26 08:30',
    config: { name: '点击下载复习PDF', url: 'https://drive.google.com/file/d/xxxxx' }
  },

  // ONE_STAND (一站到底)
  {
    id: 'IR-OS01', name: '历史知识一站到底', category: InteractionCategory.ONE_STAND, templateName: '淘汰赛', labels: ['历史', '竞赛', '刺激'], creator: '陈老师', modifiedAt: '2024-05-27 19:00',
    config: { topic: '历史知识大闯关', mode: '错误淘汰', maxErrors: 1, questions: [{ id: 'q1', topic: '秦始皇哪一年统一六国？', options: [{ name: '公元前221年' }, { name: '公元221年' }] }] }
  }
];

// --- 2. 多样化的模板数据 ---
const INITIAL_TEMPLATES: InteractionTemplate[] = [
  {
    id: 'IT-001', name: '初中数学开学第一课', labels: ['数学', '开学'], interactionCount: 2, creator: '张老师', modifiedAt: '2024-05-20 14:00',
    items: [
      { id: 'item-1', resourceId: 'IR-Q01', title: '几何基础有奖问答', type: InteractionCategory.QUIZ, time: '00:10', label: '课前热身', config: INITIAL_RESOURCES[0].config },
      { id: 'item-2', resourceId: 'IR-DS01', title: '数学在生活中的应用', type: InteractionCategory.DISCUSSION, time: '00:25', label: '发散思维', config: INITIAL_RESOURCES[6].config }
    ]
  },
  {
    id: 'IT-002', name: '英语单词特训营', labels: ['英语', '单词', '高频'], interactionCount: 3, creator: '李老师', modifiedAt: '2024-05-22 09:30',
    items: [
      { id: 'item-e1', resourceId: 'IR-Q02', title: '单词竞速 Round 1', type: InteractionCategory.QUIZ, time: '00:05', label: '热身', config: INITIAL_RESOURCES[1].config },
      { id: 'item-e2', resourceId: 'IR-Q02', title: '单词竞速 Round 2', type: InteractionCategory.QUIZ, time: '00:15', label: '进阶', config: INITIAL_RESOURCES[1].config },
      { id: 'item-e3', resourceId: 'IR-OS01', title: '单词一站到底', type: InteractionCategory.ONE_STAND, time: '00:30', label: '决赛', config: INITIAL_RESOURCES[9].config }
    ]
  },
  {
    id: 'IT-003', name: '期末家长会流程', labels: ['班务', '家长会'], interactionCount: 2, creator: '班主任', modifiedAt: '2024-05-28 18:00',
    items: [
      { id: 'item-p1', resourceId: 'IR-V02', title: '班委满意度投票', type: InteractionCategory.VOTE, time: '00:20', label: '匿名投票', config: INITIAL_RESOURCES[5].config },
      { id: 'item-p2', resourceId: 'IR-L01', title: '成绩单下载', type: InteractionCategory.LINK, time: '00:45', label: '资料分发', config: INITIAL_RESOURCES[8].config }
    ]
  }
];

// --- 3. 各种状态的直播间 ---
const INITIAL_STREAMS: LiveStream[] = [
  {
    id: 'LS-9001',
    name: '初中数学特训营 - 几何入门',
    description: '深入浅出讲解欧几里得几何基础，带你领略图形之美。',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    type: LiveType.COURSE,
    teacher: '张老师',
    status: LiveStatus.LIVE,
    startTime: '2024-05-20 14:00',
    configuredInteractions: []
  },
  {
    id: 'LS-9002',
    name: '高一物理 - 力学分析',
    description: '牛顿三定律的实际应用，受力分析专项突破。',
    coverUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop',
    type: LiveType.COURSE,
    teacher: '王教授',
    status: LiveStatus.NOT_STARTED,
    startTime: '2024-06-01 09:00',
    configuredInteractions: []
  },
  {
    id: 'LS-8001',
    name: '2024春季学期期末表彰大会',
    description: '全校师生及家长参与，表彰优秀学生及进步之星。',
    coverUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600&auto=format&fit=crop',
    type: LiveType.ORDINARY,
    teacher: '校长室',
    status: LiveStatus.NOT_STARTED,
    startTime: '2024-06-15 14:00',
    configuredInteractions: []
  },
  {
    id: 'LS-8002',
    name: '校园十佳歌手总决赛',
    description: '燃爆夏日，见证校园最强音的诞生！',
    coverUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=600&auto=format&fit=crop',
    type: LiveType.ORDINARY,
    teacher: '学生会',
    status: LiveStatus.LIVE,
    startTime: '2024-05-29 19:00',
    configuredInteractions: []
  },
  {
    id: 'LS-9003',
    name: '少儿编程 Scratch 入门',
    description: '零基础学习编程逻辑，制作第一个小游戏。',
    coverUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=600&auto=format&fit=crop',
    type: LiveType.COURSE,
    teacher: 'TechKid',
    status: LiveStatus.NOT_STARTED,
    startTime: '2024-06-05 10:00',
    configuredInteractions: []
  }
];

export class AppDatabase extends Dexie {
  streams!: Table<LiveStream>;
  resources!: Table<InteractiveResource>;
  templates!: Table<InteractionTemplate>;

  constructor() {
    super('LiveAppDB');
    this.version(1).stores({
      streams: 'id',
      resources: 'id, category', // Index by category if needed
      templates: 'id'
    });
  }
}

export const db = new AppDatabase();

// Initialize mock data if empty
db.on('populate', () => {
  db.resources.bulkAdd(INITIAL_RESOURCES);
  db.templates.bulkAdd(INITIAL_TEMPLATES);
  db.streams.bulkAdd(INITIAL_STREAMS);
});

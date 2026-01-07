
import React, { useState } from 'react';
import Sidebar, { ViewType } from './components/Sidebar';
import Header from './components/Header';
import LiveStreamList from './components/LiveStreamList';
import LiveSetupView from './components/LiveSetupView';
import InteractiveResourceList from './components/InteractiveResourceList';
import InteractionTemplateList from './components/InteractionTemplateList';
import CreateInteractiveResourceView from './components/CreateInteractiveResourceView';
import EditInteractionTemplateView from './components/EditInteractionTemplateView';
import { LiveStream, InteractiveResource, InteractionCategory, InteractionTemplate } from './types';

// 统一标签数据源
export const COMMON_LABELS = ['数学', '语文', '英语', '理综', '文综', '素质教育', '有奖', '竞赛', '调研', '活动'];

const INITIAL_RESOURCES: InteractiveResource[] = [
  // --- 1. QUIZ (答题) ---
  { id: 'IR-Q01', name: '几何基础有奖问答', category: InteractionCategory.QUIZ, templateName: '默认答题模板', labels: ['数学', '有奖'], creator: '张老师', modifiedAt: '2024-05-18 10:20', config: { topic: '几何基础', options: [{ id: '1', name: '三角形' }, { id: '2', name: '正方形' }], correctAnswer: '1' } },
  { id: 'IR-Q02', name: '初一英语单词竞速', category: InteractionCategory.QUIZ, templateName: '快速抢答模板', labels: ['英语', '竞赛'], creator: '李老师', modifiedAt: '2024-05-19 09:15', config: { topic: 'Apple means?', options: [{ id: '1', name: '苹果' }, { id: '2', name: '香蕉' }], correctAnswer: '1' } },
  { id: 'IR-Q03', name: '物理力学知识测试', category: InteractionCategory.QUIZ, templateName: '标准考试模板', labels: ['理综', '竞赛'], creator: '王老师', modifiedAt: '2024-05-20 11:30', config: { topic: '重力加速度是?', options: [{ id: '1', name: '9.8' }, { id: '2', name: '10' }], correctAnswer: '1' } },

  // --- 2. DEBATE (辩论) ---
  { id: 'IR-D01', name: 'AI是否会取代人类', category: InteractionCategory.DEBATE, templateName: '标准辩论模板', labels: ['素质教育', 'AI'], creator: '陈老师', modifiedAt: '2024-06-01 14:00', config: { title: 'AI趋势', pro: { view: '会取代' }, con: { view: '不会取代' } } },
  { id: 'IR-D02', name: '中学生是否应该带手机', category: InteractionCategory.DEBATE, templateName: '校园辩论模板', labels: ['德育', '辩论'], creator: '赵老师', modifiedAt: '2024-06-02 09:30', config: { title: '手机管理', pro: { view: '应该' }, con: { view: '不应该' } } },
  { id: 'IR-D03', name: '寒暑假是否应该补课', category: InteractionCategory.DEBATE, templateName: '家校辩论模板', labels: ['教育', '热点'], creator: '孙老师', modifiedAt: '2024-06-03 16:15', config: { title: '补课问题', pro: { view: '应该补' }, con: { view: '不该补' } } },

  // --- 3. DISCUSSION (主题讨论) ---
  { id: 'IR-DIS01', name: '如何培养良好的学习习惯', category: InteractionCategory.DISCUSSION, templateName: '经验分享模板', labels: ['班会', '习惯'], creator: '周老师', modifiedAt: '2024-06-05 10:00', config: { topic: '学习习惯', desc: '分享你的好习惯' } },
  { id: 'IR-DIS02', name: '我的暑假计划', category: InteractionCategory.DISCUSSION, templateName: '自由讨论模板', labels: ['假期', '规划'], creator: '吴老师', modifiedAt: '2024-06-06 15:20', config: { topic: '暑假去哪玩', desc: '畅所欲言' } },
  { id: 'IR-DIS03', name: '对未来职业的畅想', category: InteractionCategory.DISCUSSION, templateName: '职业规划模板', labels: ['生涯', '未来'], creator: '郑老师', modifiedAt: '2024-06-07 11:00', config: { topic: '我想做什么', desc: '科学家？宇航员？' } },

  // --- 4. VOTE (投票) ---
  { id: 'IR-V01', name: '最喜欢的课外活动', category: InteractionCategory.VOTE, templateName: '活动评选模板', labels: ['活动', '调研'], creator: '王老师', modifiedAt: '2024-06-10 13:45', config: { name: '课外活动', options: [{ id: '1', name: '篮球' }, { id: '2', name: '足球' }] } },
  { id: 'IR-V02', name: '校运动会班服选色', category: InteractionCategory.VOTE, templateName: '班级事务模板', labels: ['班级', '决策'], creator: '李老师', modifiedAt: '2024-06-11 08:30', config: { name: '班服颜色', options: [{ id: '1', name: '红色' }, { id: '2', name: '蓝色' }] } },
  { id: 'IR-V03', name: '下周班会主题评选', category: InteractionCategory.VOTE, templateName: '民主评议模板', labels: ['班会', '投票'], creator: '张老师', modifiedAt: '2024-06-12 17:00', config: { name: '班会主题', options: [{ id: '1', name: '环保' }, { id: '2', name: '安全' }] } },

  // --- 5. MODEL (模型) ---
  { id: 'IR-M01', name: '人体心脏结构3D模型', category: InteractionCategory.MODEL, templateName: '生物模型模板', labels: ['生物', '3D'], creator: '刘老师', modifiedAt: '2024-06-15 09:00', config: { name: '心脏模型', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', views: [] } },
  { id: 'IR-M02', name: '太阳系行星运行演示', category: InteractionCategory.MODEL, templateName: '天文模型模板', labels: ['地理', '3D'], creator: '赵老师', modifiedAt: '2024-06-16 14:30', config: { name: '太阳系', url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', views: [] } },
  { id: 'IR-M03', name: '分子结构展示', category: InteractionCategory.MODEL, templateName: '化学模型模板', labels: ['化学', '微观'], creator: '孙老师', modifiedAt: '2024-06-17 10:15', config: { name: '水分子', url: 'https://modelviewer.dev/shared-assets/models/Horse.glb', views: [] } },

  // --- 6. GANDI_EMBED (Gandi 内嵌) ---
  { id: 'IR-G01', name: 'Scratch编程小游戏', category: InteractionCategory.GANDI_EMBED, templateName: '编程互动模板', labels: ['编程', '游戏'], creator: '马老师', modifiedAt: '2024-06-20 16:00', config: { name: '接苹果', projectId: 'def456' } },
  { id: 'IR-G02', name: '物理电路仿真实验', category: InteractionCategory.GANDI_EMBED, templateName: '实验模拟模板', labels: ['物理', '实验'], creator: '牛老师', modifiedAt: '2024-06-21 11:20', config: { name: '串联电路', projectId: 'abc123' } },
  { id: 'IR-G03', name: '数学几何画板演示', category: InteractionCategory.GANDI_EMBED, templateName: '数学工具模板', labels: ['数学', '工具'], creator: '杨老师', modifiedAt: '2024-06-22 13:40', config: { name: '勾股定理', projectId: 'ghi789' } },

  // --- 7. LINK (外链) ---
  { id: 'IR-L01', name: '国家地理官网', category: InteractionCategory.LINK, templateName: '网页浏览模板', labels: ['地理', '科普'], creator: '朱老师', modifiedAt: '2024-06-25 09:50', config: { name: '国家地理', url: 'https://www.nationalgeographic.com' } },
  { id: 'IR-L02', name: '在线计算器工具', category: InteractionCategory.LINK, templateName: '实用工具模板', labels: ['数学', '工具'], creator: '秦老师', modifiedAt: '2024-06-26 15:10', config: { name: '计算器', url: 'https://www.desmos.com/scientific' } },
  { id: 'IR-L03', name: '古诗文网资料', category: InteractionCategory.LINK, templateName: '资料查阅模板', labels: ['语文', '资料'], creator: '何老师', modifiedAt: '2024-06-27 10:30', config: { name: '古诗文网', url: 'https://www.gushiwen.cn' } },

  // --- 8. ONE_STAND (一站到底) ---
  { id: 'IR-OS01', name: '历史知识大闯关', category: InteractionCategory.ONE_STAND, templateName: '闯关竞赛模板', labels: ['历史', '竞赛'], creator: '许老师', modifiedAt: '2024-06-30 14:20', config: { topic: '中国通史', questions: [{ id: 'q1', topic: '唐朝建立者?', options: [{ name: '李渊' }, { name: '李世民' }], correct: '0' }] } },
  { id: 'IR-OS02', name: '诗词接龙挑战', category: InteractionCategory.ONE_STAND, templateName: '擂台赛模板', labels: ['语文', '趣味'], creator: '孔老师', modifiedAt: '2024-07-01 09:40', config: { topic: '飞花令', questions: [{ id: 'q1', topic: '小时不识月', options: [{ name: '呼作白玉盘' }, { name: '疑是地上霜' }], correct: '0' }] } },
  { id: 'IR-OS03', name: '科学常识淘汰赛', category: InteractionCategory.ONE_STAND, templateName: '生存挑战模板', labels: ['科学', '常识'], creator: '曹老师', modifiedAt: '2024-07-02 16:50', config: { topic: '生活百科', questions: [{ id: 'q1', topic: '水的沸点?', options: [{ name: '100度' }, { name: '90度' }], correct: '0' }] } },

  // --- 9. COURSE_SLICE (切片课资源) ---
  {
    id: 'IR-CS01', name: '三年级数学：分数的认识', category: InteractionCategory.COURSE_SLICE, templateName: '标准切片模板', labels: ['数学', '三年级'], creator: '魏老师', modifiedAt: '2024-07-05 10:10', config: {
      lessonName: '认识分数', version: 'V1.0', slices: [
        { id: 's1', type: 'VIDEO', title: '概念讲解', duration: '5:00' },
        { id: 's2', type: 'QUIZ', title: '随堂测试', duration: '2:00' },
        { id: 's3', type: 'TEXT', title: '课后作业', duration: '0:00' }
      ]
    }
  },
  {
    id: 'IR-CS02', name: '五年级语文：古诗三首', category: InteractionCategory.COURSE_SLICE, templateName: '语文切片模板', labels: ['语文', '五年级'], creator: '陶老师', modifiedAt: '2024-07-06 14:00', config: {
      lessonName: '古诗鉴赏', version: 'V2.0', slices: [
        { id: 's1', type: 'VIDEO', title: '朗读示范', duration: '3:00' },
        { id: 's2', type: 'OTHER', title: '互动游戏', duration: '4:00' },
        { id: 's3', type: 'TEXT', title: '背诵打卡', duration: '0:00' }
      ]
    }
  },
  {
    id: 'IR-CS03', name: '初二物理：光的折射', category: InteractionCategory.COURSE_SLICE, templateName: '实验切片模板', labels: ['物理', '初二'], creator: '严老师', modifiedAt: '2024-07-07 11:30', config: {
      lessonName: '光的折射', version: 'V1.5', slices: [
        { id: 's1', type: 'VIDEO', title: '实验演示', duration: '6:00' },
        { id: 's2', type: 'QUIZ', title: '现象分析', duration: '3:00' },
        { id: 's3', type: 'VIDEO', title: '原理总结', duration: '2:30' }
      ]
    }
  },

  // --- 10. VIDEO (视频) ---
  { id: 'IR-VID01', name: '开学安全教育宣传片', category: InteractionCategory.VIDEO, templateName: '视频播放模板', labels: ['安全', '教育'], creator: '金老师', modifiedAt: '2024-07-10 09:00', config: { url: 'https://example.com/video1.mp4' } },
  { id: 'IR-VID02', name: '校园风光展示', category: InteractionCategory.VIDEO, templateName: '宣传模板', labels: ['校园', '风光'], creator: '沈老师', modifiedAt: '2024-07-11 15:40', config: { url: 'https://example.com/video2.mp4' } },
  { id: 'IR-VID03', name: '优秀学生代表发言', category: InteractionCategory.VIDEO, templateName: '演讲模板', labels: ['德育', '榜样'], creator: '姜老师', modifiedAt: '2024-07-12 10:20', config: { url: 'https://example.com/video3.mp4' } }
];

const INITIAL_TEMPLATES: InteractionTemplate[] = [
  { id: 'IT-001', name: '初中数学开学第一课', labels: ['数学', '活动'], interactionCount: 5, creator: '张老师', modifiedAt: '2024-05-20 14:00' },
  { id: 'IT-002', name: '英语词汇突击战模板', labels: ['英语', '竞赛'], interactionCount: 3, creator: '李老师', modifiedAt: '2024-05-21 09:30' },
  { id: 'IT-003', name: '理综实验室趣味交互', labels: ['理综', '素质教育'], interactionCount: 8, creator: '王老师', modifiedAt: '2024-05-22 11:45' },
];

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('ROOM_MANAGEMENT');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<InteractiveResource | null>(null);

  // 模板管理相关状态
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentEditingTemplate, setCurrentEditingTemplate] = useState<InteractionTemplate | null>(null);

  const [resources, setResources] = useState<InteractiveResource[]>(INITIAL_RESOURCES);
  const [templates, setTemplates] = useState<InteractionTemplate[]>(INITIAL_TEMPLATES);

  const handleEnterSetup = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const handleBackToList = () => {
    setSelectedStream(null);
  };

  const handleSaveResource = (resource: InteractiveResource) => {
    if (editingResource) {
      setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
    } else {
      setResources(prev => [resource, ...prev]);
    }
    setIsCreatingResource(false);
    setEditingResource(null);
  };

  const handleSaveTemplate = (template: InteractionTemplate) => {
    if (currentEditingTemplate) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates(prev => [template, ...prev]);
    }
    setIsEditingTemplate(false);
    setCurrentEditingTemplate(null);
  };

  const handleEditResource = (resource: InteractiveResource) => {
    setEditingResource(resource);
    setIsCreatingResource(true);
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('确定要删除该交互资源吗？')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('确定要删除该交互模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTemplate = (tpl: InteractionTemplate) => {
    setCurrentEditingTemplate(tpl);
    setIsEditingTemplate(true);
  };

  const handleCreateTemplate = () => {
    setCurrentEditingTemplate(null);
    setIsEditingTemplate(true);
  };

  // 资源编辑视图
  if (isCreatingResource) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <CreateInteractiveResourceView
          initialResource={editingResource || undefined}
          onBack={() => {
            setIsCreatingResource(false);
            setEditingResource(null);
          }}
          onSave={handleSaveResource}
        />
      </div>
    );
  }

  // 模板编辑视图
  if (isEditingTemplate) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <EditInteractionTemplateView
          initialTemplate={currentEditingTemplate || undefined}
          resources={resources}
          onBack={() => {
            setIsEditingTemplate(false);
            setCurrentEditingTemplate(null);
          }}
          onSave={handleSaveTemplate}
        />
      </div>
    );
  }

  // 直播间配置视图
  if (selectedStream) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] overflow-hidden">
        <LiveSetupView stream={selectedStream} resources={resources} onBack={handleBackToList} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'ROOM_MANAGEMENT':
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">直播间管理</h1>
              <p className="text-gray-500 text-sm mt-1">管理并监控您的所有直播间资源</p>
            </header>
            <LiveStreamList onEnterSetup={handleEnterSetup} />
          </>
        );
      case 'INTERACTIVE_RESOURCES':
        return (
          <InteractiveResourceList
            resources={resources}
            onAddResource={() => setIsCreatingResource(true)}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
          />
        );
      case 'INTERACTION_TEMPLATES':
        return (
          <InteractionTemplateList
            templates={templates}
            onAddTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          currentPath={['直播',
            activeView === 'ROOM_MANAGEMENT' ? '直播间管理' :
              activeView === 'INTERACTIVE_RESOURCES' ? '直播交互资源' : '直播交互模板'
          ]}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

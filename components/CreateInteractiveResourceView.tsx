
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Settings2,
  ListOrdered,
  Mic,
  Link,
  Box,
  Layout,
  Tag,
  MessageSquare,
  HelpCircle,
  Trophy,
  Users,
  X,
  FileJson,
  Check,
  Clock,
  PlusCircle,
  GraduationCap
} from 'lucide-react';
import { InteractionCategory, InteractiveResource } from '../types';

interface CreateInteractiveResourceViewProps {
  initialResource?: InteractiveResource;
  onBack: () => void;
  onSave: (resource: InteractiveResource) => void;
}

const CreateInteractiveResourceView: React.FC<CreateInteractiveResourceViewProps> = ({ initialResource, onBack, onSave }) => {
  const [selectedCategory, setSelectedCategory] = useState<InteractionCategory>(initialResource?.category || InteractionCategory.QUIZ);
  const [resourceName, setResourceName] = useState(initialResource?.name || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialResource?.labels || []);
  const [availableLabels, setAvailableLabels] = useState(['数学', '英语', '语文', '有奖', '互动', '基础', '竞赛', 'AI', '3D']);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);

  const isEditMode = !!initialResource;

  // 完整匹配脑图结构的表单状态
  const [formData, setFormData] = useState<any>({
    [InteractionCategory.QUIZ]: {
      topic: '',
      isSingle: true,
      options: [{ id: '1', name: '', desc: '', img: null }],
      correctAnswer: '',
      analysis: '',
      rewardScore: '10',
      deductScore: '5'
    },
    [InteractionCategory.DEBATE]: {
      title: '',
      pro: { view: '', img: null },
      con: { view: '', img: null }
    },
    [InteractionCategory.DISCUSSION]: {
      topic: '',
      desc: '',
      totalTime: '30',
      perPersonTime: '60',
      reward: '5',
      bgImg: null,
      hostVoice: null
    },
    [InteractionCategory.VOTE]: {
      name: '',
      desc: '',
      isSingle: true,
      options: [{ id: '1', name: '', desc: '', img: null }],
      correctOption: '',
      rewardScore: '5',
      wrongReward: '0'
    },
    [InteractionCategory.MODEL]: { name: '', url: '', jsonConfig: null },
    [InteractionCategory.GANDI_EMBED]: { name: '', projectId: '' },
    [InteractionCategory.LINK]: { name: '', url: '' },
    [InteractionCategory.ONE_STAND]: {
      topic: '',
      mode: '错误淘汰',
      maxErrors: '1',
      questions: [
        {
          id: 'q1',
          topic: '',
          analysis: '',
          isSingle: true,
          options: [{ id: 'o1', name: '', desc: '', img: null }],
          correct: '',
          score: '10',
          deduct: '5'
        }
      ]
    },
    [InteractionCategory.COURSE_SLICE]: {
      lessonName: '',
      version: ''
    }
  });

  // 如果是编辑模式，初始化对应的表单数据
  // 注意：此处为了演示，我们只填充了基础信息，如果是真实业务，
  // 应该根据 initialResource 的详情数据填充 formData。
  useEffect(() => {
    if (initialResource) {
      // 如果 initialResource 包含具体的配置，可以在此更新 formData
      // 这里暂时只处理名称和标签
    }
  }, [initialResource]);

  // 表单校验逻辑
  const checkFormValidity = () => {
    if (!resourceName.trim()) return false;
    const data = formData[selectedCategory];

    switch (selectedCategory) {
      case InteractionCategory.QUIZ:
        return !!(data.topic.trim() && data.options.length > 0 && data.options.every((opt: any) => opt.name.trim()) && data.correctAnswer);
      case InteractionCategory.DEBATE:
        return !!(data.title.trim() && data.pro.view.trim() && data.con.view.trim());
      case InteractionCategory.DISCUSSION:
        return !!(data.topic.trim() && data.desc.trim());
      case InteractionCategory.VOTE:
        return !!(data.name.trim() && data.options.length > 0 && data.options.every((opt: any) => opt.name.trim()));
      case InteractionCategory.MODEL:
        return !!(data.name.trim() && data.url.trim());
      case InteractionCategory.GANDI_EMBED:
        return !!(data.name.trim() && data.projectId.trim());
      case InteractionCategory.LINK:
        return !!(data.name.trim() && data.url.trim());
      case InteractionCategory.ONE_STAND:
        return !!(data.topic.trim() && data.questions.length > 0 && data.questions.every((q: any) =>
          q.topic.trim() && q.options.length > 0 && q.options.every((opt: any) => opt.name.trim()) && q.correct
        ));
      case InteractionCategory.COURSE_SLICE:
        return !!(data.lessonName.trim() && data.version.trim());
      default:
        return false;
    }
  };

  const isFormValid = checkFormValidity();

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const handleAddNewLabel = () => {
    if (newLabelInput.trim() && !availableLabels.includes(newLabelInput.trim())) {
      const label = newLabelInput.trim();
      setAvailableLabels(prev => [...prev, label]);
      setSelectedLabels(prev => [...prev, label]);
      setNewLabelInput('');
      setShowLabelInput(false);
    }
  };

  const handleSave = () => {
    if (!isFormValid) return;

    let config = formData[selectedCategory];

    // Mock Slices Data Injection
    if (selectedCategory === InteractionCategory.COURSE_SLICE) {
      config = {
        ...config,
        slices: [
          { id: 's1', type: 'VIDEO', title: '知识点讲解：认识数字', duration: '2:00' },
          { id: 's2', type: 'QUIZ', title: '随堂练习：连线游戏', duration: '1:00' },
          { id: 's3', type: 'VIDEO', title: '视频：生活中的数字', duration: '3:00' },
          { id: 's4', type: 'OTHER', title: '互动游戏：数字大冒险', duration: '2:30' },
          { id: 's5', type: 'TEXT', title: '课后作业：数字描红', duration: '0:00' }
        ]
      };
    }

    const resource: InteractiveResource = {
      id: initialResource?.id || `IR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: resourceName,
      category: selectedCategory,
      templateName: initialResource?.templateName || '默认模板',
      creator: initialResource?.creator || 'Administrator',
      modifiedAt: new Date().toLocaleString(),
      labels: selectedLabels,
      config: config
    };

    onSave(resource);
  };

  const updateField = (category: InteractionCategory, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const renderCategoryForm = () => {
    const data = formData[selectedCategory];

    switch (selectedCategory) {
      case InteractionCategory.QUIZ:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="题目配置" icon={<HelpCircle size={18} />}>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="题目名称" value={data.topic} onChange={(e) => updateField(InteractionCategory.QUIZ, 'topic', e.target.value)} />
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-700">是否单选</span>
                  <Toggle active={data.isSingle} onClick={() => updateField(InteractionCategory.QUIZ, 'isSingle', !data.isSingle)} />
                </div>
              </div>
            </FormSection>

            <FormSection title="选项配置" icon={<ListOrdered size={18} />}>
              <div className="space-y-4">
                {data.options.map((opt: any, idx: number) => (
                  <div key={opt.id} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                      {idx + 1}#
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="选项名称" value={opt.name} onChange={(e) => {
                        const next = [...data.options];
                        next[idx].name = e.target.value;
                        updateField(InteractionCategory.QUIZ, 'options', next);
                      }} />
                      <InputField label="描述" value={opt.desc} onChange={(e) => {
                        const next = [...data.options];
                        next[idx].desc = e.target.value;
                        updateField(InteractionCategory.QUIZ, 'options', next);
                      }} />
                    </div>
                    <div className="w-full md:w-32 shrink-0">
                      <ImageUpload label="图片" size="sm" />
                    </div>
                    <button onClick={() => {
                      if (data.options.length > 1) {
                        const next = data.options.filter((o: any) => o.id !== opt.id);
                        updateField(InteractionCategory.QUIZ, 'options', next);
                      }
                    }} className="p-2 text-gray-300 hover:text-red-500 self-start md:self-center"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={() => updateField(InteractionCategory.QUIZ, 'options', [...data.options, { id: Date.now().toString(), name: '', desc: '', img: null }])} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2 font-black text-xs">
                  <Plus size={16} /> 添加选项
                </button>
              </div>
            </FormSection>

            <FormSection title="其他配置" icon={<Settings2 size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">正确答案</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={data.correctAnswer}
                    onChange={(e) => updateField(InteractionCategory.QUIZ, 'correctAnswer', e.target.value)}
                  >
                    <option value="">请选择正确选项</option>
                    {data.options.map((_: any, i: number) => (
                      <option key={i} value={i + 1}>{i + 1}#</option>
                    ))}
                  </select>
                </div>
                <InputField label="答案解析" value={data.analysis} onChange={(e) => updateField(InteractionCategory.QUIZ, 'analysis', e.target.value)} />
                <InputField label="正确奖励分" type="number" value={data.rewardScore} onChange={(e) => updateField(InteractionCategory.QUIZ, 'rewardScore', e.target.value)} />
                <InputField label="错误扣除分" type="number" value={data.deductScore} onChange={(e) => updateField(InteractionCategory.QUIZ, 'deductScore', e.target.value)} />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.DEBATE:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="基本信息" icon={<MessageSquare size={18} />}>
              <InputField label="辩论标题" value={data.title} onChange={(e) => updateField(InteractionCategory.DEBATE, 'title', e.target.value)} />
            </FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormSection title="正方配置" icon={<Check className="text-blue-500" size={18} />}>
                <div className="space-y-4">
                  <TextAreaField label="正方观点" value={data.pro.view} onChange={(e) => {
                    const next = { ...data.pro, view: e.target.value };
                    updateField(InteractionCategory.DEBATE, 'pro', next);
                  }} />
                  <ImageUpload label="正方图片" />
                </div>
              </FormSection>
              <FormSection title="反方配置" icon={<X className="text-red-500" size={18} />}>
                <div className="space-y-4">
                  <TextAreaField label="反方观点" value={data.con.view} onChange={(e) => {
                    const next = { ...data.con, view: e.target.value };
                    updateField(InteractionCategory.DEBATE, 'con', next);
                  }} />
                  <ImageUpload label="反方图片" />
                </div>
              </FormSection>
            </div>
          </div>
        );

      case InteractionCategory.DISCUSSION:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="讨论内容" icon={<Users size={18} />}>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="主题名称" value={data.topic} onChange={(e) => updateField(InteractionCategory.DISCUSSION, 'topic', e.target.value)} />
                <TextAreaField label="讨论描述" value={data.desc} onChange={(e) => updateField(InteractionCategory.DISCUSSION, 'desc', e.target.value)} />
              </div>
            </FormSection>
            <FormSection title="规则与素材" icon={<Clock size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="总时长 (分钟)" type="number" value={data.totalTime} onChange={(e) => updateField(InteractionCategory.DISCUSSION, 'totalTime', e.target.value)} />
                <InputField label="单人发言时长 (秒)" type="number" value={data.perPersonTime} onChange={(e) => updateField(InteractionCategory.DISCUSSION, 'perPersonTime', e.target.value)} />
                <InputField label="发言奖励分" type="number" value={data.reward} onChange={(e) => updateField(InteractionCategory.DISCUSSION, 'reward', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <ImageUpload label="背景图片" />
                <FileUploadField label="主持人语音上传" icon={<Mic size={20} />} sub="支持 mp3, wav 格式" />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.VOTE:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="投票基础" icon={<ListOrdered size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="投票名称" value={data.name} onChange={(e) => updateField(InteractionCategory.VOTE, 'name', e.target.value)} />
                <InputField label="投票描述" value={data.desc} onChange={(e) => updateField(InteractionCategory.VOTE, 'desc', e.target.value)} />
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <span className="text-sm font-bold text-gray-700">是否单选</span>
                  <Toggle active={data.isSingle} onClick={() => updateField(InteractionCategory.VOTE, 'isSingle', !data.isSingle)} />
                </div>
              </div>
            </FormSection>
            <FormSection title="选项列表" icon={<Plus size={18} />}>
              <div className="space-y-4">
                {data.options.map((opt: any, idx: number) => (
                  <div key={opt.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex gap-4 items-center">
                    <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                    <InputField label="" placeholder="选项名称" value={opt.name} onChange={(e) => {
                      const next = [...data.options];
                      next[idx].name = e.target.value;
                      updateField(InteractionCategory.VOTE, 'options', next);
                    }} />
                    <button onClick={() => {
                      const next = data.options.filter((o: any) => o.id !== opt.id);
                      updateField(InteractionCategory.VOTE, 'options', next);
                    }} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button onClick={() => updateField(InteractionCategory.VOTE, 'options', [...data.options, { id: Date.now().toString(), name: '' }])} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-500 transition-all font-bold text-xs">+ 添加投票项</button>
              </div>
            </FormSection>
            <FormSection title="得分配置" icon={<Settings2 size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="正确选项" placeholder="如: 1" value={data.correctOption} onChange={(e) => updateField(InteractionCategory.VOTE, 'correctOption', e.target.value)} />
                <InputField label="正确奖励分" type="number" value={data.rewardScore} onChange={(e) => updateField(InteractionCategory.VOTE, 'rewardScore', e.target.value)} />
                <InputField label="错误奖励分" type="number" value={data.wrongReward} onChange={(e) => updateField(InteractionCategory.VOTE, 'wrongReward', e.target.value)} />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.MODEL:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="3D模型配置" icon={<Box size={18} />}>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="模型名称" value={data.name} onChange={(e) => updateField(InteractionCategory.MODEL, 'name', e.target.value)} />
                <InputField label="模型地址" placeholder="https://..." value={data.url} onChange={(e) => updateField(InteractionCategory.MODEL, 'url', e.target.value)} />
                <FileUploadField label="模型视角 JSON 上传" icon={<FileJson size={20} />} sub="请上传 .json 视角配置文件" />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.GANDI_EMBED:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="Gandi 内嵌配置" icon={<Layout size={18} />}>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="交互名称" value={data.name} onChange={(e) => updateField(InteractionCategory.GANDI_EMBED, 'name', e.target.value)} />
                <InputField label="Gandi projectID" placeholder="请输入项目 ID" value={data.projectId} onChange={(e) => updateField(InteractionCategory.GANDI_EMBED, 'projectId', e.target.value)} />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.LINK:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="外链配置" icon={<Link size={18} />}>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="外链名称" value={data.name} onChange={(e) => updateField(InteractionCategory.LINK, 'name', e.target.value)} />
                <InputField label="URL 地址" placeholder="https://..." value={data.url} onChange={(e) => updateField(InteractionCategory.LINK, 'url', e.target.value)} />
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.ONE_STAND:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="活动全局配置" icon={<Trophy size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="活动主题" value={data.topic} onChange={(e) => updateField(InteractionCategory.ONE_STAND, 'topic', e.target.value)} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">淘汰方式</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none"
                    value={data.mode}
                    onChange={(e) => updateField(InteractionCategory.ONE_STAND, 'mode', e.target.value)}
                  >
                    <option>错误淘汰</option>
                    <option>最大错误数</option>
                  </select>
                </div>
                {data.mode === '最大错误数' && (
                  <InputField label="最大错误次数" type="number" value={data.maxErrors} onChange={(e) => updateField(InteractionCategory.ONE_STAND, 'maxErrors', e.target.value)} />
                )}
              </div>
            </FormSection>

            <FormSection title="题目列表" icon={<ListOrdered size={18} />}>
              <div className="space-y-10">
                {data.questions.map((q: any, qIdx: number) => (
                  <div key={q.id} className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black tracking-widest uppercase">题目 {qIdx + 1}</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-lg">
                          <span className="text-[10px] font-black text-gray-400">单选</span>
                          <Toggle active={q.isSingle} onClick={() => {
                            const next = [...data.questions];
                            next[qIdx].isSingle = !next[qIdx].isSingle;
                            updateField(InteractionCategory.ONE_STAND, 'questions', next);
                          }} />
                        </div>
                      </div>
                      <button onClick={() => {
                        const next = data.questions.filter((item: any) => item.id !== q.id);
                        updateField(InteractionCategory.ONE_STAND, 'questions', next);
                      }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="题目名称" value={q.topic} onChange={(e) => {
                        const next = [...data.questions];
                        next[qIdx].topic = e.target.value;
                        updateField(InteractionCategory.ONE_STAND, 'questions', next);
                      }} />
                      <InputField label="答案解析" value={q.analysis} onChange={(e) => {
                        const next = [...data.questions];
                        next[qIdx].analysis = e.target.value;
                        updateField(InteractionCategory.ONE_STAND, 'questions', next);
                      }} />
                    </div>

                    {/* 一站到底选项配置 */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">选项配置</label>
                      <div className="grid grid-cols-1 gap-4">
                        {q.options.map((opt: any, optIdx: number) => (
                          <div key={opt.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-4">
                            <span className="text-xs font-black text-gray-400 shrink-0">{optIdx + 1}#</span>
                            <div className="flex-1">
                              <input
                                className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                                placeholder="选项内容"
                                value={opt.name}
                                onChange={(e) => {
                                  const next = [...data.questions];
                                  next[qIdx].options[optIdx].name = e.target.value;
                                  updateField(InteractionCategory.ONE_STAND, 'questions', next);
                                }}
                              />
                            </div>
                            <button onClick={() => {
                              const next = [...data.questions];
                              next[qIdx].options = next[qIdx].options.filter((o: any) => o.id !== opt.id);
                              updateField(InteractionCategory.ONE_STAND, 'questions', next);
                            }} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const next = [...data.questions];
                            next[qIdx].options.push({ id: Date.now().toString(), name: '', desc: '', img: null });
                            updateField(InteractionCategory.ONE_STAND, 'questions', next);
                          }}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> 添加选项
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">正确答案</label>
                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none"
                          value={q.correct}
                          onChange={(e) => {
                            const next = [...data.questions];
                            next[qIdx].correct = e.target.value;
                            updateField(InteractionCategory.ONE_STAND, 'questions', next);
                          }}
                        >
                          <option value="">选择正确选项</option>
                          {q.options.map((_: any, i: number) => (
                            <option key={i} value={i + 1}>{i + 1}#</option>
                          ))}
                        </select>
                      </div>
                      <InputField label="正确得分" type="number" value={q.score} onChange={(e) => {
                        const next = [...data.questions];
                        next[qIdx].score = e.target.value;
                        updateField(InteractionCategory.ONE_STAND, 'questions', next);
                      }} />
                      <InputField label="错误扣分" type="number" value={q.deduct} onChange={(e) => {
                        const next = [...data.questions];
                        next[qIdx].deduct = e.target.value;
                        updateField(InteractionCategory.ONE_STAND, 'questions', next);
                      }} />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => updateField(InteractionCategory.ONE_STAND, 'questions', [...data.questions, { id: Date.now().toString(), topic: '', analysis: '', correct: '', score: '10', deduct: '5', options: [{ id: Date.now().toString(), name: '', desc: '', img: null }] }])}
                  className="w-full py-5 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all font-black text-xs flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> 添加新题目
                </button>
              </div>
            </FormSection>
          </div>
        );

      case InteractionCategory.COURSE_SLICE:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FormSection title="课节配置" icon={<GraduationCap size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">选择课节</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={data.lessonName}
                    onChange={(e) => updateField(InteractionCategory.COURSE_SLICE, 'lessonName', e.target.value)}
                  >
                    <option value="">请选择课节</option>
                    {['第一课：认识数字', '第二课：拼音基础', '第三课：简单加法', '第四课：古诗赏析'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">课节版本</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={data.version}
                    onChange={(e) => updateField(InteractionCategory.COURSE_SLICE, 'version', e.target.value)}
                  >
                    <option value="">请选择版本</option>
                    {['V1.0.0 (最新版)', 'V0.9.5 (稳定版)', 'V0.9.0 (旧版)'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <ListOrdered size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 mb-1">自动获取说明</h4>
                    <p className="text-xs text-blue-600/80 leading-relaxed font-medium">配置完成后，系统将自动拉取该课节版本下的所有切片资源（包括互动题目、作业等），无需手动逐个添加。</p>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="h-6 w-px bg-gray-100"></div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">
              {isEditMode ? '编辑交互资源' : '新建交互资源'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {isEditMode ? 'Edit Interactive Asset' : 'Create New Interactive Asset'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`px-8 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-xl transition-all active:scale-95 ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            <Save size={18} />
            完成并保存
          </button>
        </div>
      </nav>

      {/* Main Container - Single Column */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-12">
            {/* 1. Category Selection - Hidden in Edit Mode */}
            {!isEditMode && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                  <Layout size={18} className="text-blue-600" />
                  <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">选择交互类型</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {Object.values(InteractionCategory)
                    .filter(cat => cat !== InteractionCategory.AI_SWITCH)
                    .map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-3 ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        <div className={`${selectedCategory === cat ? 'text-white' : 'text-blue-500'}`}>
                          {getCategoryIcon(cat, 24)}
                        </div>
                        <span className="text-[10px] font-black whitespace-nowrap">{cat}</span>
                      </button>
                    ))}
                </div>
              </section>
            )}

            {/* 2. Common Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                <Tag size={18} className="text-blue-600" />
                <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">基础信息模块</h2>
              </div>
              <div className="space-y-8">
                <InputField
                  label="内部展示名称"
                  placeholder="请输入资源在后台显示的名称..."
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">标签分类 (点击选择或新增)</label>
                    <button
                      onClick={() => setShowLabelInput(!showLabelInput)}
                      className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <PlusCircle size={12} /> 自定义标签
                    </button>
                  </div>

                  {showLabelInput && (
                    <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200 mb-4">
                      <input
                        autoFocus
                        type="text"
                        placeholder="输入新标签..."
                        value={newLabelInput}
                        onChange={(e) => setNewLabelInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewLabel()}
                        className="flex-1 bg-gray-50 border border-blue-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-900 outline-none"
                      />
                      <button
                        onClick={handleAddNewLabel}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black"
                      >
                        添加
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {availableLabels.map(label => (
                      <button
                        key={label}
                        onClick={() => toggleLabel(label)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedLabels.includes(label) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-400'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Dynamic Detail Section */}
            <div className="pt-6 border-t border-gray-100">
              {renderCategoryForm()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- HELPERS & ATOMS ---

const getCategoryIcon = (cat: InteractionCategory, size: number = 32) => {
  switch (cat) {
    case InteractionCategory.QUIZ: return <HelpCircle size={size} />;
    case InteractionCategory.DEBATE: return <MessageSquare size={size} />;
    case InteractionCategory.VOTE: return <ListOrdered size={size} />;
    case InteractionCategory.DISCUSSION: return <Users size={size} />;
    case InteractionCategory.MODEL: return <Box size={size} />;
    case InteractionCategory.LINK: return <Link size={size} />;
    case InteractionCategory.GANDI_EMBED: return <Layout size={size} />;
    case InteractionCategory.ONE_STAND: return <Trophy size={size} />;
    case InteractionCategory.COURSE_SLICE: return <GraduationCap size={size} />;
    default: return <Settings2 size={size} />;
  }
};

const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
      <span className="text-blue-600">{icon}</span>
      <h4 className="text-base font-black text-gray-900 tracking-tight uppercase">{title}</h4>
    </div>
    <div className="bg-transparent p-1">
      {children}
    </div>
  </div>
);

const InputField: React.FC<{
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode
}> = ({ label, placeholder, value, onChange, type = "text", icon }) => (
  <div className="space-y-2 flex-1">
    {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm ${icon ? 'pl-12' : ''}`}
      />
    </div>
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
    />
  </div>
);

const FileUploadField: React.FC<{ label: string; icon: React.ReactNode; sub: string }> = ({ label, icon, sub }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
    <div className="h-40 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group bg-white shadow-sm">
      <div className="text-gray-300 group-hover:text-blue-500 transition-colors">{icon}</div>
      <span className="text-sm text-gray-500 font-bold">点击上传素材</span>
      <span className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">{sub}</span>
    </div>
  </div>
);

const Toggle: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${active ? 'bg-blue-600' : 'bg-gray-300'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-7' : 'translate-x-0'}`}></div>
  </button>
);

const ImageUpload: React.FC<{ label: string; color?: string; size?: 'sm' | 'md' }> = ({ label, color = "blue", size = 'md' }) => (
  <div className="space-y-2">
    <label className={`${size === 'sm' ? 'text-[8px]' : 'text-[10px]'} font-black text-gray-400 uppercase tracking-widest pl-1`}>{label}</label>
    <div className={`${size === 'sm' ? 'h-24' : 'h-32'} border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-${color}-50 hover:border-${color}-300 transition-all cursor-pointer group bg-white shadow-sm`}>
      <ImageIcon className="text-gray-200 group-hover:text-blue-500" size={size === 'sm' ? 18 : 24} />
      <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-gray-400 font-bold`}>上传</span>
    </div>
  </div>
);

export default CreateInteractiveResourceView;

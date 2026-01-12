
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, BookOpen, CheckCircle2, Globe, Trash2 } from 'lucide-react';
import { LiveStream, LiveStatus, LiveType } from '../types';

interface CreateLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (newStream: LiveStream) => void;
  editStream?: LiveStream | null;
}

const CreateLiveModal: React.FC<CreateLiveModalProps> = ({ isOpen, onClose, onCreate, editStream }) => {
  const [liveName, setLiveName] = useState('');
  const [liveDesc, setLiveDesc] = useState('');
  const [liveType, setLiveType] = useState<LiveType>(LiveType.COURSE);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editStream;

  // Reset or Fill form
  useEffect(() => {
    if (isOpen) {
      if (editStream) {
        setLiveName(editStream.name);
        setLiveDesc(editStream.description);
        setLiveType(editStream.type);
        setCoverImage(editStream.coverUrl);
      } else {
        setLiveName('');
        setLiveDesc('');
        setCoverImage(null);
        setLiveType(LiveType.COURSE);
      }
    }
  }, [isOpen, editStream]);

  // Validation
  const isFormValid = liveName.trim() !== '' && coverImage !== null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (!isFormValid) return;

    const streamData: LiveStream = {
      id: editStream?.id || `LS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: liveName,
      description: liveDesc || '暂无描述',
      coverUrl: coverImage || '',
      type: liveType,
      teacher: editStream?.teacher || 'Administrator',
      status: editStream?.status || LiveStatus.NOT_STARTED,
      startTime: editStream?.startTime || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (onCreate) {
      onCreate(streamData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? '编辑直播间' : '新建直播间'}</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">完善直播信息以开始您的直播旅程</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">

          {/* Basic Info Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-3">
              <h3 className="font-bold text-gray-900">1. 基础信息</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  直播间名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={liveName}
                  onChange={(e) => setLiveName(e.target.value)}
                  placeholder="主要用于内部管理，普通直播的学生侧展示名称在管理页场次中设置"
                  className={`w-full bg-gray-50 border ${liveName.trim() === '' ? 'border-gray-200' : 'border-blue-300'} rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">直播间描述</label>
                <textarea
                  rows={2}
                  value={liveDesc}
                  onChange={(e) => setLiveDesc(e.target.value)}
                  placeholder="主要用于内部管理，方便内部人员快速了解直播间用途"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  直播间封面 <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={triggerUpload}
                  className={`mt-1 flex justify-center items-center min-h-[180px] border-2 border-dashed rounded-2xl hover:bg-blue-50/40 transition-all cursor-pointer group relative overflow-hidden ${coverImage ? 'border-blue-400' : 'border-gray-300'}`}
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-3 text-center p-6">
                      <div className="mx-auto h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Upload className="h-7 w-7 text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-bold text-blue-600">点击上传封面图</span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">推荐使用4:3比例</p>
                    </div>
                  )}
                  {coverImage && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="bg-white px-5 py-2 rounded-lg text-blue-600 text-xs font-bold shadow-xl border border-blue-50">更换封面</div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCoverImage(null); }}
                        className="bg-red-500 hover:bg-red-600 p-2.5 rounded-lg text-white shadow-xl transition-transform active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Type Selection Section */}
          <section className="space-y-6">
            <div className="flex flex-col gap-1 border-l-4 border-blue-600 pl-3">
              <h3 className="font-bold text-gray-900">2. 直播类型</h3>
              <p className="text-xs text-amber-600 font-medium">直播类型选择后后续无法更改</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isEdit}
                onClick={() => setLiveType(LiveType.COURSE)}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${liveType === LiveType.COURSE
                  ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100/50'
                  : 'border-gray-100 hover:border-gray-300 bg-white hover:shadow-md'
                  } ${isEdit && liveType !== LiveType.COURSE ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${liveType === LiveType.COURSE ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">课程直播</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                    关联已有班级-课节，无单独直播入口，适用于教学场景
                  </div>
                </div>
                {liveType === LiveType.COURSE && <CheckCircle2 size={20} className="absolute top-4 right-4 text-blue-600" />}
              </button>

              <button
                type="button"
                disabled={isEdit}
                onClick={() => setLiveType(LiveType.ORDINARY)}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${liveType === LiveType.ORDINARY
                  ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100/50'
                  : 'border-gray-100 hover:border-gray-300 bg-white hover:shadow-md'
                  } ${isEdit && liveType !== LiveType.ORDINARY ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${liveType === LiveType.ORDINARY ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                  <Globe size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">普通直播</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                    灵活配置可见人群，有单独入口，适用于家长会等开放场景
                  </div>
                </div>
                {liveType === LiveType.ORDINARY && <CheckCircle2 size={20} className="absolute top-4 right-4 text-blue-600" />}
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end items-center gap-4 bg-white sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleConfirm}
            className={`px-10 py-3.5 rounded-xl text-sm font-bold transition-all shadow-xl active:scale-95 ${isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
          >
            {isEdit ? '确认并保存' : '确认并创建直播间'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateLiveModal;

import React, { useRef, useState } from 'react';
import { FileText, X, Download, Upload, MoreVertical } from 'lucide-react';

interface PrdFloatingBallProps {
  enabled: boolean;
  onToggle: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

const PrdFloatingBall: React.FC<PrdFloatingBallProps> = ({ enabled, onToggle, onExport, onImport }) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed right-5 bottom-5 z-[200] select-none" data-prd-ignore="true">
      <div className="flex items-center gap-2">
        {/* 主开关 */}
        <button
          onClick={() => {
            setOpen(false);
            onToggle();
          }}
          className={`group flex items-center gap-2 px-4 py-3 rounded-full shadow-xl border transition-all active:scale-95 ${enabled
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-200'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          title={enabled ? '退出 PRD 模式' : '进入 PRD 模式'}
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center ${enabled ? 'bg-white/15' : 'bg-indigo-50 text-indigo-600'}`}>
            {enabled ? <X size={18} /> : <FileText size={18} />}
          </span>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-black tracking-wide">PRD</span>
            <span className={`text-[10px] font-bold ${enabled ? 'text-indigo-100' : 'text-gray-400'}`}>
              {enabled ? '模式已开启' : '点击开启'}
            </span>
          </div>
        </button>

        {/* 更多：导出/导入 */}
        <div className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className={`w-11 h-11 rounded-full shadow-xl border flex items-center justify-center transition-all active:scale-95 ${enabled ? 'bg-white/10 border-indigo-500/40 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="PRD 数据工具"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div className="absolute bottom-[54px] right-0 w-[220px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden" data-prd-layer-popup="true">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRD 数据</div>
                <div className="text-xs font-bold text-gray-800">备份 / 迁移</div>
              </div>
              <div className="p-2">
                <button
                  disabled={!onExport}
                  onClick={() => {
                    onExport?.();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} /> 导出标注（JSON）
                </button>
                <button
                  disabled={!onImport}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={16} /> 导入标注（JSON）
                </button>
                <div className="px-3 pt-2 pb-1 text-[10px] text-gray-400 leading-relaxed">
                  提示：浏览器清缓存/换域名/换电脑会丢本地数据，建议定期导出备份。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport?.(f);
          e.currentTarget.value = '';
          setOpen(false);
        }}
      />
    </div>
  );
};

export default PrdFloatingBall;



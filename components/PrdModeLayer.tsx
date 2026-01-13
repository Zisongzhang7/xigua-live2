import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Edit3, Trash2, PlusCircle, X, Check, Info } from 'lucide-react';
import { db } from '../services/db';
import type { PrdNote } from '../types';
import { deletePrdNote, fetchPrdNotes, upsertPrdNotes } from '../services/prdNotesApi';

type MenuAction = 'add' | 'edit' | 'delete';

interface PrdModeLayerProps {
  enabled: boolean;
  scopeKey: string;
}

type ContextMenuState = {
  x: number;
  y: number;
  selector: string;
  hasNote: boolean;
};

type EditorState = {
  selector: string;
  content: string;
  anchorRect: DOMRect;
};

type TooltipState = {
  selector: string;
  note: PrdNote;
  anchorRect: DOMRect;
};

function cssEscape(value: string) {
  const cssAny = (globalThis as any).CSS;
  if (cssAny && typeof cssAny.escape === 'function') return cssAny.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);
}

function isIgnoredTarget(el: Element | null) {
  if (!el) return true;
  return !!el.closest('[data-prd-ignore="true"]');
}

function isInsidePrdPopup(el: Element | null) {
  if (!el) return false;
  return !!el.closest('[data-prd-layer-popup="true"]');
}

function getUniqueSelector(el: Element): string {
  const htmlEl = el as HTMLElement;
  if (htmlEl.id) return `#${cssEscape(htmlEl.id)}`;

  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node.nodeType === 1 && node !== document.body) {
    const tag = node.tagName.toLowerCase();
    const parent = node.parentElement;
    if (!parent) break;

    const sameTagSiblings = Array.from(parent.children).filter((c) => c.tagName === node!.tagName);
    let part = tag;
    if (sameTagSiblings.length > 1) {
      const idx = sameTagSiblings.indexOf(node) + 1;
      part = `${tag}:nth-of-type(${idx})`;
    }
    parts.unshift(part);

    // 如果父级有 id，就到此为止，提升稳定性与可读性
    if (parent.id) {
      parts.unshift(`#${cssEscape(parent.id)}`);
      break;
    }

    node = parent;
  }

  if (parts.length === 0) return 'body';
  if (parts[0]?.startsWith('#')) return `${parts[0]}${parts.length > 1 ? ' > ' + parts.slice(1).join(' > ') : ''}`;
  return `body > ${parts.join(' > ')}`;
}

function pickAnchorRectFromPoint(x: number, y: number): DOMRect | null {
  const el = document.elementFromPoint(x, y);
  if (!el || isIgnoredTarget(el)) return null;
  return (el as HTMLElement).getBoundingClientRect();
}

type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'link'; text: string; href: string };

function parseInline(input: string): InlineToken[] {
  // Very small markdown subset:
  // - `code`
  // - **bold**
  // - *italic*
  // - [text](url)
  const out: InlineToken[] = [];
  let s = input;

  const pushText = (t: string) => {
    if (!t) return;
    out.push({ type: 'text', text: t });
  };

  while (s.length > 0) {
    // code
    const codeMatch = s.match(/`([^`]+)`/);
    const boldMatch = s.match(/\*\*([^*]+)\*\*/);
    const italicMatch = s.match(/\*([^*]+)\*/);
    const linkMatch = s.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      codeMatch ? { kind: 'code' as const, idx: codeMatch.index ?? 0, len: codeMatch[0].length, g1: codeMatch[1] } : null,
      boldMatch ? { kind: 'bold' as const, idx: boldMatch.index ?? 0, len: boldMatch[0].length, g1: boldMatch[1] } : null,
      italicMatch ? { kind: 'italic' as const, idx: italicMatch.index ?? 0, len: italicMatch[0].length, g1: italicMatch[1] } : null,
      linkMatch ? { kind: 'link' as const, idx: linkMatch.index ?? 0, len: linkMatch[0].length, g1: linkMatch[1], g2: linkMatch[2] } : null
    ].filter(Boolean) as any[];

    if (matches.length === 0) {
      pushText(s);
      break;
    }

    matches.sort((a, b) => a.idx - b.idx);
    const m = matches[0];
    if (m.idx > 0) pushText(s.slice(0, m.idx));

    const raw = s.slice(m.idx, m.idx + m.len);
    if (m.kind === 'code') out.push({ type: 'code', text: m.g1 });
    else if (m.kind === 'bold') out.push({ type: 'bold', children: parseInline(m.g1) });
    else if (m.kind === 'italic') out.push({ type: 'italic', children: parseInline(m.g1) });
    else if (m.kind === 'link') out.push({ type: 'link', text: m.g1, href: m.g2 });

    s = s.slice(m.idx + raw.length);
  }

  return out;
}

function renderInline(tokens: InlineToken[], keyPrefix: string) {
  return tokens.map((t, i) => {
    const key = `${keyPrefix}-${i}`;
    if (t.type === 'text') return <React.Fragment key={key}>{t.text}</React.Fragment>;
    if (t.type === 'code') {
      return (
        <code key={key} className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-[12px]">
          {t.text}
        </code>
      );
    }
    if (t.type === 'bold') return <strong key={key} className="font-black">{renderInline(t.children, key)}</strong>;
    if (t.type === 'italic') return <em key={key} className="italic">{renderInline(t.children, key)}</em>;
    if (t.type === 'link') {
      return (
        <a
          key={key}
          href={t.href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {t.text}
        </a>
      );
    }
    return null;
  });
}

function renderMarkdown(md: string) {
  // minimal block markdown:
  // - ``` code fences
  // - headings: #, ##, ###
  // - unordered list: - item / * item
  // - paragraphs with inline formatting
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    // code fence
    if (line.trim().startsWith('```')) {
      const fence = line.trim();
      const lang = fence.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      // consume closing fence
      if (i < lines.length) i++;
      const code = codeLines.join('\n');
      blocks.push(
        <div key={`code-${blockIdx++}`} className="my-2">
          {lang && <div className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">{lang}</div>}
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-3 overflow-auto text-[12px] leading-relaxed">
            <code className="font-mono whitespace-pre">{code}</code>
          </pre>
        </div>
      );
      continue;
    }

    // blank
    if (line.trim() === '') {
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const cls =
        level === 1 ? 'text-lg font-black text-gray-900' :
          level === 2 ? 'text-base font-black text-gray-900' :
            'text-sm font-black text-gray-900';
      blocks.push(
        <div key={`h-${blockIdx++}`} className="mt-2 mb-1">
          <div className={cls}>{renderInline(parseInline(text), `h-${blockIdx}`)}</div>
        </div>
      );
      i++;
      continue;
    }

    // list
    if (/^(\-|\*)\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\-|\*)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^(\-|\*)\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${blockIdx++}`} className="list-disc pl-5 space-y-1 my-2">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm text-gray-800 leading-relaxed">
              {renderInline(parseInline(it), `li-${blockIdx}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // paragraph (collect until blank)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      para.push(lines[i]);
      i++;
    }
    const text = para.join('\n');
    blocks.push(
      <p key={`p-${blockIdx++}`} className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed my-2">
        {renderInline(parseInline(text), `p-${blockIdx}`)}
      </p>
    );
  }

  return <div>{blocks}</div>;
}

const PrdModeLayer: React.FC<PrdModeLayerProps> = ({ enabled, scopeKey }) => {
  const [notes, setNotes] = useState<PrdNote[]>([]);
  const [syncMode, setSyncMode] = useState<'server' | 'local'>('server');

  // 拉取当前 scope 的 notes：优先服务端，失败回退本地
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!enabled) {
        setNotes([]);
        return;
      }
      try {
        const serverNotes = await fetchPrdNotes(scopeKey);
        if (cancelled) return;
        setSyncMode('server');
        setNotes(serverNotes);
        // best-effort：同步写入本地缓存，方便离线回退
        try {
          await db.prdNotes.bulkPut(serverNotes);
        } catch { }
      } catch {
        // fallback local
        const localNotes = await db.prdNotes.where('scopeKey').equals(scopeKey).toArray();
        if (cancelled) return;
        setSyncMode('local');
        setNotes(localNotes);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [enabled, scopeKey]);

  const noteBySelector = useMemo(() => {
    const map = new Map<string, PrdNote>();
    notes.forEach((n) => map.set(n.selector, n));
    return map;
  }, [notes]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastHoverElRef = useRef<Element | null>(null);

  const closeAllPopups = () => {
    setContextMenu(null);
    setEditor(null);
    setTooltip(null);
  };

  const upsertNote = async (selector: string, content: string) => {
    const existing = noteBySelector.get(selector);
    const now = new Date().toISOString();
    const key = `${scopeKey}::${selector}`;
    const note: PrdNote = {
      key,
      scopeKey,
      selector,
      content,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    // optimistic UI
    setNotes((prev) => {
      const map = new Map(prev.map(n => [n.key, n]));
      map.set(note.key, note);
      return Array.from(map.values());
    });

    // server-first, fallback local
    try {
      await upsertPrdNotes([note]);
      setSyncMode('server');
    } catch {
      await db.prdNotes.put(note);
      setSyncMode('local');
    }
  };

  const deleteNote = async (selector: string) => {
    const key = `${scopeKey}::${selector}`;
    setNotes((prev) => prev.filter((n) => n.key !== key));
    try {
      await deletePrdNote(key);
      setSyncMode('server');
    } catch {
      await db.prdNotes.delete(key);
      setSyncMode('local');
    }
  };

  const openEditor = (selector: string, anchorRect: DOMRect) => {
    const existing = noteBySelector.get(selector);
    setEditor({
      selector,
      content: existing?.content || '',
      anchorRect
    });
    setContextMenu(null);
  };

  const handleAction = async (action: MenuAction, selector: string, anchorRect: DOMRect) => {
    if (action === 'add' || action === 'edit') {
      openEditor(selector, anchorRect);
      return;
    }
    if (action === 'delete') {
      const ok = window.confirm('确定要删除这个元素的说明吗？');
      if (!ok) return;
      await deleteNote(selector);
      setContextMenu(null);
      setTooltip(null);
    }
  };

  // PRD 模式：右键菜单
  useEffect(() => {
    if (!enabled) {
      closeAllPopups();
      return;
    }

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!enabled) return;
      if (isIgnoredTarget(target)) return;

      e.preventDefault();
      e.stopPropagation();

      const selector = target ? getUniqueSelector(target) : '';
      if (!selector) return;

      const hasNote = noteBySelector.has(selector);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        selector,
        hasNote
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!enabled) return;
      if (target?.closest('[data-prd-layer-popup="true"]')) return;
      setContextMenu(null);
    };

    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onClick, true);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('mousedown', onClick, true);
    };
  }, [enabled, noteBySelector]);

  // PRD 模式：对已标注元素做可视化高亮（outline，不影响布局）
  useEffect(() => {
    if (!enabled) return;

    const updateHighlights = () => {
      // 1. Identify all elements that SHOULD be highlighted
      const newActiveMap = new Map<Element, string>(); // element -> selector

      notes.forEach((n) => {
        try {
          // Use querySelectorAll to be safe, but usually just one
          const el = document.querySelector(n.selector);
          if (el && !isIgnoredTarget(el)) {
            newActiveMap.set(el, n.selector);
          }
        } catch { }
      });

      // 2. Remove highlight from elements that are no longer active
      document.querySelectorAll('[data-prd-noted="true"]').forEach((el) => {
        if (!newActiveMap.has(el)) {
          el.removeAttribute('data-prd-noted');
          el.removeAttribute('data-prd-selector');
        }
      });

      // 3. Add highlight to new active elements
      newActiveMap.forEach((selector, el) => {
        if (el.getAttribute('data-prd-noted') !== 'true') {
          el.setAttribute('data-prd-noted', 'true');
          el.setAttribute('data-prd-selector', selector);
        } else {
          // Update selector if changed
          if (el.getAttribute('data-prd-selector') !== selector) {
            el.setAttribute('data-prd-selector', selector);
          }
        }
      });
    };

    updateHighlights();
    // 增加轮询检查，以应对 DOM 延迟加载或动态变化
    const timer = window.setInterval(updateHighlights, 500);

    return () => {
      window.clearInterval(timer);
      document.querySelectorAll('[data-prd-noted="true"]').forEach((el) => {
        try {
          el.removeAttribute('data-prd-noted');
          el.removeAttribute('data-prd-selector');
        } catch { }
      });
    };
  }, [enabled, notes, scopeKey]);

  // PRD 模式：hover 展示 tooltip（用 raf 节流 + 延迟消失）
  useEffect(() => {
    if (!enabled) {
      setTooltip(null);
      return;
    }

    // 每次依赖更新（tooltip 变化）导致 effect 重启时，立即恢复高亮状态
    // 防止 cleanup 清除了高亮但下一次 mousemove 还没触发导致的闪烁/消失
    if (tooltip?.selector) {
      const el = document.querySelector(tooltip.selector);
      if (el) el.setAttribute('data-prd-noted-hover', 'true');
    }

    let hideTimer: number | null = null;

    const onMouseMove = (e: MouseEvent) => {
      if (!enabled) return;
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const el = document.elementFromPoint(e.clientX, e.clientY);
        
        // 当鼠标移到 tooltip/editor/contextmenu 上时，清除隐藏定时器，保持 tooltip
        if (isInsidePrdPopup(el)) {
          if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
          }
          return;
        }

        // 查找最近的已标注祖先元素（利用 data-prd-noted 属性）
        const notedEl = el?.closest('[data-prd-noted="true"]');

        if (notedEl) {
          const sel = notedEl.getAttribute('data-prd-selector');
          const note = sel ? noteBySelector.get(sel) : null;

          if (note) {
            // 找到了！清除隐藏定时器
            if (hideTimer) {
              window.clearTimeout(hideTimer);
              hideTimer = null;
            }

            // 如果已经是当前显示的 tooltip，就不重新设置（避免闪烁）
            if (tooltip?.selector !== sel) {
              setTooltip({ selector: sel!, note, anchorRect: notedEl.getBoundingClientRect() });
              // 添加手动高亮类，防止 tooltip 遮挡导致 hover 丢失
              document.querySelectorAll('[data-prd-noted-hover]').forEach(e => e.removeAttribute('data-prd-noted-hover'));
              notedEl.setAttribute('data-prd-noted-hover', 'true');
            }
            // 更新 lastHoverElRef
            lastHoverElRef.current = notedEl;
            return;
          }
        }

        // 如果没有找到 noted 元素，且当前有 tooltip，则启动延迟关闭
        if (tooltip && !hideTimer) {
           hideTimer = window.setTimeout(() => {
             setTooltip(null);
             // 清理手动高亮
             document.querySelectorAll('[data-prd-noted-hover]').forEach(e => e.removeAttribute('data-prd-noted-hover'));
             hideTimer = null;
           }, 300);
        }
      });
    };

    document.addEventListener('mousemove', onMouseMove, true);
    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimer) window.clearTimeout(hideTimer);
      rafRef.current = null;
      lastHoverElRef.current = null;
      document.querySelectorAll('[data-prd-noted-hover]').forEach(e => e.removeAttribute('data-prd-noted-hover'));
    };
  }, [enabled, noteBySelector, tooltip]); // depend on tooltip to know current state

  if (!enabled) return null;

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    const { x, y, selector, hasNote } = contextMenu;

    const anchorRect = pickAnchorRectFromPoint(x, y) || new DOMRect(x, y, 1, 1);

    return (
      <div
        className="fixed inset-0 z-[220]"
        data-prd-ignore="true"
      >
        <div
          className="absolute inset-0"
          onClick={() => setContextMenu(null)}
        />
        <div
          data-prd-layer-popup="true"
          className="fixed min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ left: x, top: y }}
        >
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRD 模式</div>
            <div className="text-[10px] font-mono text-gray-400 truncate" title={selector}>
              {selector}
            </div>
          </div>
          <div className="p-2">
            {!hasNote ? (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 text-indigo-700 font-bold text-sm transition-colors"
                onClick={() => handleAction('add', selector, anchorRect)}
              >
                <PlusCircle size={16} /> 添加说明
              </button>
            ) : (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-sm transition-colors"
                  onClick={() => handleAction('edit', selector, anchorRect)}
                >
                  <Edit3 size={16} /> 编辑说明
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-bold text-sm transition-colors"
                  onClick={() => handleAction('delete', selector, anchorRect)}
                >
                  <Trash2 size={16} /> 删除说明
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    if (!editor) return null;
    const { selector, anchorRect } = editor;
    const isEditing = noteBySelector.has(selector);

    // 位置：优先放右侧，空间不够则放左侧
    const width = 560;
    const padding = 4;
    const rightX = anchorRect.right + padding;
    const leftX = Math.max(10, anchorRect.left - width - padding);
    const fitsRight = rightX + width < window.innerWidth - 10;
    const x = fitsRight ? rightX : leftX;
    const y = Math.min(window.innerHeight - 220, Math.max(10, anchorRect.top));

    return (
      <div className="fixed inset-0 z-[230]" data-prd-ignore="true">
        <div className="absolute inset-0 bg-black/10" onClick={() => setEditor(null)} />
        <div
          data-prd-layer-popup="true"
          className="fixed w-[560px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          style={{ left: x, top: y }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEditing ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isEditing ? <Edit3 size={18} /> : <Info size={18} />}
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">{isEditing ? '编辑说明' : '添加说明'}</div>
                <div className="text-[10px] font-mono text-gray-400 truncate max-w-[220px]" title={selector}>
                  {selector}
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditor(null)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="关闭"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-3">
            <div className="text-[11px] text-gray-400 font-bold">
              支持 Markdown：`**加粗**`、`*斜体*`、`` `行内代码` ``、```代码块```、`- 列表`、`# 标题`、`[链接](url)`
            </div>
            <textarea
              autoFocus
              value={editor.content}
              onChange={(e) => setEditor((prev) => prev ? ({ ...prev, content: e.target.value }) : prev)}
              placeholder="请输入该功能/模块的说明（Markdown）"
              className="w-full h-48 resize-none bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditor(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                取消
              </button>
              <button
                disabled={!editor.content.trim()}
                onClick={async () => {
                  await upsertNote(selector, editor.content.trim());
                  setEditor(null);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <Check size={16} /> 保存
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    if (!tooltip || editor || contextMenu) return null; // 避免冲突
    const { note, anchorRect, selector } = tooltip;

    const width = 440;
    const padding = 4;
    const rightX = anchorRect.right + padding;
    const leftX = Math.max(10, anchorRect.left - width - padding);
    const fitsRight = rightX + width < window.innerWidth - 10;
    const x = fitsRight ? rightX : leftX;
    const y = Math.min(window.innerHeight - 240, Math.max(10, anchorRect.top));

    return (
      <div className="fixed z-[210]" style={{ left: x, top: y }} data-prd-ignore="true">
        <div
          data-prd-layer-popup="true"
          className="w-[440px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">元素说明</div>
              <div className="text-[10px] font-mono text-gray-400 truncate" title={selector}>
                {selector}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => openEditor(selector, anchorRect)}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="编辑"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={async () => {
                  const ok = window.confirm('确定要删除这个元素的说明吗？');
                  if (!ok) return;
                  await deleteNote(selector);
                  setTooltip(null);
                }}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-sm text-gray-800 leading-relaxed">
              {renderMarkdown(note.content)}
            </div>
            <div className="mt-3 text-[10px] text-gray-400 font-mono">
              更新：{note.updatedAt}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 高亮样式（不影响布局） */}
      <style>{`
        [data-prd-noted="true"], [data-prd-noted-hover="true"] {
          outline: 2px dashed rgba(239,68,68,0.95) !important;
          outline-offset: 2px;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
          position: relative;
          z-index: 10;
        }
        [data-prd-noted="true"]:hover, [data-prd-noted-hover="true"] {
          outline-style: solid !important;
          box-shadow: 0 0 0 4px rgba(239,68,68,0.18);
        }
      `}</style>

      {/* PRD 模式提示条 */}
      <div className="fixed left-1/2 top-4 -translate-x-1/2 z-[200]" data-prd-ignore="true">
        <div className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 border border-indigo-500 text-xs font-black tracking-wide">
          PRD 模式已开启：右键元素添加说明，hover 查看说明（范围：{scopeKey}，同步：{syncMode === 'server' ? '云端' : '本地'})
        </div>
      </div>

      {renderTooltip()}
      {renderContextMenu()}
      {renderEditor()}
    </>
  );
};

export default PrdModeLayer;

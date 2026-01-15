
import React, { useState, useEffect } from 'react';
import { useEditor, TLShape } from 'tldraw';
import { Layers, Sliders, Sparkles, Target, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'https://esm.sh/framer-motion@10.16.4';
import { NodeInspector } from './panels/NodeInspector';
import { CatalogBrowser } from './panels/CatalogBrowser';
import { NeuralCore } from './panels/NeuralCore';

export const LuminaSidebar = () => {
  const editor = useEditor();
  const [activeTab, setActiveTab] = useState<'PROPS' | 'CATALOG' | 'NEURAL' | 'LAYERS'>('PROPS');
  const [selection, setSelection] = useState<any>(null);
  const [allShapes, setAllShapes] = useState<TLShape[]>([]);

  useEffect(() => {
    const sync = () => {
      const selected = editor.getSelectedShapes();
      setSelection(selected.length === 1 ? selected[0] : null);
      setAllShapes(editor.getCurrentPageShapes().slice().reverse());
    };
    const cleanup = editor.store.listen(sync, { scope: 'all', source: 'all' });
    sync();
    return cleanup;
  }, [editor]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-zinc-400 select-none bg-[#0c0c0e]">
      <div className="flex bg-[#0e0e11] border-b border-white/5 h-20 shrink-0 p-2 gap-1 overflow-x-auto no-scrollbar">
        {[
            { id: 'PROPS', label: 'Workstation', icon: Sliders },
            { id: 'CATALOG', label: 'Catalog', icon: Grid },
            { id: 'NEURAL', label: 'AI Core', icon: Sparkles },
            { id: 'LAYERS', label: 'Stack', icon: Layers }
        ].map(t => (
            <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1.5 transition-all rounded-2xl relative ${activeTab === t.id ? 'text-white bg-white/[0.04] shadow-xl' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02]'}`}
            >
                <t.icon size={18} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                {activeTab === t.id && (
                    <motion.div layoutId="sidebar-tab" className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-500 rounded-full" />
                )}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0c0c0e]">
        <AnimatePresence mode="wait">
            {activeTab === 'PROPS' && <NodeInspector key="props" editor={editor} selection={selection} />}
            {activeTab === 'CATALOG' && <CatalogBrowser key="catalog" editor={editor} />}
            {activeTab === 'NEURAL' && <NeuralCore key="neural" editor={editor} />}
            {activeTab === 'LAYERS' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4 pb-32">
                    <div className="flex items-center justify-between px-3 mb-6">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Stack ({allShapes.length})</span>
                    </div>
                    {allShapes.map((s: any) => (
                        <div 
                            key={s.id} onClick={() => editor.select(s.id)}
                            className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer group shadow-xl ${editor.getSelectedShapeIds().includes(s.id) ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-black/40 border-white/5'}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                {s.props.url ? <img src={s.props.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-900" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black text-zinc-100 truncate uppercase">{s.props.vaultId || s.type}</p>
                                <p className="text-[8px] mono text-zinc-700 font-bold uppercase mt-1">ID: {s.id.slice(-8)}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="h-16 bg-[#0e0e11] border-t border-white/5 px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Kernel v10.0 Fractal Active</span>
            </div>
            <span className="text-[9px] mono text-indigo-500 font-black tracking-tighter bg-indigo-500/10 px-2 py-0.5 rounded">GPU_LOCK</span>
      </div>
    </div>
  );
};

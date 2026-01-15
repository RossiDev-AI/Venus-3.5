
import React, { useState, useMemo } from 'react';
import { Editor } from 'tldraw';
import { Search, Camera, Zap, FlaskConical, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CatalogBrowserProps {
  editor: Editor;
}

const GENERATE_TOOLS = () => {
    const cats = [
        { id: 'OPTICS', label: 'Cinema Glass', icon: Camera, color: 'text-cyan-400', mask: '#06b6d4' },
        { id: 'LIGHT', label: 'Neural Gaffer', icon: Zap, color: 'text-amber-400', mask: '#f59e0b' },
        { id: 'ALCHEMY', label: 'VFX Alchemy', icon: FlaskConical, color: 'text-pink-400', mask: '#ec4899' },
        { id: 'MASTER', label: 'Studio Master', icon: Target, color: 'text-emerald-400', mask: '#10b981' }
    ];

    const names = [
        ["Arri Ultra", "Leica Summilux", "Zeiss Silver", "Cooke Gold", "Panavision Blue", "Vintage 1960", "Summilux 35", "Anamorphic X2", "Master Prime", "Nikon AI-S", "Canon K35", "Helios 44-2", "Lomo Round", "Zenit Pro"],
        ["Golden Hour", "Cyan Moon", "Red Rim", "Neon Purple", "Soft Box 4K", "Tungsten Warm", "LED Matrix", "Studio Strobe", "Cyber Flash", "Volumetric Sun", "HMI 12K", "Candle Light", "Stage Laser"],
        ["Volumetric", "Mist Flow", "Rain Dust", "Chrome Glitch", "Neural Skin", "DNA Fiber", "Liquid Glow", "Smoke Drift", "Heat Wave", "Hologram X", "Bio-Lume", "Carbon Fiber", "Digital Noise"],
        ["Kodak 5219", "Fuji Eterna", "Agfa Movie", "Noir Classic", "Log-C Native", "Rec.709 Std", "Bleach Pass", "Cross Proc", "Technicolor", "Ektachrome", "Kodachrome", "Polaroid Exp"]
    ];

    const results: any[] = [];
    cats.forEach((cat, cIdx) => {
        const catGroup = { ...cat, items: [] as any[] };
        for(let i=0; i<40; i++) {
            const baseNames = names[cIdx];
            const name = baseNames[i % baseNames.length] + ` v${Math.floor(i/baseNames.length) + 1}`;
            catGroup.items.push({
                id: `${cat.id.toLowerCase()}_${i}`,
                name,
                props: {
                    brightness: 0.8 + Math.random() * 0.4,
                    contrast: 0.9 + Math.random() * 0.6,
                    saturation: 0.4 + Math.random() * 1.2,
                    grain: Math.random() * 0.3,
                    rgbSplit: Math.random() > 0.7 ? Math.random() * 1.5 : 0,
                    bloom: Math.random() * 0.6,
                    vignette: Math.random() * 0.2,
                    maskColor: cat.mask
                }
            });
        }
        results.push(catGroup);
    });
    return results;
};

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({ editor }) => {
  const [activeCat, setActiveCat] = useState('OPTICS');
  const [search, setSearch] = useState('');
  
  const TOOLS_CATALOG = useMemo(() => GENERATE_TOOLS(), []);

  const applyTool = (tool: any) => {
    const selected = editor.getSelectedShapes();
    if (selected.length === 0) return toast.error("Select a node to apply kernel");

    selected.forEach(shape => {
      if (shape.type === 'lumina-image') {
        // Trigger scanning effect
        editor.updateShape({
          id: shape.id,
          type: 'lumina-image',
          props: { isScanning: true, maskColor: tool.props.maskColor }
        });
        
        // Apply actual properties after short delay
        setTimeout(() => {
          editor.updateShape({
            id: shape.id,
            type: 'lumina-image',
            props: { ...tool.props, isScanning: false }
          });
          toast.success(`Kernel Synthesized: ${tool.name}`);
        }, 600);
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0c0c0e]">
        {/* HEADER SEARCH */}
        <div className="p-6 shrink-0 space-y-4">
            <div className="flex items-center gap-3 bg-black/60 px-4 py-3 rounded-2xl border border-white/10 group focus-within:border-indigo-500/50 transition-all">
                <Search size={14} className="text-zinc-600" />
                <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search 150+ Kernels..." 
                    className="bg-transparent border-none outline-none text-[11px] font-bold text-white w-full uppercase tracking-widest placeholder:text-zinc-800"
                />
            </div>
            
            {/* CATEGORIES GRID */}
            <div className="grid grid-cols-2 gap-2">
                {TOOLS_CATALOG.map(c => (
                    <button 
                        key={c.id} onClick={() => setActiveCat(c.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${activeCat === c.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/[0.08]'}`}
                    >
                        <c.icon size={12} className={activeCat === c.id ? 'text-white' : c.color} />
                        {c.label}
                    </button>
                ))}
            </div>
        </div>
        
        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-6 pb-48 space-y-2 custom-scrollbar">
            {TOOLS_CATALOG.filter(c => c.id === activeCat).map(cat => (
                <div key={cat.id} className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3 px-1 py-4 border-b border-white/5 mb-2">
                        <cat.icon size={14} className={cat.color} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{cat.label} Matrix</span>
                    </div>
                    {cat.items.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())).map((item: any) => (
                        <button 
                            key={item.id} onClick={() => applyTool(item)}
                            className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl text-left hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group flex items-center justify-between shadow-lg"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-black text-zinc-200 group-hover:text-white uppercase tracking-tighter">{item.name}</span>
                                <span className={`text-[7px] mono uppercase font-bold tracking-widest ${cat.color}`}>LCN_KERNEL_{item.id.toUpperCase()}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-black/40 text-zinc-600 group-hover:text-indigo-400 transition-colors">
                                <Sparkles size={14} />
                            </div>
                        </button>
                    ))}
                </div>
            ))}
        </div>
    </div>
  );
};

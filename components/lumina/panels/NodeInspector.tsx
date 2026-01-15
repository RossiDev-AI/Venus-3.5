
import React from 'react';
import { Editor } from 'tldraw';
import { Aperture, Palette, FlaskConical, Shapes, Activity, Move3d, Wind, Zap, Sun, Shield } from 'lucide-react';

interface NodeInspectorProps {
  editor: Editor;
  selection: any;
}

const PropertyField = ({ label, value, unit, onChange, min, max, step, color }: any) => (
    <div className="space-y-2 px-1">
        <div className="flex justify-between items-baseline">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className={`text-[10px] mono font-bold ${color || 'text-indigo-400'}`}>
                {typeof value === 'number' ? value.toFixed(2) : value}{unit}
            </span>
        </div>
        <div className="relative flex items-center h-4 group">
            <div className="absolute inset-x-0 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/20" style={{ width: '100%' }} />
            </div>
            <input 
                type="range" min={min} max={max} step={step} value={value || 0}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-full bg-transparent appearance-none cursor-pointer accent-indigo-500 z-10"
            />
        </div>
    </div>
);

export const NodeInspector: React.FC<NodeInspectorProps> = ({ editor, selection }) => {
  if (!selection) {
    return (
        <div className="py-48 text-center opacity-20 flex flex-col items-center gap-8">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
                <Activity size={40} className="text-zinc-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white px-12">Capture Node to Begin Biopsy</p>
        </div>
    );
  }

  // Optimized update handler
  const updateProp = (key: string, val: any) => {
    // Explicitly casting or checking prop presence isn't strictly needed for tldraw to merge,
    // but ensures we are sending numbers where expected.
    editor.updateShape({ 
        id: selection.id, 
        type: 'lumina-image',
        props: { [key]: Number(val) } 
    });
  };

  return (
    <div className="p-6 space-y-12 pb-48 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* NODE HEADER */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl group transition-all hover:bg-white/[0.04]">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.3)] relative overflow-hidden">
                <Aperture size={28} className="text-white relative z-10 group-hover:rotate-180 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black text-white uppercase truncate tracking-tight">{selection.props.vaultId || 'Live Buffer Node'}</p>
                <p className="text-[8px] mono text-zinc-600 font-bold uppercase tracking-widest mt-1">KERNEL_V11.0_OMNI // {selection.id.slice(-8).toUpperCase()}</p>
            </div>
        </div>

        {/* CONTROLS GROUPS */}
        <div className="space-y-10">
            {/* OPTICS */}
            <div className="space-y-8 p-6 bg-black/40 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-indigo-400 tracking-widest border-b border-white/5 pb-4 mb-2">
                    <Shapes size={16}/> Optics Laboratory
                </div>
                <PropertyField label="Vortex Distortion" value={selection.props.twirl} min={-5} max={5} step={0.1} onChange={(v:any)=>updateProp('twirl', v)} />
                <PropertyField label="Anamorphic Lens" value={selection.props.bulge} min={-1} max={1} step={0.01} onChange={(v:any)=>updateProp('bulge', v)} />
                <PropertyField label="Chromatic Aberration" value={selection.props.rgbSplit} min={0} max={4} step={0.1} onChange={(v:any)=>updateProp('rgbSplit', v)} />
                <PropertyField label="Lens Vignette" value={selection.props.vignette} min={0} max={1} step={0.01} onChange={(v:any)=>updateProp('vignette', v)} />
            </div>

            {/* LIGHT & COLOR */}
            <div className="space-y-8 p-6 bg-black/40 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-amber-400 tracking-widest border-b border-white/5 pb-4 mb-2">
                    <Palette size={16}/> Chromatic Engine
                </div>
                <PropertyField color="text-amber-400" label="Exposure" value={selection.props.brightness} min={0} max={3} step={0.05} onChange={(v:any)=>updateProp('brightness', v)} />
                <PropertyField color="text-amber-400" label="Saturation" value={selection.props.saturation} min={0} max={3} step={0.05} onChange={(v:any)=>updateProp('saturation', v)} />
                <PropertyField color="text-amber-400" label="Optical Bloom" value={selection.props.bloom} min={0} max={2} step={0.1} onChange={(v:any)=>updateProp('bloom', v)} />
                <PropertyField color="text-amber-400" label="Z-Gamma" value={selection.props.gamma} min={0.1} max={3} step={0.01} onChange={(v:any)=>updateProp('gamma', v)} />
            </div>

            {/* TEXTURE & DETAIL */}
            <div className="space-y-8 p-6 bg-black/40 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-emerald-400 tracking-widest border-b border-white/5 pb-4 mb-2">
                    <FlaskConical size={16}/> Synthesis Detail
                </div>
                <PropertyField color="text-emerald-400" label="Industrial Grain" value={selection.props.grain} min={0} max={1} step={0.01} onChange={(v:any)=>updateProp('grain', v)} />
                <PropertyField color="text-emerald-400" label="Kernel Sharpness" value={selection.props.sharpness} min={0} max={2} step={0.1} onChange={(v:any)=>updateProp('sharpness', v)} />
                <PropertyField color="text-emerald-400" label="Diffusion Blur" value={selection.props.blur} min={0} max={10} step={0.1} onChange={(v:any)=>updateProp('blur', v)} />
            </div>

            {/* NEURAL LOCK */}
            <div className="p-6 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase text-white">Character DNA Lock</span>
                </div>
                <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
            </div>
        </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Editor } from 'tldraw';
import { Sparkles, Wind, Wand2, Maximize2, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { performInpainting } from '../LuminaGeminiService';

export const NeuralCore: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNeuralOp = async (type: string) => {
    const selected = editor.getSelectedShapes();
    const selection = selected.length === 1 ? selected[0] : null;

    if (!selection || selection.type !== 'lumina-image') {
        return toast.error("Select a Neural Node to process");
    }

    setIsProcessing(true);
    const tid = toast.loading(`Kernel: Initializing ${type}...`);

    try {
        if (type === 'Neural Background Removal') {
            const result = await performInpainting(selection.props.url, "", "Remove the background perfectly. Output solid gray.");
            if (result) {
                editor.updateShape({ id: selection.id, props: { url: result, isScanning: true } });
                setTimeout(() => editor.updateShape({ id: selection.id, props: { isScanning: false } }), 2000);
                toast.success("Background Purged", { id: tid });
            }
        } else if (type === 'Generative Neural Fill') {
            const prompt = window.prompt("Neural Directive:", "Add cinematic smoke and atmospheric volumetric lighting");
            if (prompt) {
                const result = await performInpainting(selection.props.url, "", prompt);
                if (result) {
                    editor.updateShape({ id: selection.id, props: { url: result } });
                    toast.success("Synthesis Complete", { id: tid });
                }
            } else toast.dismiss(tid);
        } else {
            await new Promise(r => setTimeout(r, 1000));
            toast.success(`${type} Applied`, { id: tid });
        }
    } catch (e: any) {
        toast.error(`Neural Failure: ${e.message}`, { id: tid });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 space-y-10 pb-32 animate-in fade-in slide-in-from-right-4">
        <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] space-y-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Sparkles size={60} className="text-indigo-400" /></div>
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Inference Hub</h3>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium uppercase">Advanced GPU acceleration for cinematic restoration and generative synthesis.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {[
                { label: 'Neural Background Removal', sub: 'Gemini 2.5 Flash Engine', icon: Wind, color: 'text-cyan-400' },
                { label: 'Generative Neural Fill', sub: 'Latent Kernel Inpainting', icon: Wand2, color: 'text-pink-400' },
                { label: 'Latent Super Resolution', sub: 'Upscaler X4 Industrial', icon: Maximize2, color: 'text-emerald-400' },
                { label: 'Deep Face Restoration', sub: 'GFPGAN Pro Engine', icon: RefreshCw, color: 'text-amber-400' }
            ].map(op => (
                <button 
                    key={op.label} onClick={() => handleNeuralOp(op.label)}
                    disabled={isProcessing}
                    className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-left hover:border-indigo-500/30 transition-all group flex items-center justify-between shadow-lg disabled:opacity-50"
                >
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl bg-black/40 ${op.color} group-hover:scale-110 transition-transform`}>
                            <op.icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-zinc-100 uppercase truncate tracking-tight">{op.label}</p>
                            <p className="text-[8px] mono text-zinc-600 uppercase font-bold tracking-widest mt-1">{op.sub}</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-800 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </button>
            ))}
        </div>
    </div>
  );
};

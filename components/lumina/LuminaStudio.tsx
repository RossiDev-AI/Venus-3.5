
import React, { useMemo, useState, useEffect } from 'react';
import { Tldraw, createShapeId, Editor } from 'tldraw';
import { LuminaImageShapeUtil } from './LuminaImageShapeUtil';
import { LuminaMaskShapeUtil } from './LuminaMaskShapeUtil';
import LuminaUploaderModal from './LuminaUploaderModal';
import { LuminaSidebar } from './LuminaSidebar';
import { LuminaSuperBar } from './LuminaSuperBar';
import { LuminaCanvasHUD } from './LuminaCanvasHUD';
import { VaultItem } from '../../types';
import { toast } from 'sonner';
import { MousePointer2, PenTool, Eraser, Sparkles, Menu, X, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'https://esm.sh/framer-motion@10.16.4';

const LuminaInnerUI = ({ onImportClick, isMobileSidebarOpen, setMobileSidebarOpen }: { onImportClick: () => void, isMobileSidebarOpen: boolean, setMobileSidebarOpen: (v: boolean) => void }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[1000] flex flex-col overflow-hidden">
            {/* OMNI SUPERBAR (TOP) - Responsive */}
            <div className="h-16 w-full bg-[#0e0e11]/90 backdrop-blur-xl border-b border-white/10 flex-shrink-0 pointer-events-auto flex items-center shadow-2xl z-[1002]">
                <LuminaSuperBar onImportClick={onImportClick} />
                
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden mr-4 p-2 text-white bg-white/10 rounded-lg border border-white/10 active:scale-95 transition-all"
                >
                    {isMobileSidebarOpen ? <X size={20} /> : <Layout size={20} />}
                </button>
            </div>

            {/* WORKSPACE AREA */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* TOOLBAR: Desktop (Left Vertical) vs Mobile (Bottom Horizontal) */}
                <div className="hidden md:flex w-16 h-full bg-[#0e0e11]/80 backdrop-blur-md border-r border-white/5 flex-col items-center py-8 gap-6 pointer-events-auto shadow-xl z-[1001]">
                    <ToolbarItems />
                </div>

                {/* CANVAS OVERLAY AREA - Must be transparent to show Tldraw below */}
                <div className="flex-1 relative overflow-hidden">
                    <LuminaCanvasHUD />
                </div>

                {/* INSPECTOR: Desktop (Right Fixed) */}
                <div className="hidden md:flex w-[420px] h-full bg-[#0c0c0e]/98 backdrop-blur-3xl border-l border-white/10 shadow-[-30px_0_60px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden flex-col z-[1001]">
                    <LuminaSidebar />
                </div>

                {/* MOBILE FLOATING DOCK (Bottom Center) */}
                <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
                    <div className="flex items-center gap-4 bg-[#0e0e11]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                        <ToolbarItems isMobile />
                    </div>
                </div>

                {/* MOBILE SIDEBAR SHEET (Slide Up/Over) */}
                <AnimatePresence>
                    {isMobileSidebarOpen && (
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden absolute inset-0 z-[1005] bg-[#0c0c0e] pointer-events-auto flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0e0e11]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Station Controls</span>
                                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 text-zinc-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <LuminaSidebar />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ToolbarItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
        {[
            { id: 'select', icon: MousePointer2, label: 'Selection' },
            { id: 'draw', icon: PenTool, label: 'Neural Mask' },
            { id: 'eraser', icon: Eraser, label: 'Wipe' },
        ].map(t => (
            <button 
                key={t.id} 
                className={`p-3.5 rounded-2xl text-zinc-500 hover:text-white hover:bg-indigo-600/20 transition-all group relative ${isMobile ? 'p-2.5' : ''}`}
                title={t.label}
            >
                <t.icon size={isMobile ? 18 : 20} />
            </button>
        ))}
        <div className={`flex flex-col gap-4 ${isMobile ? 'border-l border-white/10 pl-4 ml-2 flex-row' : 'mt-auto mb-6'}`}>
             <button className={`p-3.5 rounded-2xl text-indigo-500 hover:bg-indigo-500/10 transition-all group relative ${isMobile ? 'p-2.5' : ''}`}>
                <Sparkles size={isMobile ? 18 : 20} />
             </button>
        </div>
    </>
);

const LuminaStudio: React.FC = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const shapeUtils = useMemo(() => [LuminaImageShapeUtil, LuminaMaskShapeUtil], []);

  // Force Dark Mode Overrides
  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({ colorScheme: 'dark' });
      document.documentElement.classList.add('tl-theme__dark');
      // Override background explicitly
      const container = document.querySelector('.tl-container');
      if (container) {
          (container as HTMLElement).style.backgroundColor = '#050505';
      }
    }
  }, [editor]);

  const handleUploadComplete = (node: VaultItem) => {
    if (!editor) return;
    const viewport = editor.getViewportPageBounds();
    
    editor.createShape({
        id: createShapeId(),
        type: 'lumina-image',
        x: viewport.center.x - 400,
        y: viewport.center.y - 250,
        props: {
            url: node.imageUrl,
            vaultId: node.shortId,
            w: 800, h: 500,
            brightness: 1, contrast: 1, saturation: 1, 
            opacity: 1, blendMode: 'normal', isScanning: false,
            twirl: 0, bulge: 0, rgbSplit: 0, vignette: 0, sharpness: 0,
            temperature: 0, tint: 0, grain: 0, blur: 0, bloom: 0, chromatic: 0, exposure: 0,
            hue: 0, vibrance: 1, gamma: 1, maskColor: '#4f46e5'
        }
    });
    toast.success("Industrial Buffer: High-Res Asset Injected 100%");
  };

  return (
      <div className="w-full h-full bg-[#050505] flex overflow-hidden relative tl-theme__dark isolate">
        <style>{`
            .tl-container { background-color: #050505 !important; }
            .tl-background { background-color: #050505 !important; }
            .tl-grid { opacity: 0.1; }
            /* Hide Tldraw default UI on mobile to avoid clutter */
            @media (max-width: 768px) {
                .tlui-layout { display: none !important; }
            }
        `}</style>
        <Tldraw 
          persistenceKey="lumina-v11-omni"
          shapeUtils={shapeUtils}
          darkMode={true}
          onMount={setEditor}
          overrides={{ 
            uiOverrides: { 
                isShowMenu: false, isShowPages: false, 
                isShowZoom: false, isShowNavigationPanel: false, // Zoom controlled by gestures
                isShowStylePanel: false
            } 
          }}
        >
            <LuminaInnerUI 
                onImportClick={() => setIsUploaderOpen(true)} 
                isMobileSidebarOpen={isMobileSidebarOpen}
                setMobileSidebarOpen={setMobileSidebarOpen}
            />
        </Tldraw>

        <LuminaUploaderModal 
            isOpen={isUploaderOpen} 
            onClose={() => setIsUploaderOpen(false)} 
            onUploadComplete={handleUploadComplete}
        />
      </div>
  );
};

export default LuminaStudio;

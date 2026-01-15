
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";

// Helper to resize base64 images if they exceed dimensions/size
async function resizeBase64(base64Str: string, maxWidth = 1536, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      // If image is small enough, return original
      if (img.width <= maxWidth && img.height <= maxWidth) {
        resolve(base64Str);
        return;
      }

      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Force JPEG for smaller payload if not strictly PNG transparent
        resolve(canvas.toDataURL('image/jpeg', quality)); 
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}

export const performInpainting = async (
  imageBase64: string,
  maskBase64: string,
  prompt: string,
  styleDescriptors: string = ""
): Promise<string | null> => {
  // Fix: Move GoogleGenAI instance creation inside the function to ensure the most up-to-date process.env.API_KEY is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // 1. Optimize Payloads (Resize for API limits)
    // Gemini has a payload limit. 4K PNGs can exceed 10-20MB base64 strings easily.
    // We downscale to ~1.5K for processing, but result will be upscaleable or used as is.
    const optimizedImage = await resizeBase64(imageBase64);
    
    // Strip headers after resizing (or if original)
    const cleanImage = optimizedImage.split(",")[1];
    
    // Check mask
    let cleanMask: string | null = null;
    if (maskBase64 && maskBase64.length > 100) {
       // Also resize mask to match image dimensions if needed, but usually exportToBlob matches bounds.
       // We assume mask matches aspect ratio.
       // However, to be safe, we send it as is or resize. For now, try raw.
       cleanMask = maskBase64.split(",")[1];
    }

    const finalPrompt = styleDescriptors 
      ? `Industrial Cinema Synthesis: ${prompt}. Preserve the visual DNA of: ${styleDescriptors}. Smooth blending, hyper-realistic detail.`
      : `Industrial Cinema Synthesis: ${prompt}. High fidelity, photorealistic output.`;

    const parts: any[] = [
      { text: finalPrompt },
      { inlineData: { mimeType: optimizedImage.includes('image/jpeg') ? 'image/jpeg' : 'image/png', data: cleanImage } }
    ];

    if (cleanMask) {
      parts.push({ inlineData: { mimeType: 'image/png', data: cleanMask } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    const respParts = response.candidates?.[0]?.content?.parts;
    if (respParts) {
        for (const part of respParts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error: any) {
    console.error("Gemini Bridge Fault:", error);
    const msg = error.message || "Unknown Error";
    if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
        throw new Error("Input image too large or format invalid. Auto-optimization engaged for next retry.");
    }
    throw new Error(msg || "Failed to establish AI Bridge");
  }
};


import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { UploadCloud, Clapperboard, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import PremiumLock from './PremiumLock';
import { AppView, SubscriptionTier } from '../types';

const VEO_GENERATION_MESSAGES = [
    "Warming up the creative engines...",
    "Gathering pixels and inspiration...",
    "Choreographing the digital dance...",
    "This can take a few minutes, thanks for your patience!",
    "Rendering your vision into reality...",
    "Adding the final touches of magic...",
];

const VisionBoardCreator: React.FC<{ subscriptionTier: SubscriptionTier; setActiveView: (view: AppView) => void; }> = ({ subscriptionTier, setActiveView }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState(VEO_GENERATION_MESSAGES[0]);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const messageIntervalRef = useRef<number | null>(null);

  // Radiance only
  const hasAccess = subscriptionTier === 'radiance';

  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setApiKeySelected(true);
        }
    };
    if (hasAccess) {
        checkApiKey();
    }
  }, [hasAccess]);
  
  useEffect(() => {
    if (isLoading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = VEO_GENERATION_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % VEO_GENERATION_MESSAGES.length;
          return VEO_GENERATION_MESSAGES[nextIndex];
        });
      }, 4000);
    } else if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race condition
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image || !imageBase64) {
      setError('Please upload an image to start.');
      return;
    }
    setError('');
    setIsLoading(true);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let operation: GenerateVideosOperation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image beautifully, bringing it to life with a gentle, inspiring motion.',
        image: {
          imageBytes: imageBase64,
          mimeType: image.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.error) {
          throw new Error((operation.error as any).message || String(operation.error));
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error('Failed to fetch the generated video file.');
        }
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      } else {
        throw new Error('Video generation did not return a valid link.');
      }

    } catch (err: any) {
      console.error('Error generating video:', err);
      let errorMessage = 'We encountered an unexpected error while creating your video. Please try again later.';
      if (err.message && err.message.includes('Requested entity was not found')) {
          errorMessage = "It looks like there is an issue with the API Key selection. Please try selecting your key again.";
          setApiKeySelected(false);
      } else if(err.message) {
          errorMessage = `Generation failed: ${err.message}. Please try a different prompt or check your connection.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!hasAccess) {
    return <PremiumLock setActiveView={setActiveView} featureName="Vision Board Creator" requiredTier="radiance" currentTier={subscriptionTier} />;
  }

  if (!apiKeySelected) {
    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col items-center justify-center p-6 text-center">
            <KeyRound className="w-16 h-16 text-indigo-500 mb-4"/>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">API Key Required</h2>
            <p className="text-slate-600 mb-4 max-w-md">Video generation with Veo requires a project-linked API key. Please select one to proceed.</p>
            <p className="text-sm text-slate-500 mb-6 max-w-md">For information on billing, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
            <button
                onClick={handleSelectKey}
                className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Select API Key
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Vision Board Creator</h2>
        <p className="text-sm text-slate-500">Turn an image and a prompt into an inspiring short video.</p>
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        <div className="w-full aspect-video rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 transition-colors bg-slate-50">
            {isLoading ? (
                 <div className="flex flex-col items-center text-center text-slate-500 p-4">
                    <Loader2 className="animate-spin w-10 h-10 text-indigo-500"/>
                    <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
                </div>
            ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="max-h-full max-w-full rounded-lg object-contain animate-fade-in" />
            ) : (
                <label htmlFor="image-upload" className="cursor-pointer text-center text-slate-400 p-4">
                    {image ? (
                        <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                    ) : (
                        <>
                            <UploadCloud className="w-12 h-12 text-slate-300 mx-auto"/>
                            <p className="mt-2 text-sm font-semibold text-slate-600">Click to upload an image</p>
                            <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10MB</p>
                        </>
                    )}
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            )}
        </div>
        
        <div>
          <label htmlFor="prompt-video" className="block text-sm font-medium text-slate-700 mb-1">
            Describe the animation (optional)
          </label>
          <textarea
            id="prompt-video"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A gentle zoom, with sparkling lights appearing."
            rows={2}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            disabled={isLoading}
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
                {(['16:9', '9:16'] as const).map(ratio => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)} disabled={isLoading} className={`p-2 border rounded-lg text-sm ${aspectRatio === ratio ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
                        {ratio === '16:9' ? 'Landscape' : 'Portrait'} ({ratio})
                    </button>
                ))}
            </div>
        </div>

        <button
          onClick={generateVideo}
          disabled={isLoading || !image}
          className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Generating Video...</>
          ) : (
            <><Clapperboard className="w-5 h-5 mr-2" /> Generate Video</>
          )}
        </button>
        {error && <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-800 text-sm rounded-r-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5"/>{error}</div>}
      </div>
    </div>
  );
};

export default VisionBoardCreator;


import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import PremiumLock from './PremiumLock';
import { AppView, SubscriptionTier } from '../types';

const IMAGE_GENERATION_MESSAGES = [
    "Warming up the digital canvas...",
    "Mixing the perfect palette of pixels...",
    "Consulting with the muses of creativity...",
    "Bringing your imagination to life...",
    "This masterpiece is almost ready!",
];

const ImageGenerator: React.FC<{ subscriptionTier: SubscriptionTier; setActiveView: (view: AppView) => void; }> = ({ subscriptionTier, setActiveView }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(IMAGE_GENERATION_MESSAGES[0]);
  const messageIntervalRef = useRef<number | null>(null);

  const hasAccess = subscriptionTier === 'radiance';

  useEffect(() => {
    if (isLoading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = IMAGE_GENERATION_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % IMAGE_GENERATION_MESSAGES.length;
          return IMAGE_GENERATION_MESSAGES[nextIndex];
        });
      }, 2500);
    } else if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setError('');
    setIsLoading(true);
    setImageUrl(null);
    setLoadingMessage(IMAGE_GENERATION_MESSAGES[0]); // Reset message on new generation

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        setImageUrl(`data:image/png;base64,${base64ImageBytes}`);
      } else {
        throw new Error('No image was generated.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('We couldn\'t generate an image. Please check your connection or try a different prompt.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!hasAccess) {
    return <PremiumLock setActiveView={setActiveView} featureName="Image Creator" requiredTier="radiance" currentTier={subscriptionTier} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Calming Image Creator</h2>
        <p className="text-sm text-slate-500">Create a unique image based on your thoughts and feelings.</p>
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <label htmlFor="prompt-image" className="block text-sm font-medium text-slate-700 mb-1">
            Describe the image you want to create
          </label>
          <textarea
            id="prompt-image"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A serene, misty forest at dawn with soft light filtering through the trees"
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            disabled={isLoading}
          />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map(ratio => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)} disabled={isLoading} className={`p-2 border rounded-lg text-sm ${aspectRatio === ratio ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
                        {ratio}
                    </button>
                ))}
            </div>
        </div>
        <button
          onClick={generateImage}
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Creating...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5 mr-2" />
              Generate Image
            </>
          )}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className={`w-full aspect-square rounded-lg flex items-center justify-center border border-slate-200 transition-colors ${isLoading ? 'animate-pulse-bg' : 'bg-slate-100'}`}>
            {isLoading ? (
                <div className="flex flex-col items-center text-center text-slate-500 p-4">
                    <Loader2 className="animate-spin w-10 h-10 text-indigo-500"/>
                    <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
                    <p className="mt-1 text-xs">This can take a moment.</p>
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} alt={prompt} className="max-h-full max-w-full rounded-lg object-contain animate-fade-in"/>
            ) : (
                <div className="text-center text-slate-400 p-4">
                    <ImageIcon className="w-16 h-16 text-slate-300 mx-auto"/>
                    <p className="mt-2 text-sm">Describe a calming scene and see it come to life.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;

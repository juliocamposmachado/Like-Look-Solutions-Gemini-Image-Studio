import React, { useState, useCallback, useRef } from 'react';
import { editImageWithPrompt } from './services/geminiService';
import { ImagePlaceholder } from './components/ImagePlaceholder';
import { Spinner } from './components/Spinner';

// --- Icon Components ---
const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const WandIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.47 2.118L2.25 12l2.25-4.5 4.5-2.25 4.5 2.25 2.25 4.5 2.25 4.5L16.5 18.75a2.25 2.25 0 0 1-2.47-2.118 3 3 0 0 0-5.78-1.128Z" />
    </svg>
);

const PaintBrushIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);

const CameraIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

// --- Data & Types ---
interface ImageState {
    file: File | null;
    dataUrl: string | null;
}

const artisticStyles = [
    { name: 'Watercolor', prompt: 'Transform the image into a beautiful watercolor painting with soft edges and vibrant, blended colors.', icon: <PaintBrushIcon className="w-5 h-5" /> },
    { name: 'Vintage', prompt: 'Apply a vintage photo effect, with faded colors, film grain, and a slightly yellowed tone.', icon: <CameraIcon className="w-5 h-5" /> },
    { name: 'Neon Punk', prompt: 'Give the image a neon punk aesthetic, with glowing edges, vibrant cybernetic colors, and a dark, futuristic feel.', icon: <WandIcon className="w-5 h-5" /> },
    { name: 'Cartoonify', prompt: 'Convert the image into a vibrant cartoon style with bold outlines and cel-shading.', icon: <WandIcon className="w-5 h-5" /> },
];

export default function App() {
    const [originalImage, setOriginalImage] = useState<ImageState>({ file: null, dataUrl: null });
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                return;
            }
            setError(null);
            setEditedImage(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalImage({ file, dataUrl: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = useCallback(async (currentPrompt: string) => {
        if (!originalImage.dataUrl || !currentPrompt) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const base64Data = originalImage.dataUrl.split(',')[1];
            if (!base64Data || !originalImage.file) {
                 throw new Error("Could not read image data.");
            }
            
            const resultBase64 = await editImageWithPrompt(base64Data, originalImage.file.type, currentPrompt);
            setEditedImage(`data:image/png;base64,${resultBase64}`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [originalImage]);
    
    const handleStyleSelect = (stylePrompt: string) => {
        setPrompt(stylePrompt);
        if (originalImage.dataUrl) {
           handleGenerate(stylePrompt);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Like Look Solutions – Gemini Image Studio</h1>
                        <p className="text-sm text-gray-400">Sua imagem, elevada pela inteligência.</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                    {/* Original Image */}
                    <div className="flex flex-col gap-4 items-center justify-center bg-gray-800/50 p-6 rounded-lg border-2 border-dashed border-gray-700 h-full">
                        <h2 className="text-xl font-semibold text-gray-300 self-start">Original Image</h2>
                        {originalImage.dataUrl ? (
                            <img src={originalImage.dataUrl} alt="Original" className="max-h-[60vh] w-auto object-contain rounded-md shadow-lg" />
                        ) : (
                            <ImagePlaceholder 
                                onButtonClick={() => fileInputRef.current?.click()} 
                                icon={<UploadIcon className="w-12 h-12 text-gray-500"/>} 
                                text="Click to upload an image" 
                            />
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                         <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <UploadIcon className="w-5 h-5" />
                            {originalImage.dataUrl ? 'Change Image' : 'Upload Image'}
                        </button>
                    </div>

                    {/* Edited Image */}
                    <div className="flex flex-col gap-4 items-center justify-center bg-gray-800/50 p-6 rounded-lg border-2 border-dashed border-gray-700 h-full">
                         <h2 className="text-xl font-semibold text-gray-300 self-start">Edited Image</h2>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                               <Spinner />
                               <p className="mt-4 text-gray-400 animate-pulse">Gemini is thinking...</p>
                            </div>
                        ) : editedImage ? (
                            <img src={editedImage} alt="Edited" className="max-h-[60vh] w-auto object-contain rounded-md shadow-lg" />
                        ) : (
                             <ImagePlaceholder 
                                icon={<WandIcon className="w-12 h-12 text-gray-500"/>} 
                                text="Your edited image will appear here" 
                            />
                        )}
                    </div>
                </div>
                
                 {error && (
                    <div className="fixed bottom-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg" role="alert">
                       <div className="flex justify-between items-center">
                         <p className="font-bold">Error</p>
                         <button onClick={() => setError(null)} className="ml-4 text-xl font-bold">&times;</button>
                       </div>
                        <p>{error}</p>
                    </div>
                )}
            </main>

            <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-4 sticky bottom-0">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)}
                            placeholder="Describe your edit or select a style below..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={!originalImage.dataUrl || isLoading}
                        />
                        <button
                            onClick={() => handleGenerate(prompt)}
                            disabled={!originalImage.dataUrl || !prompt || isLoading}
                            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            <WandIcon className="w-5 h-5"/>
                            Generate
                        </button>
                    </div>
                     <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2 text-center md:text-left">Artistic Styles</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                           {artisticStyles.map((style) => (
                               <button 
                                key={style.name} 
                                onClick={() => handleStyleSelect(style.prompt)} 
                                disabled={!originalImage.dataUrl || isLoading}
                                className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                               >
                                   {style.icon}
                                   {style.name}
                               </button>
                           ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
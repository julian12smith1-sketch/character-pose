import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import GeneratedImageDisplay from './components/GeneratedImageDisplay';
import ErrorAlert from './components/ErrorAlert';
import { generatePoseFromImage } from './services/geminiService';
import type { GeneratedContent } from './types';
import type { ImageData } from './services/geminiService';


interface ImageState {
  file: File | null;
  previewUrl: string | null;
}

const getImageAspectRatio = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.src = url;

        const gcd = (a: number, b: number): number => {
            return b === 0 ? a : gcd(b, a % b);
        };

        image.onload = () => {
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            const divisor = gcd(width, height);
            const ratio = `${width / divisor}:${height / divisor}`;
            URL.revokeObjectURL(url); // Clean up memory
            resolve(ratio);
        };

        image.onerror = (error) => {
            URL.revokeObjectURL(url); // Clean up memory
            console.error("Error loading image for aspect ratio calculation:", error);
            reject(new Error("Could not calculate image aspect ratio."));
        };
    });
};

const App: React.FC = () => {
  const [characterImage, setCharacterImage] = useState<ImageState>({ file: null, previewUrl: null });
  const [poseReferenceImage, setPoseReferenceImage] = useState<ImageState>({ file: null, previewUrl: null });
  const [additionalReferenceImages, setAdditionalReferenceImages] = useState<ImageState[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [quality, setQuality] = useState<string>('High');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const handleCharacterImageSelect = (file: File) => {
    setCharacterImage({
      file: file,
      previewUrl: URL.createObjectURL(file),
    });
  };
  
  const handlePoseReferenceImageSelect = (file: File) => {
    setPoseReferenceImage({
        file: file,
        previewUrl: URL.createObjectURL(file),
    });
  };
  
  const handleAddAdditionalReferenceImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImage: ImageState = {
        file: file,
        previewUrl: URL.createObjectURL(file),
      };
      setAdditionalReferenceImages(prev => [...prev, newImage]);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };
  
  const handleRemoveAdditionalReferenceImage = (indexToRemove: number) => {
    setAdditionalReferenceImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const fileToBase64 = (file: File): Promise<ImageData> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });

  const handleGenerate = useCallback(async () => {
    if (!characterImage.file) {
      setError("Please upload a character image to begin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      let determinedAspectRatio = '1:1'; // Default
      try {
        if (poseReferenceImage.file) {
            determinedAspectRatio = await getImageAspectRatio(poseReferenceImage.file);
        } else if (characterImage.file) {
            // Fallback to character image if no pose reference
            determinedAspectRatio = await getImageAspectRatio(characterImage.file);
        }
      } catch (ratioError) {
          console.warn("Could not determine aspect ratio automatically, falling back to 1:1.", ratioError);
          // The default '1:1' will be used.
      }
      
      const characterImageData = await fileToBase64(characterImage.file);
      
      const poseReferenceImageData = poseReferenceImage.file
        ? await fileToBase64(poseReferenceImage.file)
        : null;

      const additionalReferenceImagesData = await Promise.all(
        additionalReferenceImages
            .filter(imgState => imgState.file)
            .map(imgState => fileToBase64(imgState.file!))
      );
      
      const result = await generatePoseFromImage(
        characterImageData, 
        poseReferenceImageData,
        additionalReferenceImagesData,
        prompt, 
        numberOfImages,
        quality,
        determinedAspectRatio
      );
      setGeneratedContent(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [characterImage.file, poseReferenceImage.file, additionalReferenceImages, prompt, numberOfImages, quality]);
  
  const isGenerateDisabled = !characterImage.file;

  return (
    <div className="min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Inputs */}
          <div className="flex flex-col space-y-6">
            <ImageUploader 
              label="1. Upload Character Image"
              onImageSelect={handleCharacterImageSelect} 
              previewUrl={characterImage.previewUrl} 
            />

            <ImageUploader 
              label="2. Upload Pose Reference Image (Optional)"
              onImageSelect={handlePoseReferenceImageSelect} 
              previewUrl={poseReferenceImage.previewUrl} 
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">3. Add Additional Reference Images (Optional)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {additionalReferenceImages.map((image, index) => (
                    <div key={index} className="relative group">
                        <img src={image.previewUrl!} alt={`Reference ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                        <button 
                            onClick={() => handleRemoveAdditionalReferenceImage(index)}
                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
                <input
                  type="file"
                  ref={additionalFileInputRef}
                  onChange={handleAddAdditionalReferenceImage}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button 
                    onClick={() => additionalFileInputRef.current?.click()}
                    className="w-full h-24 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600 hover:border-sky-500 transition-colors flex flex-col items-center justify-center text-slate-400"
                    aria-label="Add additional reference image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs mt-1">Add Image</span>
                </button>
              </div>
            </div>

            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              numberOfImages={numberOfImages}
              setNumberOfImages={setNumberOfImages}
              quality={quality}
              setQuality={setQuality}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              isButtonDisabled={isGenerateDisabled}
            />
            {error && <ErrorAlert message={error} />}
          </div>

          {/* Right Column: Output */}
          <div className="lg:h-[calc(100vh-15rem)] min-h-[30rem]">
            <GeneratedImageDisplay content={generatedContent} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
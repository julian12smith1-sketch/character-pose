import React from 'react';
import Loader from './Loader';
import type { GeneratedContent } from '../types';

interface GeneratedImageDisplayProps {
  content: GeneratedContent[] | null;
  isLoading: boolean;
}

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ content, isLoading }) => {
  const Placeholder = () => (
    <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 3.104M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 font-semibold text-slate-400">Your generated images will appear here</p>
        <p className="text-sm">Upload an image and provide a prompt to begin.</p>
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-800/50 rounded-lg border-2 border-slate-700 flex items-center justify-center p-4 overflow-y-auto">
      {isLoading ? (
        <Loader />
      ) : content && content.length > 0 ? (
        <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.map((item, index) => (
            item.image && (
              <div key={index} className="group relative w-full h-full flex flex-col items-center justify-center space-y-2 bg-slate-900/50 p-2 rounded-lg">
                  <img src={item.image} alt={`Generated character pose ${index + 1}`} className="max-w-full max-h-[80%] object-contain rounded-md" />
                  {item.text && <p className="text-xs text-center text-slate-400 italic">"{item.text}"</p>}
                  <a 
                    href={item.image} 
                    download={`generated-pose-${index + 1}.png`} 
                    className="absolute bottom-2 right-2 bg-sky-600 hover:bg-sky-700 text-white font-bold p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Download Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
              </div>
            )
          ))}
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

export default GeneratedImageDisplay;

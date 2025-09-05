import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  numberOfImages: number;
  setNumberOfImages: (num: number) => void;
  quality: string;
  setQuality: (quality: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isButtonDisabled: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, numberOfImages, setNumberOfImages, quality, setQuality, onSubmit, isLoading, isButtonDisabled }) => {
  return (
    <div className="w-full space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">4. Describe the New Pose (Optional)</label>
        <textarea
          id="prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A knight in shining armor, kneeling and holding a glowing sword upwards."
          className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>
       <div>
        <label htmlFor="quality" className="block text-sm font-medium text-slate-300 mb-2">Image Quality</label>
        <select
          id="quality"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-slate-700"
        >
          <option value="Standard">Standard</option>
          <option value="High">High</option>
          <option value="Ultra">Ultra</option>
        </select>
      </div>
       <div>
        <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-300 mb-2">Number of Images</label>
        <select
          id="numberOfImages"
          value={numberOfImages}
          onChange={(e) => setNumberOfImages(Number(e.target.value))}
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-slate-700"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <button
        onClick={onSubmit}
        disabled={isButtonDisabled || isLoading}
        className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : 'Generate Pose'}
      </button>
    </div>
  );
};

export default PromptInput;
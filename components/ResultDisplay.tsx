import React, { useState } from 'react';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  onImageClick: (imageUrl: string) => void;
  prompts: { ko: string; en: string }[];
  currentPromptIndex: number;
  onPromptChange: (index: number) => void;
  isSidebarHovered: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-semibold text-gray-700">
      AI가 이미지를 생성하고 있습니다...
    </p>
    <p className="text-sm text-gray-500">잠시만 기다려주세요. 멋진 결과물로 보답하겠습니다.</p>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-800">결과 이미지</h3>
        <p className="mt-1 text-sm text-gray-600">이곳에 피팅 결과 이미지가 표시됩니다.</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  isLoading, 
  error, 
  generatedImage, 
  onImageClick,
  prompts,
  currentPromptIndex,
  onPromptChange,
  isSidebarHovered
}) => {
  const [isNavigatorHovered, setIsNavigatorHovered] = useState(false);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    const newIndex = (currentPromptIndex - 1 + prompts.length) % prompts.length;
    onPromptChange(newIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    const newIndex = (currentPromptIndex + 1) % prompts.length;
    onPromptChange(newIndex);
  };

  return (
    <div className="relative w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col p-4 flex-grow min-h-[450px] overflow-hidden">
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center"><p className="text-red-600 text-center font-medium">{error}</p></div>
      ) : generatedImage ? (
        <div 
          className="relative flex-grow w-full flex items-center justify-center cursor-pointer min-h-0"
          onClick={() => onImageClick(generatedImage)}
          role="button"
          aria-label="Enlarge generated image"
        >
          <div className="relative inline-block">
            <img
                src={generatedImage}
                alt={`Generated result: ${prompts[currentPromptIndex].ko}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            <div 
              className={`absolute bottom-4 right-4 w-fit flex flex-col-reverse gap-2 transition-opacity duration-300 ease-in-out ${isSidebarHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onMouseEnter={() => setIsNavigatorHovered(true)}
              onMouseLeave={() => setIsNavigatorHovered(false)}
            >
              {/* Buttons (first in DOM, will appear at bottom) */}
              <div>
                  <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-full p-1 shadow-lg w-full">
                      <button 
                        onClick={handlePrev} 
                        disabled={isLoading}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        aria-label="Previous prompt"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="text-sm font-semibold text-gray-800 text-center px-2 truncate">
                        {prompts[currentPromptIndex].ko}
                      </span>
                      <button 
                        onClick={handleNext} 
                        disabled={isLoading}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        aria-label="Next prompt"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                  </div>
              </div>
              
              {/* Prompt List (second in DOM, will appear on top) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isNavigatorHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white/40 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-gray-200/50">
                  <div className="flex flex-col gap-2">
                    {prompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); onPromptChange(index); }}
                        disabled={isLoading}
                        className={`p-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-center whitespace-nowrap ${
                          index === currentPromptIndex
                            ? 'bg-indigo-600/80 text-white shadow-md'
                            : 'bg-white/40 text-gray-800 hover:bg-white/60'
                        }`}
                      >
                        {prompt.ko}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center"><Placeholder /></div>
      )}
    </div>
  );
};
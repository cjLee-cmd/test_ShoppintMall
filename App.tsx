import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { virtualTryOn } from './services/geminiService';
import ShoppingMallSidebar from './components/ShoppingMallSidebar';

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const HelpIcon: React.FC = () => (
    <svg className="w-5 h-5 text-gray-500 hover:text-indigo-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const CloseIcon: React.FC = () => (
      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-3xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
            <h3 id="guide-modal-title" className="text-2xl font-bold text-gray-800">✨ 최상의 결과를 위한 이미지 가이드</h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close modal">
                <CloseIcon />
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="font-semibold text-lg text-gray-700 mb-3">👤 고객 사진</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start"><CheckIcon /><span><strong>조명:</strong> 밝고 균일한 조명, 그림자 최소화</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>포즈:</strong> 정면을 보고 똑바로 선 자세</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>배경:</strong> 깔끔하고 단색 배경</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>의상:</strong> 몸에 붙는 옷 착용 (부피가 큰 옷 X)</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>전신:</strong> 머리부터 발끝까지 모두 나오도록 촬영</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-gray-700 mb-3">👕 옷 사진</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start"><CheckIcon /><span><strong>조명:</strong> 밝고 균일한 조명, 그림자 최소화</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>배경:</strong> 깔끔하고 대조적인 단색 배경</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>형태:</strong> 옷을 평평하게 놓고 주름 없이 촬영</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>단독 촬영:</strong> 다른 물체 없이 옷만 나오도록 촬영</span></li>
                <li className="flex items-start"><CheckIcon /><span><strong>전체 모습:</strong> 옷의 전체 모습이 잘리지 않도록 촬영</span></li>
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
};

const shoppingMalls = [
  { name: 'ATTRANGS', url: 'https://attrangs.co.kr/' },
  { name: 'SHEIN', url: 'https://kr.shein.com/' },
  { name: 'sta1', url: 'https://www.sta1.com/' },
  { name: 'madam4060', url: 'https://madam4060.com/' },
  { name: 'JUSTONE', url: 'https://www.justone.co.kr/' },
];

const prompts = [
    { ko: '정면, 손은 허리에', en: 'Full frontal view, hands on hips' },
    { ko: '살짝 돌린 3/4 뷰', en: 'Slightly turned, 3/4 view' },
    { ko: '측면 프로필 뷰', en: 'Side profile view' },
    { ko: '공중 점프, 액션 샷', en: 'Jumping in the air, mid-action shot' },
    { ko: '카메라를 향해 걷기', en: 'Walking towards camera' },
    { ko: '벽에 기대기', en: 'Leaning against a wall' }
];

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [activeMall, setActiveMall] = useState<string | null>(shoppingMalls[0].url);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);

  const handleVirtualTryOn = useCallback(async (promptIndex: number = 0) => {
    if (!personImage || !clothingImage) {
      setError("고객 사진과 옷 사진을 모두 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPromptIndex(promptIndex);

    try {
      const resultImage = await virtualTryOn(
          personImage, 
          clothingImage,
          prompts[promptIndex].en
      );
      setGeneratedImage(`data:image/png;base64,${resultImage}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage]);
  
  const handlePromptChange = (newIndex: number) => {
    if (isLoading || newIndex === currentPromptIndex) return;
    handleVirtualTryOn(newIndex);
  };

  const isButtonDisabled = !personImage || !clothingImage || isLoading;

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
      <ShoppingMallSidebar 
        shoppingMalls={shoppingMalls}
        activeMall={activeMall}
        onMallChange={setActiveMall}
        onHoverChange={setIsSidebarHovered}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto flex flex-col flex-grow p-4 sm:p-6 lg:p-8">
          <header className="text-center mb-8 flex-shrink-0">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">가상 피팅 솔루션</h1>
            <p className="mt-2 text-lg text-gray-600">AI를 통해 원하는 옷을 가상으로 입어보세요.</p>
          </header>

          <main className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 flex flex-col flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="text-lg font-semibold text-gray-700">고객 사진</h3>
                  <button onClick={() => setIsGuideModalOpen(true)} className="ml-2" aria-label="Open image guide">
                    <HelpIcon />
                  </button>
                </div>
                <p className={`text-sm text-gray-500 transition-all duration-300 ease-in-out ${isSidebarHovered ? 'opacity-0 max-h-0 mb-0 invisible' : 'opacity-100 max-h-5 mb-3 visible'}`}>정면을 바라보는 전신 사진을 업로드하세요.</p>
                <ImageUploader
                  id="person-uploader"
                  onImageUpload={(base64) => setPersonImage(base64)}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">옷 정보</h3>
                <p className={`text-sm text-gray-500 transition-all duration-300 ease-in-out ${isSidebarHovered ? 'opacity-0 max-h-0 mb-0 invisible' : 'opacity-100 max-h-5 mb-3 visible'}`}>피팅해볼 옷 사진을 업로드하세요.</p>
                <ImageUploader
                  id="clothing-uploader"
                  onImageUpload={(base64) => setClothingImage(base64)}
                />
              </div>
            </div>

            <div className="flex flex-col flex-grow mt-8">
              <ResultDisplay
                isLoading={isLoading}
                error={error}
                generatedImage={generatedImage}
                onImageClick={handleImageClick}
                prompts={prompts}
                currentPromptIndex={currentPromptIndex}
                onPromptChange={handlePromptChange}
                isSidebarHovered={isSidebarHovered}
              />
              <div className="mt-6">
                <button
                  onClick={() => handleVirtualTryOn(0)}
                  disabled={isButtonDisabled}
                  className={`w-full text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isButtonDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading 
                    ? `AI 이미지 생성 중...` 
                    : '가상 피팅 시작'}
                </button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
              </div>
            </div>
          </main>

          <footer className="text-center mt-8 text-gray-500 text-sm flex-shrink-0">
              <p>Power Solution., Inc.</p>
          </footer>
        </div>
      </div>
      
        {selectedImage && (
            <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={closeModal}
                role="dialog"
                aria-modal="true"
            >
                <img
                    src={selectedImage}
                    alt="Generated result popup"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        )}

        {isGuideModalOpen && <GuideModal onClose={() => setIsGuideModalOpen(false)} />}
    </div>
  );
};

export default App;
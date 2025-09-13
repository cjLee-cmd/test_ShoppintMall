import React, { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
  id: string;
  onImageUpload: (base64: string | null, url?: string | null) => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload(base64String, null);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);
  
  const handleClick = () => {
    if (!preview && !showUrlInput) {
        fileInputRef.current?.click();
    }
  };

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageUpload(null, null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageUpload]);
  
  const handleUrlToDataUrl = useCallback((url: string) => {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    setError(null);

    fetch(proxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreview(base64String);
            onImageUpload(base64String, url);
            setError(null);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error fetching image from URL:', error);
        setError('이미지를 가져올 수 없습니다. URL을 확인하거나 다른 이미지를 시도해주세요.');
      });
  }, [onImageUpload]);

  const handlePasteFromClipboard = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http') || text.startsWith('data:'))) {
        handleUrlToDataUrl(text);
      } else {
        setError('클립보드에 유효한 이미지 주소가 없습니다.');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.message.includes('permission'))) {
        setError('클립보드 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
      } else {
        setError('클립보드를 읽는 데 실패했습니다.');
      }
    }
  }, [handleUrlToDataUrl]);

  const handleShowUrlInput = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowUrlInput(true);
  };
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(imageUrl.trim()) {
        handleUrlToDataUrl(imageUrl.trim());
    }
    setShowUrlInput(false);
    setImageUrl('');
  };
  
  const handleCancelUrlInput = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowUrlInput(false);
      setImageUrl('');
  };


  return (
    <div className="w-full">
      <div 
        onClick={handleClick}
        className={`relative w-full aspect-w-1 aspect-h-1 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300
          ${!preview && !showUrlInput ? 'cursor-pointer hover:border-indigo-500 hover:bg-indigo-50' : ''}
          ${preview ? 'border-solid border-indigo-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
      >
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <>
            <img src={preview} alt="Upload preview" className="object-contain w-full h-full rounded-lg" />
            <button 
              onClick={handleReset}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-110"
              aria-label="Remove image"
            >
              <TrashIcon />
            </button>
          </>
        ) : showUrlInput ? (
            <div className="p-4 w-full" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                    <label htmlFor={`${id}-image-url-input`} className="block text-sm font-medium text-gray-700">이미지 주소 붙여넣기:</label>
                    <input
                        id={`${id}-image-url-input`}
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://..."
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2 pt-1">
                        <button 
                            type="button" 
                            onClick={handleCancelUrlInput} 
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            가져오기
                        </button>
                    </div>
                </form>
            </div>
        ) : (
          <div className="text-center p-4">
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-600">
              클릭하여 이미지 업로드
            </p>
            {id === 'clothing-uploader' && (
                <div className="mt-2 flex flex-wrap justify-center items-center gap-2">
                    <button 
                        onClick={handleShowUrlInput} 
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        URL 입력
                    </button>
                    <span className="text-gray-400 text-sm">또는</span>
                    <button 
                        onClick={handlePasteFromClipboard} 
                        className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        붙여넣기
                    </button>
                </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
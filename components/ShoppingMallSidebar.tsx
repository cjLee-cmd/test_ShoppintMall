
import React, { useState } from 'react';

interface ShoppingMall {
    name: string;
    url: string;
}

interface ShoppingMallSidebarProps {
    shoppingMalls: ShoppingMall[];
    activeMall: string | null;
    onMallChange: (url: string | null) => void;
    onHoverChange: (isHovering: boolean) => void;
}

const ShoppingMallSidebar: React.FC<ShoppingMallSidebarProps> = ({ shoppingMalls, activeMall, onMallChange, onHoverChange }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMallClick = (url: string) => {
        onMallChange(activeMall === url ? null : url);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      onHoverChange(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      onHoverChange(false);
    };

  return (
    <aside 
      className={`bg-white shadow-lg flex-shrink-0 flex flex-col h-full transition-all duration-500 ease-in-out ${isHovered ? 'w-2/3' : 'w-1/3'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 tracking-wider text-center">Shopping Malls</h2>
      </div>
       <div className="p-4 border-b flex-shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {shoppingMalls.map((mall) => (
            <button
              key={mall.name}
              onClick={() => handleMallClick(mall.url)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                activeMall === mall.url
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {mall.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow w-full h-full bg-gray-50 overflow-hidden">
        {activeMall ? (
          <iframe
            key={activeMall}
            src={activeMall}
            title={`${shoppingMalls.find(m => m.url === activeMall)?.name} Shopping Mall`}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500 p-4">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-9 9h18" />
                </svg>
                <p className="mt-4 font-semibold">쇼핑몰을 선택하세요.</p>
                <p className="text-sm">원하는 쇼핑몰 버튼을 클릭하면 아래에 표시됩니다.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ShoppingMallSidebar;


import React from 'react';

interface ImagePlaceholderProps {
    onButtonClick?: () => void;
    icon: React.ReactNode;
    text: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ onButtonClick, icon, text }) => {
    const content = (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 h-full p-4">
            {icon}
            <p className="mt-4 text-lg">{text}</p>
        </div>
    );

    if (onButtonClick) {
        return (
            <button
                type="button"
                onClick={onButtonClick}
                className="w-full h-full flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
            >
                {content}
            </button>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            {content}
        </div>
    );
};

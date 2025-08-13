'use client';

interface TemplatePreviewProps {
  templateId: string;
  className?: string;
}

export default function TemplatePreview({ templateId, className = "" }: TemplatePreviewProps) {
  const getPreviewLayout = () => {
    switch (templateId) {
      case 'triangle':
        return (
          <div className={`relative w-16 h-16 ${className}`}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-300 rounded-sm"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 bg-blue-400 rounded-sm"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-sm"></div>
          </div>
        );
      case 'grid-4':
        return (
          <div className={`grid grid-cols-2 gap-1 w-16 h-16 ${className}`}>
            <div className="bg-blue-300 rounded-sm"></div>
            <div className="bg-blue-400 rounded-sm"></div>
            <div className="bg-blue-500 rounded-sm"></div>
            <div className="bg-blue-600 rounded-sm"></div>
          </div>
        );
      case 'grid-9':
        return (
          <div className={`grid grid-cols-3 gap-1 w-16 h-16 ${className}`}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className={`bg-blue-${300 + (i % 4) * 100} rounded-sm`}></div>
            ))}
          </div>
        );
      case 'horizontal':
        return (
          <div className={`flex gap-1 w-16 h-16 ${className}`}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`flex-1 bg-blue-${300 + (i % 4) * 100} rounded-sm`}></div>
            ))}
          </div>
        );
      case 'vertical':
        return (
          <div className={`flex flex-col gap-1 w-16 h-16 ${className}`}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`flex-1 bg-blue-${300 + (i % 4) * 100} rounded-sm`}></div>
            ))}
          </div>
        );
      default:
        return <div className={`w-16 h-16 bg-gray-300 rounded-sm ${className}`}></div>;
    }
  };

  return getPreviewLayout();
}
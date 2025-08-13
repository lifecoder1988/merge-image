'use client';

import { useState, useRef } from 'react';
import TemplatePreview from './TemplatePreview';
import { resizeImage, addImageBorder, downloadImage, compressImage } from '@/utils/imageUtils';

interface Template {
  id: string;
  name: string;
  description: string;
  maxImages: number;
  gridClass: string;
  preview: string;
}

const templates: Template[] = [
  {
    id: 'triangle',
    name: '品字形',
    description: '3张图片品字形排列',
    maxImages: 3,
    gridClass: 'grid-cols-2 grid-rows-2',
    preview: '△'
  },
  {
    id: 'grid-4',
    name: '四宫格',
    description: '4张图片方形排列',
    maxImages: 4,
    gridClass: 'grid-cols-2 grid-rows-2',
    preview: '⊞'
  },
  {
    id: 'grid-9',
    name: '九宫格',
    description: '9张图片3x3排列',
    maxImages: 9,
    gridClass: 'grid-cols-3 grid-rows-3',
    preview: '⊟'
  },
  {
    id: 'horizontal',
    name: '水平排列',
    description: '多张图片水平排列',
    maxImages: 6,
    gridClass: 'grid-cols-6 grid-rows-1',
    preview: '━'
  },
  {
    id: 'vertical',
    name: '垂直排列',
    description: '多张图片垂直排列',
    maxImages: 6,
    gridClass: 'grid-cols-1 grid-rows-6',
    preview: '┃'
  }
];

export default function ImageMerger() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBorders, setShowBorders] = useState(true);
  const [imageQuality, setImageQuality] = useState(0.9);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = selectedTemplate.maxImages - uploadedImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === filesToProcess) {
              setUploadedImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    setMergedImage(null);
  };

  const mergeImages = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const canvasSize = 1200; // 提高分辨率
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const images = await Promise.all(
      uploadedImages.map(src => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.src = src;
        });
      })
    );

    // 根据模板布局图片
    switch (selectedTemplate.id) {
      case 'triangle':
        drawTriangleLayout(ctx, images, canvasSize);
        break;
      case 'grid-4':
        drawGridLayout(ctx, images, canvasSize, 2, 2);
        break;
      case 'grid-9':
        drawGridLayout(ctx, images, canvasSize, 3, 3);
        break;
      case 'horizontal':
        drawHorizontalLayout(ctx, images, canvasSize);
        break;
      case 'vertical':
        drawVerticalLayout(ctx, images, canvasSize);
        break;
    }

    const mergedDataUrl = compressImage(canvas, imageQuality, 'image/jpeg');
    setMergedImage(mergedDataUrl);
    setIsProcessing(false);
  };

  const drawTriangleLayout = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], canvasSize: number) => {
    const gap = showBorders ? 4 : 0;
    const positions = [
      { x: canvasSize / 4 + gap/2, y: gap, width: canvasSize / 2 - gap, height: canvasSize / 2 - gap }, // 上
      { x: gap, y: canvasSize / 2 + gap/2, width: canvasSize / 2 - gap, height: canvasSize / 2 - gap }, // 左下
      { x: canvasSize / 2 + gap/2, y: canvasSize / 2 + gap/2, width: canvasSize / 2 - gap, height: canvasSize / 2 - gap } // 右下
    ];
    
    images.slice(0, 3).forEach((img, index) => {
      if (positions[index]) {
        const pos = positions[index];
        resizeImage(ctx, img, pos.width, pos.height, pos.x, pos.y);
        if (showBorders) {
          addImageBorder(ctx, pos.x, pos.y, pos.width, pos.height);
        }
      }
    });
  };

  const drawGridLayout = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], canvasSize: number, cols: number, rows: number) => {
    const gap = showBorders ? 4 : 0;
    const cellWidth = (canvasSize - gap * (cols - 1)) / cols;
    const cellHeight = (canvasSize - gap * (rows - 1)) / rows;
    
    images.slice(0, cols * rows).forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * (cellWidth + gap);
      const y = row * (cellHeight + gap);
      resizeImage(ctx, img, cellWidth, cellHeight, x, y);
      if (showBorders) {
        addImageBorder(ctx, x, y, cellWidth, cellHeight);
      }
    });
  };

  const drawHorizontalLayout = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], canvasSize: number) => {
    const gap = showBorders ? 4 : 0;
    const cellWidth = (canvasSize - gap * (images.length - 1)) / images.length;
    const cellHeight = canvasSize;
    
    images.forEach((img, index) => {
      const x = index * (cellWidth + gap);
      resizeImage(ctx, img, cellWidth, cellHeight, x, 0);
      if (showBorders) {
        addImageBorder(ctx, x, 0, cellWidth, cellHeight);
      }
    });
  };

  const drawVerticalLayout = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], canvasSize: number) => {
    const gap = showBorders ? 4 : 0;
    const cellWidth = canvasSize;
    const cellHeight = (canvasSize - gap * (images.length - 1)) / images.length;
    
    images.forEach((img, index) => {
      const y = index * (cellHeight + gap);
      resizeImage(ctx, img, cellWidth, cellHeight, 0, y);
      if (showBorders) {
        addImageBorder(ctx, 0, y, cellWidth, cellHeight);
      }
    });
  };

  const downloadMergedImage = () => {
    if (!mergedImage) return;
    downloadImage(mergedImage, `merged-${selectedTemplate.name}-${Date.now()}.jpg`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 模板选择 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">选择模板</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template);
                setUploadedImages([]);
                setMergedImage(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedTemplate.id === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="mb-2 flex justify-center">
                <TemplatePreview templateId={template.id} />
              </div>
              <div className="font-semibold text-gray-800 dark:text-white">{template.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 图片上传区域 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            上传图片 ({uploadedImages.length}/{selectedTemplate.maxImages})
          </h2>
          {uploadedImages.length > 0 && (
            <button
              onClick={clearAllImages}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              清空所有
            </button>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadedImages.length >= selectedTemplate.maxImages}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploadedImages.length >= selectedTemplate.maxImages ? '已达到最大数量' : '选择图片'}
          </button>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            支持 JPG、PNG、GIF 格式，最多 {selectedTemplate.maxImages} 张
          </p>
        </div>
      </div>

      {/* 已上传图片预览 */}
      {uploadedImages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">图片预览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedImages.map((src, index) => (
              <div key={index} className="relative group">
                <img
                  src={src}
                  alt={`上传的图片 ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 设置选项 */}
      {uploadedImages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">合并设置</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showBorders}
                    onChange={(e) => setShowBorders(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">显示图片边框</span>
                </label>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  图片质量: {Math.round(imageQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.1"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 合并按钮 */}
      {uploadedImages.length > 0 && (
        <div className="mb-8 text-center">
          <button
            onClick={mergeImages}
            disabled={isProcessing}
            className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isProcessing ? '合并中...' : '合并图片'}
          </button>
        </div>
      )}

      {/* 合并结果 */}
      {mergedImage && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">合并结果</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <img
              src={mergedImage}
              alt="合并后的图片"
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            />
            <div className="mt-4 text-center">
              <button
                onClick={downloadMergedImage}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的画布 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
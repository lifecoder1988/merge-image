'use client';

import ImageMerger from '@/components/ImageMerger';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            图片合并工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            选择多种模板，轻松合并您的图片。支持品字形、九宫格等多种布局方式。
          </p>
        </header>
        
        <ImageMerger />
      </div>
    </div>
  );
}

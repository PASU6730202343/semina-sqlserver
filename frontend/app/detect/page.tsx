import React from 'react';
import ObjectDetector from '@/components/ObjectDetector';

export const metadata = {
  title: 'AI Rice Detection | Smart Rice Marketplace',
  description: 'Upload images to detect and count rice grains using YOLOv8 AI.',
};

export default function DetectPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mb-4">
            AI-Powered Analysis
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">
            Smart Rice <span className="text-agri-green">Detection</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500 text-center">
            Use our advanced YOLOv8 artificial intelligence to analyze rice images. Upload a photo to instantly detect, count, and evaluate rice grains.
          </p>
        </div>
        
        <ObjectDetector />
        
      </div>
    </div>
  );
}

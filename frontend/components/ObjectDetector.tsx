"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { BACKEND_URL } from '@/lib/api';

interface Detection {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  confidence: number;
  class_name: string;
}

interface PredictionResult {
  success: boolean;
  detections: Detection[];
  total_objects: number;
  image_base64: string;
}

export default function ObjectDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Rice Object Detection</h2>
        <p className="text-slate-500">Upload an image of rice grains to detect and count them using AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${previewUrl ? 'border-agri-green bg-green-50/30' : 'border-slate-300 hover:border-agri-green hover:bg-slate-50'}
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            
            {previewUrl && !result ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
              </div>
            ) : result && result.image_base64 ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image src={result.image_base64} alt="Result" fill className="object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                <p className="text-slate-400 text-sm mt-1">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all
              ${!selectedFile || isAnalyzing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-agri-green hover:bg-green-700 shadow-md shadow-green-200'
              }
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Image...
              </span>
            ) : 'Analyze / Detect Rice'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="flex flex-col">
          <div className="bg-slate-50 rounded-xl p-6 h-full border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-3">Analysis Results</h3>
            
            {result ? (
              <div className="flex-1 flex flex-col">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Rice Detected:</span>
                  <span className="text-2xl font-extrabold text-agri-green">{result.total_objects}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-700 mb-3">Detection Details</h4>
                <div className="flex-1 overflow-auto bg-white rounded-lg border border-slate-100">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Confidence</th>
                        <th className="px-4 py-3 text-right">Box [x,y,w,h]</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.detections.map((det, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 font-medium text-slate-700">{idx + 1}</td>
                          <td className="px-4 py-2 text-agri-green font-medium capitalize">{det.class_name}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <span className="mr-2 text-slate-600">{(det.confidence * 100).toFixed(1)}%</span>
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-agri-green" 
                                  style={{ width: `${det.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-slate-400 text-xs text-right tabular-nums">
                            [{det.xmin}, {det.ymin}, {det.xmax - det.xmin}, {det.ymax - det.ymin}]
                          </td>
                        </tr>
                      ))}
                      
                      {result.detections.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            No objects detected in the image.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center px-4">
                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p>Upload an image and click analyze to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

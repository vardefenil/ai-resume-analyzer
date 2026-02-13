import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Your Resume</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Get instant AI-powered insights about your resume including skill analysis, 
          experience evaluation, and optimization recommendations.
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
      >
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-blue-100' : 'bg-slate-100'
          }`}>
            <Upload className={`w-8 h-8 transition-colors ${
              isDragging ? 'text-blue-600' : 'text-slate-500'
            }`} />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
          </h3>
          
          <p className="text-slate-600 mb-6">
            or click to browse your files
          </p>
          
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Choose File
          </button>
          
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              DOCX
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              TXT
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-semibold text-slate-900 mb-3">What you'll get:</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">📊</span>
            </div>
            <p className="text-sm font-medium text-slate-700">Skills Analysis</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">🎯</span>
            </div>
            <p className="text-sm font-medium text-slate-700">Keyword Matching</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">📈</span>
            </div>
            <p className="text-sm font-medium text-slate-700">Overall Score</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 font-bold">💡</span>
            </div>
            <p className="text-sm font-medium text-slate-700">Recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
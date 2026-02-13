import React from 'react';
import { Keywords } from '../types/analytics';
import { CheckCircle, XCircle, Target } from 'lucide-react';

interface KeywordAnalysisProps {
  keywords: Keywords;
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ keywords }) => {
  return (
    <div className="space-y-6">
      {/* Score Circle */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgb(226 232 240)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgb(59 130 246)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${keywords.score * 2.827} 282.7`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900">{keywords.score}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mt-2">
          <Target className="w-4 h-4 text-slate-500 mr-1" />
          <span className="text-sm text-slate-600">Keyword Match Score</span>
        </div>
      </div>

      {/* Matched Keywords */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-slate-900">Matched Keywords</h4>
          <span className="text-sm text-slate-500">({keywords.matched.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.matched.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Keywords */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-medium text-slate-900">Missing Keywords</h4>
          <span className="text-sm text-slate-500">({keywords.missing.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.missing.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Consider adding the missing keywords to improve your resume's 
          relevance for target positions.
        </p>
      </div>
    </div>
  );
};

export default KeywordAnalysis;
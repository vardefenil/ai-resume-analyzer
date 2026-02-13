import React from 'react';
import { FileText, Star, Trash2, Eye, Calendar, Award } from 'lucide-react';
import { AnalyticsData } from '../types/analytics';

interface ResumeListProps {
  resumes: AnalyticsData[];
  onSelectResume: (resume: AnalyticsData) => void;
  onDeleteResume: (resumeId: string) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({ resumes, onSelectResume, onDeleteResume }) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-green-700 bg-green-100 border-green-200';
      case 'Good': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'Average': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Needs Improvement': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Poor': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🏆', color: 'text-yellow-700 bg-yellow-100 border-yellow-200' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-700 bg-gray-100 border-gray-200' };
    if (rank === 3) return { icon: '🥉', color: 'text-orange-700 bg-orange-100 border-orange-200' };
    return { icon: `#${rank}`, color: 'text-slate-700 bg-slate-100 border-slate-200' };
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No resumes uploaded yet</h3>
        <p className="text-slate-600">Upload your first resume to get started with AI analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">My Resumes</h2>
        <div className="text-sm text-slate-600">
          {resumes.length} resume{resumes.length !== 1 ? 's' : ''} • Sorted by score
        </div>
      </div>

      <div className="grid gap-6">
        {resumes.map((resume) => {
          const rankBadge = getRankBadge(resume.rank || 0);
          
          return (
            <div
              key={resume.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${rankBadge.color}`}>
                    {rankBadge.icon}
                  </div>
                  
                  {/* Resume Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {resume.fileName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRatingColor(resume.rating)}`}>
                        {resume.rating}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{resume.overallScore}% Score</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{resume.skills.length} Skills</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{resume.uploadDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${resume.overallScore}%` }}
                      ></div>
                    </div>
                    
                    {/* Top Skills */}
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {resume.skills.length > 4 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">
                          +{resume.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onSelectResume(resume)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Analysis"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteResume(resume.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeList;
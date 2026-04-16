import React from 'react';
import { Trophy, TrendingDown, BarChart3, Users, Star, Award, Target } from 'lucide-react';
import { ComparisonResult } from '../types/analytics';

interface ResumeComparisonProps {
  data: ComparisonResult;
}

const ResumeComparison: React.FC<ResumeComparisonProps> = ({ data }) => {
  const { bestResume, worstResume, averageScore, totalResumes, rankings } = data;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 80) return 'bg-blue-100 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Resume Comparison</h2>
        <p className="text-slate-600">Comprehensive analysis of {totalResumes} resumes</p>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalResumes}</span>
          </div>
          <h3 className="font-medium text-slate-900">Total Resumes</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{averageScore}%</span>
          </div>
          <h3 className="font-medium text-slate-900">Average Score</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{bestResume.overallScore}%</span>
          </div>
          <h3 className="font-medium text-slate-900">Highest Score</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{worstResume.overallScore}%</span>
          </div>
          <h3 className="font-medium text-slate-900">Lowest Score</h3>
        </div>
      </div>

      {/* Best vs Worst Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Best Resume */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-900">Best Performing Resume</h3>
              <p className="text-green-700">Rank #1</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-900 mb-2">{bestResume.fileName}</h4>
              <div className="flex items-center space-x-4 text-sm text-green-700">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{bestResume.overallScore}% Score</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{bestResume.rating}</span>
                </span>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-green-900 mb-2">Top Strengths:</h5>
              <ul className="space-y-1">
                {bestResume.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-green-900 mb-2">Top Skills:</h5>
              <div className="flex flex-wrap gap-2">
                {bestResume.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md border border-green-200"
                  >
                    {skill.name} ({skill.level}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Worst Resume */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-900">Needs Most Improvement</h3>
              <p className="text-red-700">Rank #{rankings.length}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-900 mb-2">{worstResume.fileName}</h4>
              <div className="flex items-center space-x-4 text-sm text-red-700">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{worstResume.overallScore}% Score</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{worstResume.rating}</span>
                </span>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-red-900 mb-2">Key Recommendations:</h5>
              <ul className="space-y-1">
                {worstResume.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-red-800">
                    <span className="text-red-600 mt-0.5">💡</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-red-900 mb-2">Missing Keywords:</h5>
              <div className="flex flex-wrap gap-2">
                {worstResume.keywords.missing.slice(0, 4).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md border border-red-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Complete Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Resume</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Score</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Skills</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Keywords</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((resume, index) => (
                <tr key={resume.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      <span className="font-medium">#{resume.rank}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 truncate max-w-xs">
                      {resume.fileName}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getScoreColor(resume.overallScore)}`}>
                        {resume.overallScore}%
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${resume.overallScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreBg(resume.overallScore)}`}>
                      {resume.rating}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {resume.skills.length} skills
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{resume.keywords.score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Performance Gap</h4>
            <p className="text-blue-800 text-sm">
              There's a {bestResume.overallScore - worstResume.overallScore}% difference between 
              your best and worst performing resumes. Focus on applying insights from your top 
              performer to improve others.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Improvement Opportunity</h4>
            <p className="text-blue-800 text-sm">
              {rankings.filter(r => r.overallScore < averageScore).length} resume(s) are below 
              average. Consider incorporating more relevant keywords and quantifiable achievements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeComparison;
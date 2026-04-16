import React from "react";
import {
  Download,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Trophy,
} from "lucide-react";
import { AnalyticsData } from "../types/analytics";
import SkillsChart from "./SkillsChart";
import ExperienceTimeline from "./ExperienceTimeline";
import ScoreCard from "./ScoreCard";
import KeywordAnalysis from "./KeywordAnalysis";

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  // Rating color styling
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "text-green-700 bg-green-100 border-green-200";
      case "Good":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "Average":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "Needs Improvement":
        return "text-orange-700 bg-orange-100 border-orange-200";
      case "Poor":
        return "text-red-700 bg-red-100 border-red-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  // Download JSON report
  const handleDownloadReport = () => {
    const reportData = {
      ...data,
      summary: `Resume Analysis Report for ${data.fileName}`,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fileName.split(".")[0]}_analysis_report.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Analysis Results
              </h2>

              {data.rank && data.rank <= 3 && (
                <div className="flex items-center space-x-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">
                    Rank #{data.rank}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-slate-600">Resume: {data.fileName}</p>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(
                  data.rating
                )}`}
              >
                {data.rating}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          title="Overall Score"
          score={data.overallScore || 0}
          icon={<Star className="w-6 h-6" />}
          color="blue"
        />

        <ScoreCard
          title="Skills Matched"
          score={
            data.keywords.matched.length +
              data.keywords.missing.length >
            0
              ? Math.round(
                  (data.keywords.matched.length /
                    (data.keywords.matched.length +
                      data.keywords.missing.length)) *
                    100
                )
              : 0
          }
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />

        <ScoreCard
          title="Experience Level"
          score={Math.min((data.experience?.length || 0) * 25, 100)}
          icon={<Award className="w-6 h-6" />}
          color="purple"
        />

        <ScoreCard
          title="Education Score"
          score={data.education?.length ? 80 : 0}
          icon={<BookOpen className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Skills Analysis
        </h3>

        <SkillsChart skills={data.skills || []} />
      </div>

      {/* Experience + Keywords */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Professional Experience
          </h3>

          <ExperienceTimeline experience={data.experience || []} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Keyword Analysis
          </h3>

          <KeywordAnalysis keywords={data.keywords} />
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Education
        </h3>

        {data.education && data.education.length > 0 ? (
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4"
              >
                <h4 className="font-semibold text-slate-900">
                  {edu.degree}
                </h4>

                <p className="text-slate-700">
                  {edu.institution}
                </p>

                <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                  <span>{edu.year}</span>

                  {edu.gpa && (
                    <span className="font-medium">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">
            No education detected in resume
          </p>
        )}
      </div>

      {/* Strengths + Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-xl font-semibold text-green-900 mb-4">
            Strengths
          </h3>

          <ul className="space-y-2">
            {data.strengths?.map((strength, index) => (
              <li key={index} className="flex space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">
                  {strength}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-4">
            Recommendations
          </h3>

          <ul className="space-y-2">
            {data.recommendations?.map((rec, index) => (
              <li key={index} className="flex space-x-2">
                <span className="text-amber-600">💡</span>
                <span className="text-amber-800">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
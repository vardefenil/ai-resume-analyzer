import { useState } from "react";
import FileUpload from "./FileUpload";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { AnalyticsData } from "../types/analytics";

const Dashboard = () => {
  const [analysisData, setAnalysisData] = useState<AnalyticsData | null>(null);

  const handleBackendResponse = (backendData: any, file: File) => {

    const getRating = (score: number) => {
      if (score >= 90) return "Excellent";
      if (score >= 75) return "Good";
      if (score >= 60) return "Average";
      if (score >= 40) return "Needs Improvement";
      return "Poor";
    };

    const converted: AnalyticsData = {

      id: Date.now().toString(),

      fileName: file.name,

      overallScore: backendData.final_score || 0,

      rating: getRating(backendData.final_score || 0),

      rank: 1,

      skills: (backendData.skills_found || []).map((skill: string) => ({
        name: skill,
        level: Math.floor(Math.random() * 40) + 60,
        category: "Programming"
      })),

      experience: [
        {
          role: "Detected Experience",
          company: "Resume",
          duration: backendData.experience_score + "%",
          achievements: []
        }
      ],

      // FIXED EDUCATION EXTRACTION
      education: (backendData.education || []).map((edu: any) => ({
        degree: edu.degree || "Degree Detected",
        institution: edu.institution || "Institution",
        year: edu.year || "N/A",
        gpa: ""
      })),

      keywords: {
        matched: backendData.skills_found || [],
        missing: backendData.skills_missing || [],
        score: backendData.job_match_score || 0
      },

      strengths:
        backendData.skills_found?.map(
          (s: string) => `Strong knowledge of ${s}`
        ) || [],

      recommendations:
        backendData.suggestions ||
        backendData.skills_missing?.map(
          (s: string) => `Consider learning ${s}`
        ) || []
    };

    setAnalysisData(converted);
  };

  return (
    <div className="p-6">

      {!analysisData && (
        <FileUpload onAnalysisComplete={handleBackendResponse} />
      )}

      {analysisData && (
        <AnalyticsDashboard data={analysisData} />
      )}

    </div>
  );
};

export default Dashboard;

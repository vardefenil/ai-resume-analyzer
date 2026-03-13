import { useState } from "react";
import FileUpload from "./FileUpload";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { AnalyticsData } from "../types/analytics";

const Dashboard = () => {

  const [analysisData, setAnalysisData] = useState<AnalyticsData | null>(null);

  const handleBackendResponse = (backendData: any, file: File) => {

    console.log("BACKEND RESPONSE:", backendData);

    const getRating = (score: number) => {
      if (score >= 90) return "Excellent";
      if (score >= 75) return "Good";
      if (score >= 60) return "Average";
      if (score >= 40) return "Needs Improvement";
      return "Poor";
    };

    // ✅ Safely extract education from backend
    let educationData: any[] = [];

    if (Array.isArray(backendData?.education)) {
      educationData = backendData.education;
    } else if (Array.isArray(backendData?.data?.education)) {
      educationData = backendData.data.education;
    }

    // ✅ Remove duplicate education entries
    educationData = educationData.filter(
      (edu, index, self) =>
        index ===
        self.findIndex(
          (e) =>
            e.degree === edu.degree &&
            e.institution === edu.institution &&
            e.year === edu.year
        )
    );

    console.log("EDUCATION DATA:", educationData);

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
          duration: (backendData.experience_score || 0) + "%",
          achievements: []
        }
      ],

      // ✅ Education mapping
      education: educationData.map((edu: any) => ({
        degree: edu?.degree || "Degree Detected",
        institution: edu?.institution || "Institution Detected",
        year: edu?.year || "N/A",
        gpa: ""
      })),

      keywords: {
        matched: backendData.skills_found || [],
        missing: backendData.skills_missing || [],
        score: backendData.job_match_score || 0
      },

      strengths: (backendData.skills_found || []).map(
        (s: string) => `Strong knowledge of ${s}`
      ),

      recommendations:
        backendData.suggestions ||
        (backendData.skills_missing || []).map(
          (s: string) => `Consider learning ${s}`
        )
    };

    console.log("CONVERTED DATA:", converted);

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

import { useState } from "react";

import FileUpload from "./components/FileUpload";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import ResumeComparison from "./components/ResumeComparison";
import ResumeList from "./components/ResumeList";

import { AnalyticsData, ComparisonResult } from "./types/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/Tabs";

function App() {

  const [resumeList, setResumeList] = useState<AnalyticsData[]>([]);
  const [selectedResume, setSelectedResume] = useState<AnalyticsData | null>(null);
  
  const [activeTab, setActiveTab] = useState("upload");



  // 🔹 BACKEND RESPONSE HANDLER
  const handleBackendResponse = (backendData: any, file: File) => {

    const resumeId =
      "resume_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

    const getRating = (
      score: number
    ): "Excellent" | "Good" | "Average" | "Needs Improvement" | "Poor" => {

      if (score >= 90) return "Excellent";
      if (score >= 80) return "Good";
      if (score >= 70) return "Average";
      if (score >= 60) return "Needs Improvement";

      return "Poor";
    };

    const newResume: AnalyticsData = {

      id: resumeId,

      fileName: file.name,

      overallScore: backendData.final_score || 0,

      rating: getRating(backendData.final_score || 0),

      skills:
        backendData.skills_found?.map((skill: string) => ({
          name: skill,
          level: Math.floor(Math.random() * 40) + 60
        })) || [],

      experience: [
        {
          role: "Detected Experience",
          company: "Resume",
          duration: backendData.experience_score + "%",
          achievements: []
        }
      ],

      education: [],

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
        ) ||
        []

    };

    const updatedList = [...resumeList, newResume];

    const rankedList = updatedList
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((resume, index) => ({
        ...resume,
        rank: index + 1
      }));

    setResumeList(rankedList);
    setSelectedResume(newResume);
    setActiveTab("analysis");
  };



  const handleSelectResume = (resume: AnalyticsData) => {

    setSelectedResume(resume);

    setActiveTab("analysis");

  };



  const handleDeleteResume = (resumeId: string) => {

    const updatedList = resumeList.filter(
      (resume) => resume.id !== resumeId
    );

    const rankedList = updatedList
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((resume, index) => ({
        ...resume,
        rank: index + 1
      }));

    setResumeList(rankedList);

    if (selectedResume?.id === resumeId) {

      setSelectedResume(null);

      setActiveTab("upload");

    }

  };



  const getComparisonData = (): ComparisonResult | null => {

    if (resumeList.length < 2) return null;

    const sortedResumes = [...resumeList].sort(
      (a, b) => b.overallScore - a.overallScore
    );

    const averageScore =
      resumeList.reduce((sum, r) => sum + r.overallScore, 0) /
      resumeList.length;

    return {

      bestResume: sortedResumes[0],

      worstResume: sortedResumes[sortedResumes.length - 1],

      averageScore: Math.round(averageScore),

      totalResumes: resumeList.length,

      rankings: sortedResumes

    };

  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      <header className="bg-white shadow-sm border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Resume Analytics
              </h1>

              <p className="text-slate-600 mt-1">
                AI-powered resume analysis and optimization
              </p>

            </div>

            <div className="flex items-center space-x-4">

              {resumeList.length > 0 && (

                <div className="text-sm text-slate-600">

                  {resumeList.length} resume
                  {resumeList.length !== 1 ? "s" : ""} analyzed

                </div>

              )}

              <button
                onClick={() => setActiveTab("upload")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >

                Upload Resume

              </button>

            </div>

          </div>

        </div>

      </header>



      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Tabs value={activeTab} onValueChange={setActiveTab}>

          <TabsList className="grid w-full grid-cols-4 mb-8">

            <TabsTrigger value="upload">Upload</TabsTrigger>

            <TabsTrigger value="list" disabled={resumeList.length === 0}>
              My Resumes ({resumeList.length})
            </TabsTrigger>

            <TabsTrigger value="comparison" disabled={resumeList.length < 2}>
              Compare
            </TabsTrigger>

            <TabsTrigger value="analysis" disabled={!selectedResume}>
              Analysis
            </TabsTrigger>

          </TabsList>



          <TabsContent value="upload">

            <FileUpload onAnalysisComplete={handleBackendResponse} />

          </TabsContent>



          <TabsContent value="list">

            <ResumeList
              resumes={resumeList}
              onSelectResume={handleSelectResume}
              onDeleteResume={handleDeleteResume}
            />

          </TabsContent>



          <TabsContent value="comparison">

            {getComparisonData() && (

              <ResumeComparison data={getComparisonData()!} />

            )}

          </TabsContent>



          <TabsContent value="analysis">

            {selectedResume && (

              <AnalyticsDashboard data={selectedResume} />

            )}

          </TabsContent>



        </Tabs>

      </main>

    </div>

  );

}

export default App;

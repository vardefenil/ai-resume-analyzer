import { useState } from 'react';

import FileUpload from './components/FileUpload';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ResumeComparison from './components/ResumeComparison';
import ResumeList from './components/ResumeList';
import { AnalyticsData, ComparisonResult } from './types/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/Tabs';

function App() {
  const [resumeList, setResumeList] = useState<AnalyticsData[]>([]);
  const [selectedResume, setSelectedResume] = useState<AnalyticsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const overallScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    
    const getRating = (score: number): 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor' => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Good';
      if (score >= 70) return 'Average';
      if (score >= 60) return 'Needs Improvement';
      return 'Poor';
    };
    
    // Mock analytics data - in real app, this would come from AI service
    const mockData: AnalyticsData = {
      id: resumeId,
      fileName: file.name,
      overallScore,
      rating: getRating(overallScore),
      uploadDate: new Date(),
      skills: [
        { name: 'JavaScript', level: 90, category: 'Programming' },
        { name: 'React', level: 85, category: 'Frontend' },
        { name: 'Node.js', level: 80, category: 'Backend' },
        { name: 'Python', level: 75, category: 'Programming' },
        { name: 'Machine Learning', level: 70, category: 'AI/ML' },
        { name: 'AWS', level: 65, category: 'Cloud' },
        { name: 'Docker', level: 60, category: 'DevOps' },
        { name: 'MongoDB', level: 70, category: 'Database' }
      ].map(skill => ({ ...skill, level: Math.max(30, skill.level + Math.floor(Math.random() * 20) - 10) })),
      experience: [
        {
          role: 'Senior Frontend Developer',
          company: 'Tech Innovation Inc.',
          duration: '2022 - Present',
          achievements: [
            'Led development of React-based dashboard serving 50K+ users',
            'Improved application performance by 40%',
            'Mentored 3 junior developers'
          ]
        },
        {
          role: 'Full Stack Developer',
          company: 'StartupXYZ',
          duration: '2020 - 2022',
          achievements: [
            'Built scalable backend APIs using Node.js',
            'Implemented real-time features with WebSocket',
            'Reduced server costs by 30% through optimization'
          ]
        },
        {
          role: 'Junior Developer',
          company: 'DevCorp',
          duration: '2019 - 2020',
          achievements: [
            'Developed responsive web applications',
            'Collaborated with design team on UI/UX',
            'Maintained 99% code coverage in testing'
          ]
        }
      ],
      education: [
        {
          degree: 'Master of Science in Computer Science',
          institution: 'Stanford University',
          year: '2019',
          gpa: '3.8/4.0'
        },
        {
          degree: 'Bachelor of Science in Software Engineering',
          institution: 'UC Berkeley',
          year: '2017',
          gpa: '3.6/4.0'
        }
      ],
      keywords: {
        matched: ['React', 'JavaScript', 'Node.js', 'AWS', 'Agile', 'Git'],
        missing: ['Kubernetes', 'GraphQL', 'TypeScript', 'CI/CD'],
        score: 75
      },
      strengths: [
        'Strong technical leadership experience',
        'Proven track record in performance optimization',
        'Excellent educational background',
        'Diverse technology stack experience'
      ],
      recommendations: [
        'Add TypeScript to highlight modern JavaScript skills',
        'Include more specific metrics and KPIs in achievements',
        'Consider adding certifications in cloud technologies',
        'Expand on leadership and team management experience'
      ]
    };
    
    const updatedList = [...resumeList, mockData];
    const rankedList = updatedList
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((resume, index) => ({ ...resume, rank: index + 1 }));
    
    setResumeList(rankedList);
    setSelectedResume(mockData);
    setIsAnalyzing(false);
    setActiveTab('analysis');
  };

  const handleSelectResume = (resume: AnalyticsData) => {
    setSelectedResume(resume);
    setActiveTab('analysis');
  };

  const handleDeleteResume = (resumeId: string) => {
    const updatedList = resumeList.filter(resume => resume.id !== resumeId);
    const rankedList = updatedList
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((resume, index) => ({ ...resume, rank: index + 1 }));
    
    setResumeList(rankedList);
    if (selectedResume?.id === resumeId) {
      setSelectedResume(null);
      setActiveTab('upload');
    }
  };

  const getComparisonData = (): ComparisonResult | null => {
    if (resumeList.length < 2) return null;
    
    const sortedResumes = [...resumeList].sort((a, b) => b.overallScore - a.overallScore);
    const averageScore = resumeList.reduce((sum, resume) => sum + resume.overallScore, 0) / resumeList.length;
    
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
              <h1 className="text-3xl font-bold text-slate-900">Resume Analytics</h1>
              <p className="text-slate-600 mt-1">AI-powered resume analysis and optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              {resumeList.length > 0 && (
                <div className="text-sm text-slate-600">
                  {resumeList.length} resume{resumeList.length !== 1 ? 's' : ''} analyzed
                </div>
              )}
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Analyzing Your Resume</h3>
            <p className="text-slate-600">Our AI is extracting insights from your resume...</p>
          </div>
        )}
        
        {!isAnalyzing && (
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
              <FileUpload onFileUpload={handleFileUpload} />
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
        )}
      </main>
    </div>
  );
}

export default App;
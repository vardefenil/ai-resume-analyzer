export interface Skill {
  name: string
  level: number
  category?: string
}

export interface Experience {
  role: string
  company: string
  duration: string
  achievements: string[]
}

export interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

export interface Keywords {
  matched: string[]
  missing: string[]
  score: number
}

export interface AnalyticsData {
  id?: string
  fileName: string
  overallScore: number
  rating: "Excellent" | "Good" | "Average" | "Needs Improvement" | "Poor"
  rank?: number

  skills: Skill[]

  experience: Experience[]

  education: Education[]

  keywords: Keywords

  strengths: string[]

  recommendations: string[]
}

export interface ComparisonResult {
  bestResume: AnalyticsData
  worstResume: AnalyticsData
  averageScore: number
  totalResumes: number
  rankings: AnalyticsData[]
}

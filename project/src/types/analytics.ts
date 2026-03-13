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

/* Optional future feature */
export interface Project {
  title: string
  description?: string
  technologies?: string[]
}

/* Optional future feature */
export interface Certification {
  name: string
  issuer?: string
  year?: string
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

  /* Optional extensions for future improvements */

  projects?: Project[]

  certifications?: Certification[]
}

export interface ComparisonResult {
  bestResume: AnalyticsData

  worstResume: AnalyticsData

  averageScore: number

  totalResumes: number

  rankings: AnalyticsData[]
}

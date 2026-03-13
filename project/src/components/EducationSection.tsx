import { AnalyticsData } from "../types/analytics";

interface EducationSectionProps {
  education: AnalyticsData["education"];
}

export default function EducationSection({ education }: EducationSectionProps) {
  if (!education || education.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Education</h2>
        <p className="text-slate-600 italic">No education detected in resume</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Education</h2>
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
            <p className="text-slate-600">{edu.institution}</p>
            <div className="flex justify-between text-sm text-slate-500 mt-2">
              <span>{edu.year}</span>
              {edu.gpa && <span>GPA: {edu.gpa}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
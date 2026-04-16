import React from 'react';
import { Experience } from '../types/analytics';
import { Briefcase } from 'lucide-react';

interface ExperienceTimelineProps {
  experience: Experience[];
}

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ experience }) => {
  return (
    <div className="space-y-6">
      {experience.map((exp, index) => (
        <div key={index} className="relative">
          {/* Timeline line */}
          {index < experience.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-full bg-slate-200"></div>
          )}
          
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                <p className="text-slate-700">{exp.company}</p>
                <p className="text-sm text-slate-500">{exp.duration}</p>
              </div>
              
              <div className="space-y-1">
                {exp.achievements.map((achievement, achievementIndex) => (
                  <div key={achievementIndex} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1.5 flex-shrink-0">•</span>
                    <span className="text-sm text-slate-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline;
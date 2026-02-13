import React from 'react';
import { Skill } from '../types/analytics';

interface SkillsChartProps {
  skills: Skill[];
}

const SkillsChart: React.FC<SkillsChartProps> = ({ skills }) => {
  const categories = [...new Set(skills.map(skill => skill.category))];
  const categoryColors = {
    'Programming': 'bg-blue-500',
    'Frontend': 'bg-green-500',
    'Backend': 'bg-purple-500',
    'Database': 'bg-red-500',
    'Cloud': 'bg-yellow-500',
    'DevOps': 'bg-indigo-500',
    'AI/ML': 'bg-pink-500'
  };

  return (
    <div>
      {/* Categories Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(category => (
          <div key={category} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
            <span className="text-sm text-slate-600">{category}</span>
          </div>
        ))}
      </div>

      {/* Skills Bars */}
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-slate-900">{skill.name}</span>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {skill.category}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700">{skill.level}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  categoryColors[skill.category as keyof typeof categoryColors] || 'bg-gray-500'
                }`}
                style={{ width: `${skill.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsChart;
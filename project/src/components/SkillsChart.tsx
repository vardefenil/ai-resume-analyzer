import React from "react"

interface SkillsChartProps {
  skills: any[]
}

const SkillsChart: React.FC<SkillsChartProps> = ({ skills }) => {

  if (!skills || skills.length === 0) {
    return <p className="text-gray-500">No skills detected</p>
  }

  return (
    <div className="space-y-4">

      {skills.map((skill, index) => {

        const name = skill.name || skill
        const score = skill.level || Math.floor(60 + Math.random() * 40)

        return (
          <div key={index}>

            <div className="flex justify-between text-sm mb-1">

              <span className="font-medium text-slate-700">
                {name}
              </span>

              <span>{score}%</span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">

              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${score}%` }}
              />

            </div>

          </div>
        )

      })}

    </div>
  )
}

export default SkillsChart

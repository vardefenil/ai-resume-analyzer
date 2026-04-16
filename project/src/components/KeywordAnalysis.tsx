import React from "react"
import { Keywords } from "../types/analytics"

interface KeywordAnalysisProps {
  keywords: Keywords
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ keywords }) => {

  return (

    <div className="space-y-6">

      {/* Matched Keywords */}

      <div>

        <h4 className="text-green-700 font-semibold mb-3">
          Matched Keywords
        </h4>

        <div className="flex flex-wrap gap-2">

          {keywords.matched.map((word, index) => (

            <span
              key={index}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
            >
              {word}
            </span>

          ))}

        </div>

      </div>

      {/* Missing Keywords */}

      <div>

        <h4 className="text-red-700 font-semibold mb-3">
          Missing Keywords
        </h4>

        <div className="flex flex-wrap gap-2">

          {keywords.missing.map((word, index) => (

            <span
              key={index}
              className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
            >
              {word}
            </span>

          ))}

        </div>

      </div>

      {/* Score */}

      <div className="mt-4">

        <p className="text-sm text-slate-600">
          Keyword Match Score
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${keywords.score}%` }}
          />

        </div>

        <p className="text-sm mt-1">{keywords.score}%</p>

      </div>

    </div>

  )

}

export default KeywordAnalysis

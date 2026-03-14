import { useEffect, useState } from "react";
import { Upload, Users, TrendingUp, Briefcase, Star, Zap } from "lucide-react";

interface StatsData {
  total_uploads: number;
  total_logins: number;
  uploads_by_role: { role: string; count: number }[];
  avg_final_score: number;
  avg_job_match_score: number;
  avg_experience_score: number;
}

export default function StatsPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load stats. Make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">{error}</div>
    );
  }

  const topCards = [
    {
      label: "Total Resume Uploads",
      value: stats!.total_uploads,
      icon: <Upload size={22} />,
      color: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "Registered Users / Logins",
      value: stats!.total_logins,
      icon: <Users size={22} />,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Avg. Final Score",
      value: stats!.avg_final_score + "%",
      icon: <Star size={22} />,
      color: "from-amber-500 to-yellow-400",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Avg. Job Match Score",
      value: stats!.avg_job_match_score + "%",
      icon: <TrendingUp size={22} />,
      color: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "Avg. Experience Score",
      value: stats!.avg_experience_score + "%",
      icon: <Zap size={22} />,
      color: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  const maxRoleCount = Math.max(
    ...stats!.uploads_by_role.map((r) => r.count),
    1
  );

  return (
    <div className="space-y-8">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {topCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color} text-white`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Uploads by Job Role ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase size={18} className="text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Uploads by Job Role
          </h2>
        </div>

        {stats!.uploads_by_role.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No uploads yet.
          </p>
        ) : (
          <div className="space-y-4">
            {stats!.uploads_by_role
              .sort((a, b) => b.count - a.count)
              .map((row) => (
                <div key={row.role} className="flex items-center gap-4">
                  <span className="w-40 text-sm font-medium text-slate-700 capitalize truncate">
                    {row.role}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500"
                      style={{
                        width: `${(row.count / maxRoleCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-8 text-right">
                    {row.count}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

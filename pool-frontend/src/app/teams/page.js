'use client';

import { useEffect, useState } from 'react';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams/list')
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => {
    setExpandedTeamId((prev) => (prev === id ? null : id));
  };

  if (loading) return <p className="text-center py-4">Loading teams...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Registered Teams</h1>
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="border rounded-md shadow-sm bg-white overflow-hidden"
          >
            <button
              className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium flex justify-between"
              onClick={() => toggleExpand(team.id)}
            >
              <span>{team.teamName}</span>
              <span className="text-sm text-gray-500">
                {expandedTeamId === team.id ? '▲' : '▼'}
              </span>
            </button>

            {expandedTeamId === team.id && (
              <div className="p-4 border-t text-sm space-y-2">
                <p><strong>Location:</strong> {team.location || 'N/A'}</p>
                <p><strong>Captain:</strong> {team.captain}</p>
                <p><strong>Phone:</strong> {team.captainPhone}</p>
                <div>
                  <strong>Players:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {team.players.map((player) => (
                      <li key={player}>{player}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

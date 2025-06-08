'use client';

import { useEffect, useState } from 'react';

export default function TeamStandingsTable({ division }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    const url =
      division === 'all'
        ? '/api/stats/teams'
        : `/api/stats/teams?division=${division}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [division]);

  if (loading) return <p className="text-center text-gray-500">Loading team standings...</p>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border border-gray-200 text-sm md:text-base">
        <thead className="bg-gray-100 text-xs sm:text-sm">
          <tr>
            <th className="p-2 text-left">Team</th>
            <th className="p-2 text-center">Matches</th>
            <th className="p-2 text-center">Wins</th>
            <th className="p-2 text-center">Draws</th>
            <th className="p-2 text-center">Losses</th>
            <th className="p-2 text-center">Points</th>
            <th className="p-2 text-center hidden md:table-cell">Frame Diff</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{team.name}</td>
              <td className="p-2 text-center">{team.matchesPlayed}</td>
              <td className="p-2 text-center">{team.matchesWon}</td>
              <td className="p-2 text-center">{team.matchesDrawn || 0}</td>
              <td className="p-2 text-center">{team.matchesLost}</td>
              <td className="p-2 text-center">{team.points}</td>
              <td className="p-2 text-center hidden md:table-cell">{team.frameDiff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
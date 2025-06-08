'use client';

import { useEffect, useState } from 'react';
import MatchHistoryModal from './MatchHistoryModal';

export default function PlayerStatsTable({ division }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchPlayers = async () => {
    setLoading(true);
    const url =
      division === 'all'
        ? '/api/stats/players'
        : `/api/stats/players?division=${division}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const sorted = data
        .map((player) => ({
          ...player,
          frameDiff: player.framesWon - player.framesLost,
        }))
        .sort((a, b) => {
          if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
          return b.frameDiff - a.frameDiff;
        });

      setPlayers(sorted);
    } catch (err) {
      console.error('Failed to fetch player stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [division]);

  if (loading) return <p className="text-center">Loading player stats...</p>;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border border-gray-200 text-sm md:text-base">
          <thead className="bg-gray-100 text-xs sm:text-sm">
            <tr>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">Team</th>
              <th className="p-2 text-center">Matches</th>
              <th className="p-2 text-center">Wins</th>
              <th className="p-2 text-center">Losses</th>
              <th className="p-2 text-center">Frames (W-L)</th>
              <th className="p-2 text-center hidden md:table-cell">Frame Diff</th>
              <th className="p-2 text-center">History</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{player.name}</td>
                <td className="p-2">{player.teamName}</td>
                <td className="p-2 text-center">{player.matchesPlayed}</td>
                <td className="p-2 text-center">{player.matchesWon}</td>
                <td className="p-2 text-center">{player.matchesLost}</td>
                <td className="p-2 text-center">
                  {player.framesWon} - {player.framesLost}
                </td>
                <td className="p-2 text-center hidden md:table-cell">{player.frameDiff}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPlayer && (
        <MatchHistoryModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
}
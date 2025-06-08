'use client';

import { useEffect, useState } from 'react';

export default function MatchHistoryModal({ player, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player?.id) return;

    fetch(`/api/player/${player.id}/matches`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched match history:', data);
        setMatches(data);
        setLoading(false);
      });
  }, [player?.id]);

  // ✅ Render nothing if no player (but after hooks)
  if (!player?.id) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Match History for {player.name ?? 'Unknown Player'}
          </h2>
          <button
            className="text-red-600 hover:underline text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-gray-500">No matches found for this player.</p>
        ) : (
          <table className="w-full text-sm md:text-base border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Opponent</th>
                <th className="p-2 text-center">Result</th>
                <th className="p-2 text-center">Frames (W-L)</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{match.date}</td>
                  <td className="p-2">{match.opponentName}</td>
                  <td className="p-2 text-center">{match.won ? 'Win' : 'Loss'}</td>
                  <td className="p-2 text-center">
                    {match.framesWon} - {match.framesLost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

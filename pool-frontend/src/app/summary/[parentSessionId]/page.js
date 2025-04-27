// /app/summary/[parentSessionId]/page.js

import { getSessionsByParentKey } from '@/lib/getScoreSummary';

export default async function SummaryPage({ params }) {
  const sessions = await getSessionsByParentKey(params.parentSessionId);

  console.log(sessions)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Match Summary</h1>
      {sessions.map((team) => (
        <div key={team.subSessionId} className="mb-6 border rounded-xl p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">{team.teamName}</h2>
          <ul className="space-y-1">
            {team.players.map((player, index) => (
              <li key={index} className="flex justify-between">
                <span>{player.name}</span>
                <span className="font-mono">{player.score}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

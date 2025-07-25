'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MatchSummaryPage() {
  const { sessionKey } = useParams();
  const { data: session } = useSession();
  const [homeResult, setHomeResult] = useState(null);
  const [awayResult, setAwayResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    async function fetchMatchResults() {
      try {
        const sessionRes = await fetch(`/api/getFormData?sessionKey=${sessionKey}`);
        const sessionJson = await sessionRes.json();
        setSessionData(sessionJson || {});

        const allUsersRes = await fetch('/api/users/all');
        const allUsers = await allUsersRes.json();
        setTeamPlayers(allUsers);

        const res = await fetch(`/api/match-summary?sessionKey=${sessionKey}`);
        const data = await res.json();
        setHomeResult(data.homeResult);
        setAwayResult(data.awayResult);
      } catch (err) {
        console.error('Error fetching match summary:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchResults();
  }, [session, sessionKey]);

  if (loading) {
    return <div className="p-4">Loading match summary...</div>;
  }

  return (
    <div>
    <Header />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Match Summary</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* Home Team */}
        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">
            {homeResult?.teamName || 'Home Team'}
          </h2>
          <h2 className="text-xl font-semibold mb-2">
            Win: {homeResult?.win} Loss: {homeResult?.loss}
          </h2>
          {homeResult?.submitted ? (
            homeResult.scores.map((s, i) => (
              <div key={i} className="py-1 border-b flex justify-between">
                <span>
                  {i === 4 || i === 9
                    ? `${teamPlayers.find((p) => p.id === s.player)?.name || 'Unknown'} & ${teamPlayers.find((p) => p.id === s.player2)?.name || 'Unknown'}`
                    : `${teamPlayers.find((p) => p.id === s.player)?.name || 'Unknown'}`}
                </span>
                <span className="font-semibold">{s.result}</span>
              </div>

          ))) : (
            <p className="italic text-gray-500">Waiting for home team to submit...</p>
          )}
        </div>

        {/* Away Team */}
        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">
            {awayResult?.teamName || 'Away Team'}
          </h2>
          <h2 className="text-xl font-semibold mb-2">
            Win: {awayResult?.win} Loss: {awayResult?.loss}
          </h2>
          {awayResult?.submitted ? (
            awayResult.scores.map((s, i) => (
              <div key={i} className="py-1 border-b flex justify-between">
                <span>
                  {i === 4 || i === 9
                    ? `${teamPlayers.find((p) => p.id === s.player)?.name || 'Unknown'} & ${teamPlayers.find((p) => p.id === s.player2)?.name || 'Unknown'}`
                    : `${teamPlayers.find((p) => p.id === s.player)?.name || 'Unknown'}`}
                </span>
                <span className="font-semibold">{s.result}</span>
              </div>

            ))
          ) : (
            <p className="italic text-gray-500">Waiting for away team to submit...</p>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}

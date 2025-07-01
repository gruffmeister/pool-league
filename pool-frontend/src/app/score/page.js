'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { v4 as uuidv4 } from 'uuid';

const defaultScore = { player: '', player2: '', result: '' };

const ScorePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const sessionKey = searchParams.get('sessionKey');
  const [subSessionKey, setSubSessionKey] = useState('');
  const [ssid, setSsid] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const [sessionData, setSessionData] = useState({});
  const [teamName, setTeamName] = useState('');
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [winLoss, setWinLoss] = useState({"win": 0, "loss": 0})
  const [formData, setFormData] = useState({
    teamName: '',
    scores: Array(12).fill({ ...defaultScore }),
  });

  const updateQueryParam = (paramName, paramValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, paramValue);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    const param = searchParams.get('subSessionKey');
    if (param) {
      setSubSessionKey(param);
    }
  }, [searchParams]);

  useEffect(() => {

    if (!session || !sessionKey) return;

    const fetchData = async () => {
      if (!session?.user?.email || !sessionKey) return;

      try {
        const sessionRes = await fetch(`/api/getFormData?sessionKey=${sessionKey}`);
        const sessionJson = await sessionRes.json();
        setSessionData(sessionJson)

        const userRes = await fetch(`/api/users/lookup?email=${session.user.email}`);
        const userData = await userRes.json();
        const actualTeamName = userData.team || '';
        setTeamName(actualTeamName);

        const allUsersRes = await fetch('/api/users/all');
        const allUsers = await allUsersRes.json();
        console.log(allUsers)
        const sameTeamPlayers = allUsers.filter((u) => u.team === actualTeamName);
        console.log(sameTeamPlayers)
        setTeamPlayers(sameTeamPlayers);

        // Set form data
        if (subSessionKey && sessionJson?.matchResult?.[subSessionKey]) {
          const result = sessionJson.matchResult[subSessionKey];
          setFormData({
            teamName: result.teamName || userData.team || '',
            scores: (result.scores || []).map((s) => ({
              player: s?.player || '',
              player2: s?.player2 || '',
              result: s?.result || '',
            })),
          });
        } else {
          setFormData({
            teamName: userData.team || '',
            scores: Array(12).fill({ ...defaultScore }),
          });
        }
      } catch (err) {
        console.error('Error loading session or user/team data:', err);
      }
    };

    fetchData();
  }, [sessionKey, session]);

  useEffect(() => {
    const counts = formData.scores.reduce(
      (acc, entry) => {
        if (entry.result === 'W') acc.win += 1;
        if (entry.result === 'L') acc.loss += 1;
        return acc;
      },
      { win: 0, loss: 0 }
    );
  
    setWinLoss(counts);
  }, [formData]);

  const handleChange = (index, field, value) => {
    setFormData((prev) => {
      const scores = [...prev.scores];
      scores[index] = { ...scores[index], [field]: value };
      return { ...prev, scores };
    });
  };

  const saveMatch = async () => {
    const key = subSessionKey;
    const submittedBy = session.user.email
    const submitted = true
    const res = await fetch(`/api/saveMatchResult?sessionKey=${sessionKey}&subSessionKey=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, "submittedBy": submittedBy, "submitted": submitted, teamName }),
    });
    return res;
  };

  const handleBlur = async () => {
    const sessionDate = new Date(sessionData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today && alertCount === 0) {
      alert('You cannot save data for a past date.');
      setAlertCount(1);
    } else {
      await saveMatch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sessionDate = new Date(sessionData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today && alertCount === 0) {
      alert('You cannot save data for a past date.');
      setAlertCount(1);
    } else {
      const success = await saveMatch();
      if (success.ok && !success.error) {
        router.push(`/match-summary/${sessionKey}`);
      }
      //if (success) console.log('Data saved successfully');
      else console.error('Error saving data');
    }
  };

  if (!sessionData.date) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <Header />
      <div>
        <h1 className="text-xl font-bold mb-4">Scorecard</h1>
        <p>Session Key: {sessionKey}</p>
        <p>Date: {sessionData.date}</p>
        <p>Division: {sessionData.division}</p>
        <p>Match Type: {sessionData.matchType}</p>
        <p>Current Score: Win {winLoss.win} Loss {winLoss.loss}</p>
      </div>

      <h2 className="text-xl font-bold my-4">Enter Match Scores</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={teamName}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        {formData.scores.map((entry, index) => (
          <div key={index} className="flex gap-2 items-center">
            {(index === 4 || index === 9) ? (
              <>
                <select
                  value={entry.player || ''}
                  onChange={(e) => handleChange(index, 'player', e.target.value)}
                  onBlur={handleBlur}
                  className="flex-1 p-2 border rounded"
                  required
                >
                  <option value="">Player 1</option>
                  {teamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.email}
                    </option>
                  ))}
                </select>
                <select
                  value={entry.player2 || ''}
                  onChange={(e) => handleChange(index, 'player2', e.target.value)}
                  onBlur={handleBlur}
                  className="flex-1 p-2 border rounded"
                  required
                >
                  <option value="">Player 2</option>
                  {teamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.email}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                value={entry.player || ''}
                onChange={(e) => handleChange(index, 'player', e.target.value)}
                onBlur={handleBlur}
                className="flex-1 p-2 border rounded"
                required
              >
                <option value="">Select Player</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.email}
                  </option>
                ))}
              </select>
            )}
            <select
              value={entry.result || ''}
              onChange={(e) => handleChange(index, 'result', e.target.value)}
              onBlur={handleBlur}
              className="w-24 p-2 border rounded"
              required
            >
              <option value="">Result</option>
              <option value="W">W</option>
              <option value="L">L</option>
            </select>
          </div>
        ))}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Submit
        </button>
      </form>
      <Footer />
    </div>
  );
};

const ScorePage = () => (
  <Suspense fallback={<div>Loading page...</div>}>
    <ScorePageContent />
  </Suspense>
);

export default ScorePage;

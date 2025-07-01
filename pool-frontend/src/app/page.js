'use client';

import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const [teamName, setTeamName] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [scoreCardLink, setScoreCardLink] = useState("/score");
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;
      const res = await fetch(`/api/users/lookup?email=${session.user.email}`);
      const data = await res.json();
      setTeamName(data.team || null);
      setCaptain(data.isCaptain || false); // from your own DB, not session
      console.log(session)
    };
    fetchUser();
  }, [session]);

  useEffect(() => {
    const fetchTeamsAndUser = async () => {
      try {
        if (!session?.user?.email) return;
        const [teamsRes, userRes] = await Promise.all([
          fetch('/api/teams/list'),
          fetch(`/api/users/lookup?email=${session?.user?.email}`),
        ]);

        const teamsData = await teamsRes.json();
        const userData = await userRes.json();

        setTeamName(userData.team || null);

        if (!Array.isArray(teamsData) || !userData?.team) {
          console.warn('Teams or user data missing');
          return;
        }

        setTeams(teamsData);

        const userTeam = teamsData.find((team) => team.teamName === userData.team);
        const link = '/score?sessionKey=' + userTeam.currentMatch + '&subSessionKey=' + userTeam.homeAway;
        setScoreCardLink(link);
      } catch (err) {
        console.error('Error loading teams or user info', err);
      }
    };

    if (session?.user?.email) {
      fetchTeamsAndUser();
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
        <h2 className="text-3xl font-semibold">Welcome to the Pool League App</h2>
        <p className="text-lg text-muted-foreground">
          Track your league scores, player stats, and team standings — all in one place.
        </p>
        <div className="space-x-4">
          <Link href="/stats">
            <button className="bg-accent text-accent-foreground px-6 py-3 rounded hover:bg-yellow-500">
              View Stats
            </button>
          </Link>
          {captain ? 
            <Link href="/match/new">
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded hover:bg-green-700">
                Start New Match
              </button>
            </Link>
             : 
             <Link href={scoreCardLink} className="hover:underline">
             <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded hover:bg-green-700">
                Score Card
              </button>
           </Link>
          }
          {session ? (
            <div><p><strong>Logged in as:</strong> {session.user.username || session.user.email}</p>
            <Link
                href="/teams"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >View Teams</Link>
              {!teamName && (
                <Link
                  href="/teams/create"
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create New Team
                </Link>
              )}
            </div>) : null}
            {teamName ? (
              <p><strong>Team:</strong> {teamName}</p>
            ) : (
              <p>You are not part of a team yet.</p>
            )}

            
            
            {captain ? <div><p><strong>You are the captain of </strong> {teamName}</p>
            <Link
                href="/teams/edit"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Your Team
              </Link>
            </div>
             : 
              <p>You are not a captain</p>}

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

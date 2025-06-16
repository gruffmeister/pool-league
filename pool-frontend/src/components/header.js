'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  const [teamName, setTeamName] = useState(null);
  const [scoreCardLink, setScoreCardLink] = useState("/score")
  const [teams, setTeams] = useState(null)

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
  
        // Find team by name only after confirming teamsData is an array
        const userTeam = teamsData.find((team) => team.teamName === userData.team);

        
        const link = '/score?sessionKey=' + userTeam.currentMatch + '&subSessionKey=' + userTeam.homeAway
        setScoreCardLink(link)
          
      } catch (err) {
        console.error('Error loading teams or user info', err);
      }
    };
  
    if (session?.user?.email) {
      fetchTeamsAndUser();
    }
  }, [session]);

  return (
    <header className="bg-green-900 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide hover:opacity-90">
          Lancaster Pool League
        </Link>

        <nav className="flex gap-4 text-sm sm:text-base items-center">
          <Link href="/stats" className="hover:underline">
            Stats
          </Link>
          <Link href={scoreCardLink} className="hover:underline">
            Scorecard
          </Link>

          {session ? (
            <>
              <span className="hidden sm:inline">Welcome, {session.user.username}</span>
              {teamName && <span className="italic">Team: {teamName}</span>}
              <button
                onClick={() => signOut()}
                className="hover:underline bg-red-500 px-2 py-1 rounded text-white text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// Forcing redeploy
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react'; // optional, for icons (Tailwind Hero Icons or Lucide)

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamName, setTeamName] = useState(null);
  const [scoreCardLink, setScoreCardLink] = useState("/score");
  const [teams, setTeams] = useState(null);

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

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-green-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:opacity-90" onClick={closeMenu}>
          Lancaster Pool League
        </Link>

        {/* Burger Icon */}
        <button className="sm:hidden" onClick={toggleMenu}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Full menu (desktop) */}
        <nav className="hidden sm:flex gap-4 text-sm items-center">
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
                onClick={() => {
                  closeMenu();
                  signOut();
                }}
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

      {/* Mobile menu (shown when menuOpen is true) */}
      {menuOpen && (
        <nav className="sm:hidden flex flex-col gap-4 px-4 pb-4 text-sm bg-green-800">
          <Link href="/stats" className="hover:underline" onClick={closeMenu}>
            Stats
          </Link>
          <Link href={scoreCardLink} className="hover:underline" onClick={closeMenu}>
            Scorecard
          </Link>

          {session ? (
            <>
              <span>Welcome, {session.user.username}</span>
              {teamName && <span className="italic">Team: {teamName}</span>}
              <button
                onClick={() => {
                  closeMenu();
                  signOut();
                }}
                className="hover:underline bg-red-500 px-2 py-1 rounded text-white text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline" onClick={closeMenu}>
                Login
              </Link>
              <Link href="/register" className="hover:underline" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

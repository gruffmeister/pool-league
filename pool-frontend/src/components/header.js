'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  const [teamName, setTeamName] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!session?.user?.email) return;
      const res = await fetch(`/api/users/lookup?email=${session.user.email}`);
      const data = await res.json();
      setTeamName(data.team || null);
    };
    fetchTeam();
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
          <Link href="/score" className="hover:underline">
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
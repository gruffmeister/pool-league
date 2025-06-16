'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function EditTeamPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [originalTeam, setOriginalTeam] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [form, setForm] = useState({
    teamName: '',
    location: '',
    captain: '',
    captainPhone: '',
    players: [],
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch user info and team
  useEffect(() => {
    const loadUserAndTeam = async () => {
      if (!session?.user?.email) return;

      const userRes = await fetch(`/api/users/lookup?email=${session.user.email}`);
      const userData = await userRes.json();

      if (!userData.isCaptain) {
        router.push('/');
        return;
      }

      setUser(userData);

      const teamRes = await fetch(`/api/teams/${userData.team}`);
      const teamData = await teamRes.json();

      setOriginalTeam(teamData);
      setForm({
        teamName: teamData.teamName,
        location: teamData.location,
        captain: teamData.captain,
        captainPhone: teamData.captainPhone,
        players: teamData.players,
      });

      const [availableRes, allRes] = await Promise.all([
        fetch('/api/users/available'),
        fetch('/api/users/all')
      ]);
      setAvailablePlayers(await availableRes.json());
      setAllPlayers(await allRes.json());
    };

    loadUserAndTeam();
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlayerToggle = (id) => {
    setForm((prev) => {
      const exists = prev.players.includes(id);
      const updatedPlayers = exists
        ? prev.players.filter((pid) => pid !== id)
        : [...prev.players, id];

      return { ...prev, players: updatedPlayers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      teamId: originalTeam.id,
      teamName: form.teamName,
      location: form.location,
      captain: form.captain,
      captainPhone: form.captainPhone,
      players: form.players,
      previousCaptain: originalTeam.captain,
      previousPlayers: originalTeam.players
    };

    const res = await fetch('/api/teams/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/');
    } else {
      alert('Error updating team');
    }

    setSubmitting(false);
  };

  const getPlayerName = (id) => {
    const player = allPlayers.find((p) => p.id === id);
    return player?.name || player?.email || id;
  };

  if (!originalTeam || allPlayers.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl">Loading team data...</h1>
      </div>
    );
  }

  const combinedPlayers = [...availablePlayers, ...form.players.map((pid) =>
    allPlayers.find((p) => p.id === pid)
  )].filter(Boolean);
  
  // De-duplicate by id
  const uniquePlayers = Array.from(
    new Map(combinedPlayers.map((p) => [p.id, p])).values()
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
        <Header />
      <h1 className="text-2xl font-bold mb-6">Edit Your Team</h1>

      {originalTeam && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="teamName"
            placeholder="Team Name"
            value={form.teamName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="location"
            placeholder="Playing Location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="tel"
            name="captainPhone"
            placeholder="Captain Phone Number"
            value={form.captainPhone}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <div>
            <label className="font-semibold block mb-2">Change Captain</label>
            <select
              name="captain"
              value={form.captain}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              {form.players.map((pid) => (
                <option key={pid} value={pid}>
                  {getPlayerName(pid)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-2">Team Players</label>
            <div className="space-y-1 max-h-60 overflow-y-auto border p-2 rounded">
              {uniquePlayers.map((player) => (
                <label key={player.id} className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={form.players.includes(player.id)}
                    onChange={() => handlePlayerToggle(player.id)}
                    disabled={player.id === form.captain}
                    />
                    <span>{player.name || player.email}</span>
                </label>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
      <Footer />
    </div>
  );
}

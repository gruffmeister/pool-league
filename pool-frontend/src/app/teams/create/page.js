'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
export default function CreateTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    teamName: '',
    location: '',
    captain: '',
    captainPhone: '',
    players: [],
  });
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);

  // Fetch available players on load
  useEffect(() => {
    fetch('/api/users/available')
      .then((res) => res.json())
      .then(setAvailablePlayers)
      .catch((err) => console.error('Error fetching players:', err));
  }, []);

  useEffect(() => {
    fetch('/api/users/captain')
      .then((res) => res.json())
      .then(setAvailableCaptains)
      .catch((err) => console.error('Error fetching players:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlayerToggle = (id) => {
    setForm((prev) => {
      const exists = prev.players.includes(id);
      const players = exists
        ? prev.players.filter((pid) => pid !== id)
        : [...prev.players, id];
      return { ...prev, players };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      players: form.players.includes(form.captain)
        ? form.players
        : [...form.players, form.captain], // ensure captain is in players list
    };

    const res = await fetch('/api/teams/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/');
    } else {
      alert('Error creating team');
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Create a New Team</h1>

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

        <select
          name="captain"
          value={form.captain}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="" disabled>
            Select Captain
          </option>
          {availableCaptains.map((captain) => (
            <option key={captain.id} value={captain.id}>
              {captain.name || captain.username}
            </option>
          ))}
        </select>


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
          <label className="font-semibold block mb-2">Add Players</label>
          <div className="space-y-1 max-h-60 overflow-y-auto border p-2 rounded">
            {availablePlayers.map((player) => (
              <label key={player.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.players.includes(player.id)}
                  onChange={() => handlePlayerToggle(player.id)}
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
          {submitting ? 'Creating...' : 'Create Team'}
        </button>
      </form>
      <Footer />
    </div>
  );
}

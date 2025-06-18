'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const TitlePage = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    date: '',
    division: '',
    matchType: '',
    homeaway: '',
  });

  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [teams, setTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamsAndUser = async () => {
      try {
        const [teamsRes, userRes] = await Promise.all([
          fetch('/api/teams/list'),
          fetch(`/api/users/lookup?email=${session?.user?.email}`),
        ]);
  
        const teamsData = await teamsRes.json();
        const userData = await userRes.json();
  
        if (!Array.isArray(teamsData) || !userData?.team) {
          console.warn('Teams or user data missing');
          return;
        }
  
        setTeams(teamsData);
  
        // Find team by name only after confirming teamsData is an array
        const userTeam = teamsData.find((team) => team.teamName === userData.team);
  
        if (userTeam?.id) {
          setHomeTeamId(userTeam.id);
        } else {
          console.warn(`Team "${userData.team}" not found in list`);
        }
      } catch (err) {
        console.error('Error loading teams or user info', err);
      }
    };
  
    if (session?.user?.email) {
      fetchTeamsAndUser();
    }
  }, [session]);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'opponent') setAwayTeamId(value);
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Save form data to generate sessionKey
      const response = await fetch('/api/saveFormData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, homeTeamId, awayTeamId }),
      });

      const data = await response.json();

      if (!data.sessionKey) {
        throw new Error('Failed to generate sessionKey');
      }

      var secondTeam = "away"
      if (formData.homeaway == "away") {
          secondTeam = "home"
      }
      // Step 2: Update both teams with the sessionKey
      const updateRes = await fetch('/api/teams/currentMatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: data.sessionKey,
          teamIds: [homeTeamId, awayTeamId],
          firstTeam: formData.homeaway,
          secTeam: secondTeam
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update team match info');

      // Step 3: Navigate to score entry
      router.push(`/score?sessionKey=${data.sessionKey}&subSessionKey=${formData.homeaway}`);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-8 sm:px-8">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-96 bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Match Information</h2>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
        <label htmlFor="matchType" className="block text-sm font-medium text-gray-700">Division</label>
          <select
            name="division"
            value={formData.division}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select Division</option>
            <option value="Stripes">Stripes</option>
            <option value="Spots">Spots</option>
          </select>
        </div>
        <div>
          <label htmlFor="matchType" className="block text-sm font-medium text-gray-700">Match Type</label>
          <select
            name="matchType"
            value={formData.matchType}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select Match Type</option>
            <option value="league">League</option>
            <option value="cup">Cup</option>
            <option value="shield">Shield</option>
            <option value="friendly">Friendly</option>
            <option value="practice">Practice</option>
          </select>
        </div>

        <div>
          <label htmlFor="opponent" className="block text-sm font-medium text-gray-700">Select Opponent</label>
          <select
            name="opponent"
            value={awayTeamId}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select team</option>
            {teams
              .filter((team) => team.id !== homeTeamId)
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.teamName}
                </option>
              ))}
          </select>
        </div>

        <div>
        <label htmlFor="matchType" className="block text-sm font-medium text-gray-700">Home or Away</label>
          <select
            name="homeaway"
            value={formData.homeaway}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          >

            <option value="home">Home</option>
            <option value="away">Away</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 w-full bg-blue-600 text-white rounded-md ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Next'}
        </button>
      </form>
    </div>
  );
};

export default TitlePage;

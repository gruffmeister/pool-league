'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TeamStandingsTable from './components/TeamStandingsTable';
import PlayerStatsTable from './components/PlayerStatsTable';

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState('teams');
  const [division, setDivision] = useState('all');

  const handleTabClick = (tab) => setActiveTab(tab);
  const handleDivisionChange = (e) => setDivision(e.target.value);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          <span className="hover:underline cursor-pointer" onClick={() => location.href = '/'}>Home</span> / Stats
        </div>

        {/* Title & Division Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">League Statistics</h2>

          <select
            value={division}
            onChange={handleDivisionChange}
            className="px-3 py-2 border border-gray-300 rounded bg-white text-sm w-full sm:w-auto"
          >
            <option value="all">All Divisions</option>
            <option value="Stripes">Stripes</option>
            <option value="Spots">Spots</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={() => handleTabClick('teams')}
            className={`px-4 py-2 rounded font-medium text-sm sm:text-base ${
              activeTab === 'teams'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => handleTabClick('players')}
            className={`px-4 py-2 rounded font-medium text-sm sm:text-base ${
              activeTab === 'players'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            Players
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          {activeTab === 'teams' ? (
            <TeamStandingsTable division={division} />
          ) : (
            <PlayerStatsTable division={division} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

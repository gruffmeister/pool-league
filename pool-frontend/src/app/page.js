'use client';

import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function HomePage() {
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
          <Link href="/match/new">
            <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded hover:bg-green-700">
              Start New Match
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

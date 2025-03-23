import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        {/* SVG of a plug */}
        <svg
          viewBox="0 0 100 100"
          className="w-32 h-32 mx-auto mb-8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="20" y="20" width="60" height="50" fill="#374151" rx="4" />
          <rect x="40" y="10" width="20" height="10" fill="#4B5563" />
          <rect x="30" y="70" width="8" height="20" fill="#6B7280" />{" "}
          <rect x="62" y="70" width="8" height="20" fill="#6B7280" />{" "}
          <rect x="46" y="70" width="8" height="25" fill="#6B7280" />{" "}
          <rect x="28" y="65" width="12" height="5" fill="#4B5563" rx="1" />
          <rect x="60" y="65" width="12" height="5" fill="#4B5563" rx="1" />
          <rect x="44" y="65" width="12" height="5" fill="#4B5563" rx="1" />
          <line
            x1="30"
            y1="30"
            x2="70"
            y2="30"
            stroke="#4B5563"
            strokeWidth="2"
          />
          <line
            x1="30"
            y1="40"
            x2="70"
            y2="40"
            stroke="#4B5563"
            strokeWidth="2"
          />
        </svg>

        <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          Sorry, we can't find the socket!
        </h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for seems to be unplugged or doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

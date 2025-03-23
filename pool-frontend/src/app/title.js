'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TitlePage = () => {
  const [formData, setFormData] = useState({
    date: '',
    division: '',
    matchType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/saveFormData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.sessionKey) {
        // Redirect to the second page with the session key
        router.push(`/score?sessionKey=${data.sessionKey}`);
      } else {
        console.error('Failed to save data');
      }
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
        
        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        {/* Division Field */}
        <div>
          <label htmlFor="division" className="block text-sm font-medium text-gray-700">
            Division
          </label>
          <input
            type="text"
            id="division"
            name="division"
            value={formData.division}
            onChange={handleChange}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        {/* Match Type Field */}
        <div>
          <label htmlFor="matchType" className="block text-sm font-medium text-gray-700">
            Match Type
          </label>
          <select
            id="matchType"
            name="matchType"
            value={formData.matchType}
            onChange={handleChange}
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

        {/* Submit Button */}
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

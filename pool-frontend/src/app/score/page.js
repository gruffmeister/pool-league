'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@radix-ui/react-select";
import { v4 } from "uuid";

const ScorePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamName: "",
    scores: Array(12).fill({ player: "a", result: "W" }),
  });
  const [sessionData, setSessionData] = useState({})
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get('sessionKey');
  const [subSessionKey, setSubSessionKey] = useState(searchParams.get('subSessionKey'));

  const [ssid, setSsid] = useState();

  const updateQueryParam = (paramName, paramValue) => {
    // Create a new URLSearchParams object based on the current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Set the new parameter
    params.set(paramName, paramValue);
    
    // Push the new URL with updated query params (without causing a page refresh)
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    if (sessionKey) {
      // Fetch data from DynamoDB using sessionKey
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/getFormData?sessionKey=${sessionKey}`);
          const data = await response.json();
          if (data) {
            setSessionData(data);
          }
          if (subSessionKey) {
            if (data["matchResult"]?.[subSessionKey]) {
                  setFormData(data["matchResult"]?.[subSessionKey])
              }
          }
          else {
            const newSubSession = v4()
            setSsid(newSubSession)
            updateQueryParam('subSessionKey', newSubSession)
          }
        } catch (error) {
          console.error('Error fetching form data:', error);
        }
      };

      fetchData();
    }
  }, [sessionKey]);

  if (!sessionData.date) return <div>Loading...</div>;

  

  const handleChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedScores = [...prev.scores];
      updatedScores[index] = { ...updatedScores[index], [field]: value };
      return { ...prev, scores: updatedScores };
    });
  };

  const handleBlur = async () => {
    if (subSessionKey) {
      const response = await fetch(`/api/saveMatchResult?sessionKey=${sessionKey}&subSessionKey=${subSessionKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log("Data saved successfully");
      } else {
        console.error("Error saving data");
      }

    }
    else {
      const response = await fetch(`/api/saveMatchResult?sessionKey=${sessionKey}&subSessionKey=${ssid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log("Data saved successfully");
      } else {
        console.error("Error saving data");
      }
    }
  }

  const handleSubmit = async () => {
    if (subSessionKey) {
      const response = await fetch(`/api/saveMatchResult?sessionKey=${sessionKey}&subSessionKey=${subSessionKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log("Data saved successfully");
      } else {
        console.error("Error saving data");
      }

    }
    else {
      const response = await fetch(`/api/saveMatchResult?sessionKey=${sessionKey}&subSessionKey=${ssid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log("Data saved successfully");
      } else {
        console.error("Error saving data");
      }
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-4">
      <div>
      <h1 className="text-xl font-bold mb-4">Scorecard</h1>
      <p>Using session key: {sessionKey}</p>
      {/* Render form data here */}
      <p>Date: {sessionData.date}</p>
      <p>Division: {sessionData.division}</p>
      <p>Match Type: {sessionData.matchType}</p>
      {/* More form fields here */}
      </div>
      <h2 className="text-xl font-bold mb-4">Enter Match Scores</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Team Name"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        {formData.scores.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder={index === 4 || index === 9 ? "Doubles" : "Singles"}
              value={entry.player}
              onChange={(e) => handleChange(index, "player", e.target.value)}
              onBlur={() => handleBlur()}
              className="flex-1 p-2 border rounded"
              required
            />
            <select name="result" value={entry.result} onChange={(e) => handleChange(index, "result", e.target.value) } onBlur={() => handleBlur()}>
              <option value="">Select</option>
              <option value="W">W</option>
              <option value="L">L</option>
            </select>


          </div>
        ))}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default ScorePage;

"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@radix-ui/react-select";
import { v4 } from "uuid";

const ScorePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState({})
  const [division, setDivision] = useState(1)

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
    const fetchData = async () => {
    try {
        const response = await fetch(`/api/getResultData?division=${division}`);
        const data = await response.json();
        if (data) {
        setResultData(data);
        }  
    } catch (error) {
        console.error('Error fetching result data:', error);
    }
    };

    fetchData();
  }, [division]);
  
  const handleChange = async (divValue) => {
    
    setDivision(parseInt(divValue))
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div>
      <h1 className="text-xl font-bold mb-4">Results Page</h1>
      </div>
      <h2 className="text-xl font-bold mb-4">Select Division</h2>
      <select name="division" value={division} onChange={(e) => handleChange(e.target.value) } onBlur={() => handleBlur()}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
    </select>
      
    </div>
  );
};

const ScorePage = () => {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <ScorePageContent />
    </Suspense>
  );
};

export default ScorePage;
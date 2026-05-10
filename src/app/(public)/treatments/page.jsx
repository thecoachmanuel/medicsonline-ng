"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TreatmentsPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/treatment/list`);
        setTreatments(response.data.treatments || []);
      } catch (err) {
        setError('Failed to fetch treatments');
        console.error('Error fetching treatments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading treatments...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Medical Treatments</h1>
      {treatments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treatments.map((treatment) => (
            <div 
              key={treatment._id} 
              className="border rounded p-4 hover:shadow-md cursor-pointer"
              onClick={() => router.push(`/treatments/${treatment.slug}`)}
            >
              <h2 className="text-lg font-semibold">{treatment.name}</h2>
              <p className="text-blue-500 hover:underline mt-2">View details</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No treatments available at the moment.</p>
      )}
    </div>
  );
};

export default TreatmentsPage;
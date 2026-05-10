"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const TreatmentDetailPage = ({ params }) => {
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/treatment/slug/${slug}`);
        setTreatment(response.data.treatment);
      } catch (err) {
        setError('Failed to fetch treatment details');
        console.error('Error fetching treatment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTreatment();
    }
  }, [slug]);

  useEffect(() => {
    const fetchDoctorsForTreatment = async () => {
      if (!treatment) return;
      
      try {
        setDoctorsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/doctor/form/search?specialty=${treatment.name}`);
        setDoctors(response.data.doctors || []);
      } catch (err) {
        console.error('Error fetching doctors for treatment:', err);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctorsForTreatment();
  }, [treatment]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading treatment details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!treatment) {
    return <div className="container mx-auto p-4">Treatment not found.</div>;
  }

  const handleDoctorClick = (doctorId) => {
    router.push(`/profile-info/${doctorId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{treatment.name}</h1>
        <p className="text-gray-600">{treatment.description}</p>
      </div>

      {treatment.image && (
        <div className="mb-6">
          <img 
            src={treatment.image} 
            alt={treatment.name} 
            className="w-full max-w-2xl h-auto rounded-lg"
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">About this treatment</h2>
        <div className="prose max-w-none">
          {treatment.longDescription ? (
            <div dangerouslySetInnerHTML={{ __html: treatment.longDescription }} />
          ) : (
            <p>Details about this treatment will be available soon.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Doctors offering this treatment</h2>
        {doctorsLoading ? (
          <p>Loading doctors...</p>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div 
                key={doctor._id} 
                className="border rounded p-4 hover:shadow-md cursor-pointer"
                onClick={() => handleDoctorClick(doctor._id)}
              >
                <div className="flex items-center mb-2">
                  {doctor.profilePicture ? (
                    <img 
                      src={doctor.profilePicture} 
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                      <span className="text-gray-600 font-bold">
                        {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h3>
                    <p className="text-sm text-gray-600">{doctor.medicalCategory}</p>
                  </div>
                </div>
                <p className="text-blue-500 hover:underline text-sm">View profile</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No doctors currently offer this treatment.</p>
        )}
      </div>
    </div>
  );
};

export default TreatmentDetailPage;
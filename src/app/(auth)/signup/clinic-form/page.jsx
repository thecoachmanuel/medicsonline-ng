"use client";

import { useState, useEffect } from 'react';
import { Alert, Button, Checkbox, Label, Spinner, TextInput, Select } from 'flowbite-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PatientHeader from '@/app/components/PatientHeader';

const ClinicSignup = () => {
  const [formData, setFormData] = useState({
    clinicName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    termsConditions: false,
    consentToMarketing: false
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const isFieldInvalid = (field) => invalidFields.includes(field);

  // handle input change
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [id]: fieldValue
    });

    // Remove the field from invalidFields when the user starts typing
    if (isFieldInvalid(id) && value.trim() !== '') {
      setInvalidFields(invalidFields.filter((item) => item !== id));
    }
  };

  useEffect(() => {
    // Reset error and success messages when component mounts
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['clinicName', 'email', 'password', 'phone', 'address', 'city'];
    const newInvalidFields = [];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newInvalidFields.push(field);
      }
    });

    if (!formData.termsConditions) {
      newInvalidFields.push('termsConditions');
    }

    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields);
      return setErrorMessage('Please fill in all required fields and accept the terms');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMessage('Please enter a valid email');
    }
   
    // Validate password length
    if (formData.password.length < 6) {
      return setErrorMessage('Password must be at least 6 characters');
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Validate phone number (simple validation)
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      return setErrorMessage('Please enter a valid phone number');
    }

    // Trim form data before sending
    const trimmedFormData = {
      clinicName: formData.clinicName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      consentToMarketing: formData.consentToMarketing
    };

    // send the form data to the server
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup/clinic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trimmedFormData)
      });
      
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return setErrorMessage(data.message || 'Signup failed. Please try again.');
      }

      setLoading(false);
      setErrorMessage(null);
      setSuccessMessage('Account created successfully! Please check your email for verification.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };

  const headerStyle = {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#222'
  };

  return (
    <>
      <PatientHeader />
      <div className='max-h-screen mt-10'>
        <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-6'>
          <div className='m-auto w-full sm:w-[60%]'>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <h2 style={headerStyle}>Create a free clinic account</h2>

              <div className='flex justify-center items-center py-6'>
                <hr className='w-32 mr-2' />
                <span className='px-6'>Clinic Registration</span>
                <hr className='w-32 ml-2' />
              </div>

              <div>
                <label htmlFor="clinicName" className='block text-sm font-medium text-gray-700 mb-1'>Clinic Name *</label>
                <input 
                  type="text" 
                  id="clinicName" 
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  placeholder="Clinic Name" 
                  className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('clinicName') ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>

              <div>
                <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email" 
                  className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('email') ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor="phone" className='block text-sm font-medium text-gray-700 mb-1'>Phone Number *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number" 
                    className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('phone') ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>

                <div>
                  <label htmlFor="city" className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
                  <input 
                    type="text" 
                    id="city" 
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City" 
                    className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('city') ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className='block text-sm font-medium text-gray-700 mb-1'>Address *</label>
                <input 
                  type="text" 
                  id="address" 
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full Address" 
                  className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('address') ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>

              <div>
                <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-1'>Password *</label>
                <input
                  className={`block w-full mt-1 placeholder-gray-400 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-300 focus:ring-gray-300 hover:border-gray-400 transition duration-300 ease-in-out ${isFieldInvalid('password') ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='Password'
                  type="password"
                  id='password'
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <p className='text-xs text-gray-500 mt-1'>Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character</p>
              </div>

              <div>
                <div>
                  <input 
                    type="checkbox" 
                    className='mr-2'
                    id='termsConditions'
                    checked={formData.termsConditions}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="termsConditions" className='text-[11px]'>I consent to Medi-Pluso processing my medical data in order to use the services *</label>
                </div>
                <div>
                  <input 
                    type="checkbox" 
                    className='mr-2'
                    id='consentToMarketing'
                    checked={formData.consentToMarketing}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="consentToMarketing" className='text-[11px]'>I want to receive marketing communications from Medi-Pulse "optional".</label>
                </div>
              </div>

              <button
                className='btn btn-primary bg-blue-400 rounded-sm w-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white focus:ring-offset-[#4285F4] focus:ring-[#4285F4] hover:bg-[#4285F4] hover:text-white hover:shadow-lg transition duration-300 ease-in-out'
                type='submit'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' />
                    <span>Loading...</span>
                  </>
                ) : (
                  'Register Clinic'
                )}
              </button>

              <div className='text-[11px]'>
                <span>By registering, you accept ours <Link href='/regulation' className='text-blue-500 mr-1'>regulations</Link> and confirm that you understand our <span className='text-blue-500 ml-1'>personal data processing policy</span></span>
              </div>
            </form>

            <hr className='mt-5'/>
            <div className='flex text-[12px] mt-5'>
              <span>Already have an account?</span>
              <Link href='/login' className='text-blue-500 ml-2'>
                <span className='text-[12px]'>Log into your account</span>
              </Link>
            </div>

            {errorMessage && (
              <Alert className='mt-5' color='failure'>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert className='mt-5' color='success'>
                {successMessage}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicSignup;

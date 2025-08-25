import React, { useState } from 'react';
import { Building, Save, ArrowRight, Users, BookOpen, Settings } from 'lucide-react';
import Card from '../shared/Card';

interface FirstTimeSetupProps {
  onComplete: (schoolData: any) => void;
}

export default function FirstTimeSetup({ onComplete }: FirstTimeSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState({
    name: '',
    shortName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    establishedYear: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate school creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const completeSchoolData = {
      ...schoolData,
      id: schoolData.shortName.toLowerCase().replace(/\s+/g, ''),
      createdAt: new Date().toISOString(),
      adminUserId: `${schoolData.shortName.toLowerCase().replace(/\s+/g, '')}-admin-001`
    };
    
    onComplete(completeSchoolData);
  };

  const generateSchoolId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '').substring(0, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Building className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to EduMesh</h1>
          <p className="text-blue-100">Let's set up your school in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8">
            <span className={`text-sm ${currentStep >= 1 ? 'text-white font-medium' : 'text-blue-200'}`}>
              School Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-white font-medium' : 'text-blue-200'}`}>
              Contact Details
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-white font-medium' : 'text-blue-200'}`}>
              Review & Create
            </span>
          </div>
        </div>

        <Card className="p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">School Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Greenwood High School"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolData.shortName}
                    onChange={(e) => setSchoolData({...schoolData, shortName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Greenwood"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    School ID will be: {schoolData.shortName ? generateSchoolId(schoolData.shortName) : 'your-school-id'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Principal Name
                  </label>
                  <input
                    type="text"
                    value={schoolData.principalName}
                    onChange={(e) => setSchoolData({...schoolData, principalName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Principal's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={schoolData.establishedYear}
                    onChange={(e) => setSchoolData({...schoolData, establishedYear: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1995"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Complete school address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region/Area
                  </label>
                  <input
                    value={schoolData.region}
                    onChange={(e) => setSchoolData({...schoolData, region: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="School Location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@school.edu"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={schoolData.website}
                    onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.school.edu"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Create School</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">School Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">School Name:</span>
                    <p className="text-gray-900">{schoolData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">School ID:</span>
                    <p className="text-gray-900 font-mono">{generateSchoolId(schoolData.shortName)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Principal:</span>
                    <p className="text-gray-900">{schoolData.principalName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Established:</span>
                    <p className="text-gray-900">{schoolData.establishedYear || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{schoolData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{schoolData.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Your Admin Credentials</h4>
                <div className="text-sm text-blue-800">
                  <p><span className="font-medium">School ID:</span> {generateSchoolId(schoolData.shortName)}</p>
                  <p><span className="font-medium">Admin User ID:</span> {generateSchoolId(schoolData.shortName)}-admin-001</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Save these credentials! You'll use them to login and manage your school.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Add Users</h4>
                  <p className="text-xs text-gray-600">Teachers, students, parents</p>
                </Card>
                <Card className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Create Classes</h4>
                  <p className="text-xs text-gray-600">Subjects and timetables</p>
                </Card>
                <Card className="p-4 text-center">
                  <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Configure</h4>
                  <p className="text-xs text-gray-600">School settings</p>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!schoolData.name || !schoolData.shortName)) ||
                isLoading
              }
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {currentStep === 3 ? <Save size={18} /> : <ArrowRight size={18} />}
                  <span>{currentStep === 3 ? 'Create School' : 'Next'}</span>
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

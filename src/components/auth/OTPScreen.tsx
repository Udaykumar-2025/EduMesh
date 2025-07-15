import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface OTPScreenProps {
  contact: string;
  method: 'phone' | 'email';
  onVerify: () => void;
  onBack: () => void;
}

export default function OTPScreen({ contact, method, onVerify, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every(digit => digit !== '')) {
      onVerify();
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your {method === 'phone' ? 'Phone' : 'Email'}</h1>
          <p className="text-blue-100">
            We've sent a verification code to{' '}
            <span className="font-medium">{contact}</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Enter 6-digit code
              </label>
              <div className="flex space-x-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isComplete}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Verify Code
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-blue-200">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={() => {
                    setTimer(30);
                    setCanResend(false);
                  }}
                  className="text-white font-medium hover:underline"
                >
                  Resend
                </button>
              ) : (
                <span className="text-blue-300">Resend in {timer}s</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
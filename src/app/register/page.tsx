"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-panel text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2>Registration Successful</h2>
          <p>Your account is pending admin approval. You will be assigned a password once approved.</p>
          <Link href="/" className="btn btn-primary mt-4" style={{ display: 'inline-block' }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src="/ganesha-logo.png" alt="Ganesha Logo" width={80} height={80} style={{ margin: '0 auto', marginBottom: '1rem', display: 'block' }} />
          <h2>Request Access</h2>
          <p>Register for Temple Finance Tracker</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label>Full Name</label>
              <input 
                type="text" required 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="mb-4">
              <label>Email Address</label>
              <input 
                type="email" required 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="mb-4">
              <label>Phone Number</label>
              <input 
                type="tel" required 
                value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Email OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-center mb-4">An OTP has been sent to <strong>{formData.email}</strong></p>
            <div className="mb-4">
              <label>Enter 6-digit OTP</label>
              <input 
                type="text" required maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value)} 
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button type="button" className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <p>
            Already have an account? <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, Smartphone, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';

export default function SecuritySettings() {
  const { enrollMFA, verifyEnrollment, unenrollMFA } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{ id: string; type: string; totp: { qr_code: string; secret: string; uri: string } } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleStartEnrollment = async () => {
    setLoading(true);
    try {
      const { data, error } = await enrollMFA();
      if (error) throw error;
      
      if (data && data.totp) {
        setEnrollmentData(data as any);
      }
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        showToast('You already have a pending or active 2FA setup. Please reset it first.', 'error');
      } else {
        showToast(err.message || 'Failed to start enrollment', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will remove your current configuration.')) return;
    
    setLoading(true);
    try {
      // We need the factor ID to unenroll. 
      // Since we might not have it if we are in a "stuck" state, we might need to fetch factors first.
      // For this demo, we'll try to list factors and delete the first TOTP one.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.all?.find((f: any) => f.factor_type === 'totp');
      
      if (totpFactor) {
        await unenrollMFA(totpFactor.id);
        setIsEnrolled(false);
        setEnrollmentData(null);
        showToast('2FA has been disabled. You can now set it up again.', 'success');
      } else {
        showToast('No active 2FA found to disable.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData) return;

    setLoading(true);
    try {
      const { error } = await verifyEnrollment(enrollmentData.id, verifyCode);
      if (error) throw error;
      
      setIsEnrolled(true);
      setEnrollmentData(null);
      showToast('2FA enabled successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account security and authentication methods</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
            </div>
          </div>

          {isEnrolled ? (
             <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-4">
               <div className="flex items-center gap-3">
                 <CheckCircle className="w-5 h-5 text-emerald-600" />
                 <p className="text-emerald-700 font-medium">2FA is currently enabled on your account.</p>
               </div>
               <button 
                 onClick={handleReset}
                 className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
               >
                 Disable 2FA
               </button>
             </div>
          ) : (
            <div className="space-y-6">
              {!enrollmentData ? (
                <div>
                  <p className="text-slate-600 mb-4">
                    Protect your account by requiring a verification code from a mobile app (like Google Authenticator) in addition to your password.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleStartEnrollment}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Smartphone className="w-4 h-4" />
                      Setup 2FA
                    </button>
                    
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className="text-slate-500 hover:text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Reset Configuration
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Scan QR Code
                    </h3>
                    <button onClick={() => setEnrollmentData(null)} className="text-slate-400 hover:text-slate-600">
                      Cancel
                    </button>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 inline-block">
                      <QRCodeSVG value={enrollmentData.totp.uri} size={180} />
                    </div>
                    
                    <div className="flex-1">
                      <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-6">
                        <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                        <li>Scan the QR code to the left</li>
                        <li>Enter the 6-digit code generated by the app below</li>
                      </ol>

                      <form onSubmit={handleVerifyEnrollment} className="max-w-xs">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="000000"
                            maxLength={6}
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Package, ArrowLeft } from 'lucide-react';

const ResetOTP = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.resetOtp(email);
            setMessage('OTP sent to your email (Check console for demo)');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            await api.resetPassword({ email, otp, newPassword });
            alert('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-gray-500">Recover your account access</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Send OTP
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <Input
                            label="Enter OTP"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Reset Password
                        </Button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetOTP;

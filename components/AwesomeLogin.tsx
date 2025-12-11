'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, LogIn } from 'lucide-react';
import AwesomeInput from './AwesomeInput';
import AwesomeButton from './AwesomeButton';
import Swal from 'sweetalert2';
import { API_ENDPOINTS2 } from '@/configs/api';
import { useRouter } from 'next/navigation';

interface LoginData {
  mobile: string;
  password: string;
}

interface AwesomeLoginProps {
  onLogin?: (loginData: LoginData) => Promise<void>;  // 🔥 Fully wired
  onLoginSuccess?: (token: string, userData: any) => void;
  onSwitchToSignup: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
  className?: string;
  showSocialLogin?: boolean;
}

// SweetAlert Setup
const SwalFixed = Swal.mixin({
  customClass: {
    container: 'z-[9999999]',
    popup: 'z-[99999999] rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold text-gray-900',
    confirmButton: 'px-6 py-3 rounded-lg font-medium',
    cancelButton: 'px-6 py-3 rounded-lg font-medium'
  }
});

const AwesomeLogin: React.FC<AwesomeLoginProps> = ({
  onLogin,
  onLoginSuccess,
  onSwitchToSignup,
  onForgotPassword,
  loading = false,
  className = '',
  showSocialLogin = false
}) => {

  const [formData, setFormData] = useState<LoginData>({
    mobile: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // 🟢 VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit number';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🟢 LOGIN API
  const handleLoginAPI = async (loginData: LoginData) => {
    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append('mobile', loginData.mobile);
      fd.append('password', loginData.password);

      const response = await fetch(API_ENDPOINTS2.AUTH.LOGIN, {
        method: 'POST',
        body: fd
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Invalid credentials');
      }

      const user = {
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        profile_image: data.profile_image,
        city: data.city,
        village: data.village,
        state: data.state,
        pin: data.pin,
        block: data.block,
        home_address: data.home_address || {},
        family_friends: data.family_friends || []
      };

      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('userData', JSON.stringify(user));

      if (onLoginSuccess) {
        onLoginSuccess('authenticated', user);
      }

      Swal.close();

      SwalFixed.fire({
        title: 'Login Successful!',
        text: `Welcome back, ${user.name}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push('/UserDashboard');
      });

      return { success: true };

    } catch (err: any) {
      Swal.close();
      SwalFixed.fire({
        title: 'Login Failed',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      SwalFixed.fire({
        title: 'Error',
        text: 'Please correct the highlighted fields',
        icon: 'error'
      });
      return;
    }

    SwalFixed.fire({
      title: 'Signing In...',
      didOpen: () => SwalFixed.showLoading(),
      allowOutsideClick: false
    });

    // If parent provided custom login, use it
    if (onLogin) {
      await onLogin(formData);
      Swal.close();
      return;
    }

    // Otherwise use internal login
    await handleLoginAPI(formData);
  };

  // 🟢 FORGOT PASSWORD HANDLER
  const handleForgotPasswordClick = () => {
    if (onForgotPassword) return onForgotPassword();
  };

  // 🟢 HANDLE INPUT CHANGE
  const handleChange = (field: keyof LoginData, value: string) => {
    const val = field === 'mobile'
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;

    setFormData(prev => ({ ...prev, [field]: val }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      <div className="p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Welcome Back!
          </h2>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AwesomeInput
            label="Mobile Number"
            type="tel"
            placeholder="Enter your 10-digit mobile number"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            error={errors.mobile}
            required
            icon={<Phone size={18} />}
            maxLength={10}
          />

          <div className="relative">
            <AwesomeInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required
              icon={<Lock size={18} />}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: 'calc(50% + 12px)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end text-sm">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </button>
          </div>

          <AwesomeButton
            type="submit"
            variant="primary"
            size="large"
            loading={isLoading || loading}
            className="w-full"
            icon={<LogIn size={18} />}
          >
            Sign In
          </AwesomeButton>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-500 font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Create one now!
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .swal2-container {
          z-index: 999999999 !important;
        }
      `}</style>
    </div>
  );
};

export default AwesomeLogin;

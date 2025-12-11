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
  onLoginSuccess?: (token: string, userData: any) => void;
  onSwitchToSignup: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
  className?: string;
  showSocialLogin?: boolean;
}

// ✅ SweetAlert configuration
const SwalFixed = Swal.mixin({
  customClass: {
    container: 'z-[9999999]',
    popup: 'z-[99999999] rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold text-gray-900',
    confirmButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200',
    cancelButton: 'px-6 py-3 rounded-lg font-medium transition-colors duration-200'
  }
});

const AwesomeLogin: React.FC<AwesomeLoginProps> = ({
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 1) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSuccessAlert = (userName?: string) => {
    SwalFixed.fire({
      title: 'Login Successful!',
      text: userName ? `Welcome back, ${userName}! Redirecting to dashboard...` : 'Welcome back! Redirecting to dashboard...',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#ffffff',
      iconColor: '#10B981'
    }).then(() => {
      router.push('/UserDashboard');
    });
  };

  const showErrorAlert = (message: string) => {
    // ✅ Pehle existing alert ko close karo
    Swal.close();
    
    // ✅ Naya error alert show karo
    SwalFixed.fire({
      title: 'Login Failed',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#EF4444',
      background: '#ffffff'
    });
  };

  // ✅ Direct Login API Call using API_ENDPOINTS2.AUTH.LOGIN
const handleLoginAPI = async (loginData: LoginData) => {
    setIsLoading(true);
    
    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('mobile', loginData.mobile);
      formDataToSend.append('password', loginData.password);

      // Use API_ENDPOINTS2.AUTH.LOGIN endpoint
      const response = await fetch(API_ENDPOINTS2.AUTH.LOGIN, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      // Handle different response formats
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check for success status
      if (data.status === 'success') {
        // ✅ SUCCESSFUL LOGIN - Create complete user object
        const token = 'authenticated';
        
        // ✅ SAARA DATA EK HI USER OBJECT MEIN
        const user = {
          // Basic user info
          id: data.id,
          name: data.name,
          fullName: data.name,
          mobile: data.mobile,
          city: data.city,
          village: data.village,
          email: data.email,
          state: data.state,
          profile_image: data.profile_image,
          pin: data.pin,
          
          // Additional user info from users table
          block: data.block,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          occupation: data.occupation,
          marital_status: data.marital_status,
          latitude: data.latitude,
          longitude: data.longitude,
          profile_complete: data.profile_complete,
          
          // Home address from home_address table (as object)
          home_address: data.home_address || {},
          
          // Family & friends from family_friends table (as array)
          family_friends: data.family_friends || []
        };
        
        // ✅ EK HI BAR MEIN SAB KUCH STORE KARO
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user } 
        }));
        
        // Call success callback with complete user
        if (onLoginSuccess) {
          onLoginSuccess(token, user);
        }
        
        // ✅ Pehle loading alert ko close karo
        Swal.close();
        
        // ✅ Fir success alert show karo
        showSuccessAlert(user.fullName || user.mobile);
        
        return { 
          success: true, 
          data: user  // Return complete user as data
        };
        
      } else if (data.success) {
        // Alternative success format
        const token = data.token || 'authenticated';
        const userData = data.user || data.data;
        
        // Create complete user for alternative format
        const user = {
          ...userData,
          home_address: data.home_address || data.address || {},
          family_friends: data.family_friends || data.contacts || []
        };
        
        // ✅ EK HI BAR MEIN STORE
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user } 
        }));
        
        if (onLoginSuccess) {
          onLoginSuccess(token, user);
        }
        
        // ✅ Pehle loading alert ko close karo
        Swal.close();
        
        // ✅ Fir success alert show karo
        showSuccessAlert(user?.name || user?.mobile);
        
        return { 
          success: true, 
          data: user
        };
        
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // ✅ Pehle loading alert ko close karo
      Swal.close();
      
      // ✅ Fir error alert show karo
      showErrorAlert(error.message || 'Invalid mobile number or password');
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Forgot Password API Call
  const handleForgotPasswordAPI = async (mobile: string) => {
    try {
      // If you have a forgot password endpoint, use it:
      // const response = await fetch(API_ENDPOINTS2.AUTH.FORGOT_PASSWORD, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mobile })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      SwalFixed.fire({
        title: 'Reset Link Sent!',
        text: `Password reset OTP has been sent to ${mobile}`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10B981'
      });

      return { success: true };
    } catch (error: any) {
      SwalFixed.fire({
        title: 'Failed',
        text: error.message || 'Something went wrong',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return { success: false };
    }
  };

  const showForgotPasswordAlert = () => {
    SwalFixed.fire({
      title: 'Reset Password',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-4">Enter your mobile number to reset password:</p>
          <input 
            type="tel" 
            id="reset-mobile" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter your mobile number"
            maxlength="10"
          />
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      preConfirm: async () => {
        const mobileInput = document.getElementById('reset-mobile') as HTMLInputElement;
        const mobile = mobileInput?.value.trim();
        
        if (!mobile) {
          SwalFixed.showValidationMessage('Please enter mobile number');
          return false;
        }
        
        if (!/^\d{10}$/.test(mobile)) {
          SwalFixed.showValidationMessage('Please enter valid 10-digit number');
          return false;
        }
        
        // Call API
        await handleForgotPasswordAPI(mobile);
        return mobile;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // ✅ Form validation fail hone par direkt error show karo
      showErrorAlert('Please fix form errors');
      return;
    }

    // Show loading alert
    SwalFixed.fire({
      title: 'Signing In...',
      text: 'Please wait while we authenticate',
      allowOutsideClick: false,
      didOpen: () => SwalFixed.showLoading(),
      background: '#ffffff'
    });

    // API call karo - handleLoginAPI mein alerts handle ho rahe hain
    await handleLoginAPI(formData);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      showForgotPasswordAlert();
    }
  };

  const handleChange = (field: keyof LoginData, value: string) => {
    if (field === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [field]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className={`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h2>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* Login Form */}
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: 'calc(50% + 12px)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600 hover:text-gray-800">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot password?
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

        {/* Footer */}
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
// src/components/Admin/AdminSignupForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../../store/Admin/adminAuthStore";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const AdminSignupForm = () => {
  const navigate = useNavigate();
  const { register, loading } = useAdminAuthStore();

  const [formData, setFormData] = useState({
    UserName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    UserName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      UserName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Username validation
    if (!formData.UserName.trim()) {
      newErrors.UserName = "Username is required";
      isValid = false;
    } else if (formData.UserName.trim().length < 3) {
      newErrors.UserName = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.UserName)) {
      newErrors.UserName = "Username can only contain letters, numbers, and underscores";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    // else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    //   newErrors.password = 'Password must contain uppercase, lowercase, and number';
    //   isValid = false;
    // }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await register({
      UserName: formData.UserName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (success) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#134848] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#134848] mb-2">Create Admin Account</h1>
          <p className="text-gray-600">Join the admin team</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Username"
              type="text"
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              placeholder="admin_user"
              required
            />
            {errors.UserName && <p className="text-red-500 text-xs mt-1">{errors.UserName}</p>}
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              text={loading ? "Creating Account..." : "Create Account"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="text-[#2E90EB] hover:text-[#134848] font-medium transition-colors"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupForm;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "./GoogleAuthButton";

// ✅ define allowed role types
type Role = "client" | "freelancer";

export default function AuthForm() {
  const { register } = useAuthStore();
  const [form, setForm] = useState({
    UserName: "",
    email: "",
    password: "",
    role: "client" as Role,
  });

  useEffect(() => {
    console.log(form);
  }, [form]);

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const signinApiCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(form);

      if (res?.user) {
        toast.success("User registered successfully!");
        navigate("/");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong, please try again!");
      }
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md space-y-4 bg-white shadow-md rounded-xl p-6 ">
      {/* Form */}
      <form onSubmit={signinApiCall} className="  w-full space-y-4">
        <h2 className="text-center text-2xl font-bold text-[#134848]">Sign In</h2>

        <Input
          label="Username"
          name="UserName"
          placeholder="Enter your Username"
          value={form.UserName}
          onChange={handleChange}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password with eye toggle */}
        <div className="relative">
          <Input
            label="Password"
            placeholder="Enter your Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Role select */}
        <Select label="Role" name="role" value={form.role} onChange={handleChange}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </Select>

        <Button text="Sign In" type="submit" />
      </form>

      {/* Google + Login link (aligned, not breaking UI) */}
      <div className="flex flex-col items-center space-y-3 w-full">
        <GoogleAuthButton role={form.role} />

        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2E90EB] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

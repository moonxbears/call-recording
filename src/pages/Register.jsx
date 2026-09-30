import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext"; // <-- Import AuthContext

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth(); // <-- Extract context methods

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle standard Email / Password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password);
      navigate("/"); // Redirect to dashboard upon successful sign-up
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth registration
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google sign-up failed:", err);
      setError("Google sign-up failed. Please try again.");
    }
  };

  // ... rest of your UI JSX code remains identical
}
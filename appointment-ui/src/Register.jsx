import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Account created successfully. You can now log in.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Server error. Try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>
        <p className="subtitle">Register a new account</p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary">
             Create Account
            </button>

        </form>
        <p className="auth-link">
            Already have an account?{" "}
            <a href="/login">Login</a>
        </p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}

export default Register;

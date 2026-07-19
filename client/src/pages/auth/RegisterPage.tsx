import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { type RegisterRequest } from "../../types/auth";

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { signup } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await signup(form);

      navigate("/student");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Signup failed");
    }
  }

  return (
    <div>
      <h2>Register</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,

              name: e.target.value,
            })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,

              email: e.target.value,
            })
          }
        />

        <input
          placeholder="Enrollment Number"
          value={form.enrollmentNumber}
          onChange={(e) =>
            setForm({
              ...form,

              enrollmentNumber: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,

              password: e.target.value,
            })
          }
        />

        <button>Register</button>
      </form>

      <Link to="/login">Login</Link>
    </div>
  );
}

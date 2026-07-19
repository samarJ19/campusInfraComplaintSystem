import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { type LoginRequest } from "../../types/auth";

export default function LoginPage() {
  const { login, user } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "ADMIN":
          navigate("/admin");
          break;

        case "FACULTY":
          navigate("/faculty");
          break;

        case "MAINTENANCE":
          navigate("/maintenance");
          break;

        default:
          navigate("/student");
      }
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await login(form);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
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

        <button>Login</button>
      </form>

      <Link to="/register">Register</Link>
    </div>
  );
}

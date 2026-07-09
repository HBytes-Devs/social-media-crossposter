import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, selectAuth } from "../store/slices/authSlice";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await dispatch(registerUser({ email, password, name: name || undefined }));
    if (registerUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      setError((result.payload as string) ?? "Registration failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">SMC ke liye register karo</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full" loading={authLoading}>
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have account?{" "}
          <Link to="/login" className="text-brand-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

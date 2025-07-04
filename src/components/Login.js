import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C39.904,36.213,44,30.659,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

function Login() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0F172A]" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <Link
            to="/"
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            calmly
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-sm p-4">
          {/* Form Header */}
          <div className="text-center mb-10">
            <h1
              className={`text-2xl font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              ready when you are
            </h1>
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              your safe space, one convo at a time
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 focus:ring-yellow-500"
                    : "bg-white border-gray-300 focus:ring-yellow-500"
                }`}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 focus:ring-yellow-500"
                    : "bg-white border-gray-300 focus:ring-yellow-500"
                }`}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-semibold border transition ${
                theme === "dark"
                  ? "bg-white text-black border-white hover:bg-gray-200"
                  : "bg-black text-white border-black hover:bg-gray-800"
              }`}
            >
              log in
            </button>
          </form>

          {/* Links */}
          <div className="text-center mt-4 text-sm">
            <Link
              to="/forgot-password"
              className={`hover:underline ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              forgot your password?
            </Link>
            <p
              className={`mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold hover:underline text-yellow-500"
              >
                sign up
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr
              className={`flex-grow border-t ${
                theme === "dark" ? "border-slate-700" : "border-gray-300"
              }`}
            />
            <span
              className={`mx-4 text-xs font-medium ${
                theme === "dark" ? "text-slate-500" : "text-gray-400"
              }`}
            >
              or
            </span>
            <hr
              className={`flex-grow border-t ${
                theme === "dark" ? "border-slate-700" : "border-gray-300"
              }`}
            />
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleSignIn}
            className={`w-full py-2.5 rounded-lg font-semibold border flex items-center justify-center gap-2 transition ${
              theme === "dark"
                ? "bg-transparent text-white border-slate-700 hover:bg-slate-800"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              by signing up, you agree to our{" "}
              <a href="#" className="underline">
                terms of service
              </a>
              ,{" "}
              <a href="#" className="underline">
                privacy policy
              </a>{" "}
              and acknowledge our{" "}
              <a href="#" className="underline">
                ai disclaimer
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;

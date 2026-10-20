import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({
  language,
  text,
  setScreen,
  role,
  setPhone: savePhone,
  setActiveTab,
  setFarmerTab,
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const t = text?.[language] || text?.en || {};

  // Helper function to sync user data into Supabase 'profiles' table
  const syncUserProfile = async (user) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: user.email,
          role: role || "farmer",
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) console.error("Error upserting profile:", error.message);
    } catch (err) {
      console.error("Profile sync exception:", err);
    }
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isSignUp) {
        // --- 1. SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: role || "farmer" },
          },
        });

        if (error) throw error;

        if (data?.user) {
          await syncUserProfile(data.user);
          setSuccessMessage("✅ Account created successfully! Logging you in...");

          if (setActiveTab) setActiveTab("home");
          if (setFarmerTab) setFarmerTab("home");

          setTimeout(() => {
            setScreen(role === "farmer" ? "farmerDashboard" : "ownerDashboard");
          }, 1200);
        }
      } else {
        // --- 2. SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          await syncUserProfile(data.user);

          if (setActiveTab) setActiveTab("home");
          if (setFarmerTab) setFarmerTab("home");

          setScreen(role === "farmer" ? "farmerDashboard" : "ownerDashboard");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    if (role === "farmer") {
      setEmail("farmer.demo@farmzy.com");
      setPassword("FarmerPass123!");
    } else {
      setEmail("owner.demo@farmzy.com");
      setPassword("OwnerPass123!");
    }
  };

  return (
    <div className="loginScreen">
      {/* HEADER */}
      <div className="loginHeader">
        <button className="iconBack" onClick={() => setScreen("role")}>
          ←
        </button>

        <div className="loginLogo">{role === "farmer" ? "👨‍🌾" : "🚜"}</div>

        <h1>Farmzy</h1>

        <p>{role === "farmer" ? t.farmer || "Farmer" : t.owner || "Equipment Owner"}</p>
      </div>

      {/* EMAIL & PASSWORD LOGIN CARD */}
      <div className="loginCard">
        <div className="loginIntro">
          <span className="welcomeBadge">Welcome to Farmzy</span>

          <h2>{isSignUp ? "Create an Account" : "Sign In with Email"}</h2>

          <p className="sub">
            {isSignUp
              ? "Register with your email to start booking & listing equipment"
              : "Enter your registered email and password to access your dashboard"}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMessage && (
          <div
            style={{
              padding: "10px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "12px",
              border: "1px solid #ffcdd2",
            }}
          >
            ❌ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: "10px",
              background: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "12px",
              border: "1px solid #c8e6c9",
            }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuthAction}>
          {/* EMAIL INPUT */}
          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ display: "block", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          {/* PASSWORD INPUT WITH SHOW/HIDE TOGGLE */}
          <div style={{ marginBottom: "18px" }}>
            <label className="label" style={{ display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#666",
                  padding: "4px",
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="continueBtn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, width: "100%" }}
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            <span> →</span>
          </button>
        </form>

        {/* TOGGLE SIGN IN / SIGN UP */}
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* DEMO AUTO-FILL HELPER */}
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            style={{
              background: "none",
              border: "none",
              color: "#2e7d32",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Fill Demo {role === "farmer" ? "Farmer" : "Owner"} Account
          </button>
        </div>

        <div className="securityNote" style={{ marginTop: "16px" }}>
          <span>🔒</span>
          <p>{t.securityNote || "Your personal details are secured with end-to-end encryption."}</p>
        </div>
      </div>
    </div>
  );
}
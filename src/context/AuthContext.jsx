import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch or create profile record in public.profiles
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Profile fetch notice:", error.message);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  };

  // Sync profile data to Supabase public.profiles
  const updateProfile = async (profileData) => {
    if (!user) throw new Error("No active user session");

    const payload = {
      id: user.id,
      updated_at: new Date().toISOString(),
      ...profileData,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    setProfile(data);
    return data;
  };

  // Initialize and listen to persistent Supabase Auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Session restore error:", error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error("Auth init exception:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession?.user) {
            await fetchProfile(newSession.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 1. Email & Password Registration
  const register = async ({ email, password, fullName, phoneNumber, role }) => {
    setAuthError(null);

    // Map UI role to valid Postgres enum user_role: 'farmer', 'owner', 'both'
    const roleMap = {
      "Farmer": "farmer",
      "farmer": "farmer",
      "Equipment Owner": "owner",
      "owner": "owner",
      "Both": "both",
      "both": "both",
    };
    const dbRole = roleMap[role] || "farmer";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          role: dbRole,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // If session is returned immediately (email confirmation disabled), provision profile
    if (data?.session && data?.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          role: dbRole,
          is_verified: true,
          updated_at: new Date().toISOString(),
        });
        await fetchProfile(data.user.id);
      } catch (e) {
        console.warn("Initial profile provisioning note:", e);
      }
    }

    return data;
  };

  // 2. Email & Password Login
  const login = async ({ email, password }) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data?.user) {
      const userProf = await fetchProfile(data.user.id);

      // If user has metadata but no row in profiles, auto-provision from metadata
      if (!userProf && data.user.user_metadata) {
        const meta = data.user.user_metadata;
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: meta.full_name || "Farmzy User",
            phone_number: meta.phone_number || null,
            role: meta.role || "farmer",
            is_verified: true,
            updated_at: new Date().toISOString(),
          });
          await fetchProfile(data.user.id);
        } catch (e) {
          console.warn("Profile auto-sync notice:", e);
        }
      }
    }

    return data;
  };

  // 3. Email Verification with OTP token code from email
  const verifyEmailOtp = async ({ email, token }) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data?.user) {
      const meta = data.user.user_metadata || {};
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: meta.full_name || "Farmzy User",
          phone_number: meta.phone_number || null,
          role: meta.role || "farmer",
          is_verified: true,
          updated_at: new Date().toISOString(),
        });
        await fetchProfile(data.user.id);
      } catch (e) {
        console.warn("Profile provisioning after verify notice:", e);
      }
    }

    return data;
  };

  // 4. Request Password Reset Email
  const resetPasswordEmail = async (email) => {
    setAuthError(null);

    const redirectUrl = `${window.location.origin}/?screen=resetPassword`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  // 5. Update Password (from Password Recovery)
  const updatePassword = async (newPassword) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  // 6. Sign Out / Logout
  const logout = async () => {
    setAuthError(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out exception:", e);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Check if user has completed profile location requirements
  const isProfileComplete = (prof) => {
    if (!prof) return false;
    return !!(prof.village && prof.district && prof.pincode);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    authError,
    setAuthError,
    register,
    login,
    verifyEmailOtp,
    resetPasswordEmail,
    updatePassword,
    logout,
    updateProfile,
    fetchProfile,
    isProfileComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

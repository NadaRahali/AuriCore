import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { syncUserToFirebase, userExistsInFirebase } from '../lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Sync user to Firebase on app load (if they don't exist)
      if (session?.user) {
        try {
          const exists = await userExistsInFirebase(session.user.id);
          if (!exists) {
            await syncUserToFirebase(session.user);
          } else {
            // Update last_login even if user exists
            await syncUserToFirebase(session.user);
          }
        } catch (error) {
          console.error('Error syncing user to Firebase on app load:', error);
          // Don't block app load if Firebase sync fails
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Sync user to Firebase when they log in (if they don't exist)
      if (session?.user) {
        try {
          const exists = await userExistsInFirebase(session.user.id);
          if (!exists) {
            await syncUserToFirebase(session.user);
          } else {
            // Update last_login even if user exists
            await syncUserToFirebase(session.user);
          }
        } catch (error) {
          console.error('Error syncing user to Firebase on login:', error);
          // Don't block login if Firebase sync fails
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      // Sync new user to Firebase
      if (data?.user && !error) {
        try {
          await syncUserToFirebase(data.user);
        } catch (firebaseError) {
          console.error('Error syncing new user to Firebase:', firebaseError);
          // Don't block signup if Firebase sync fails
        }
      }
      
      return { data, error };
    },
    resendOtp: async (email) => {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      return { data, error };
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
    sendPasswordResetOtp: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined,
      });
      return { data, error };
    },
    verifyPasswordResetOtp: async (email, token) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      return { data, error };
    },
    verifyOtp: async (email, token) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      
      // Sync user to Firebase after verification (in case signup sync failed)
      if (data?.user && !error) {
        try {
          const exists = await userExistsInFirebase(data.user.id);
          if (!exists) {
            await syncUserToFirebase(data.user);
          }
        } catch (firebaseError) {
          console.error('Error syncing user to Firebase after verification:', firebaseError);
          // Don't block verification if Firebase sync fails
        }
      }
      
      return { data, error };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


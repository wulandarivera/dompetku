import { supabase } from '../config/supabase';

export const authService = {
  signUp: async (email, password, name) => {
    try {
      // Validasi email sederhana
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format email tidak valid');
      }

      // 1. Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: 'myfinancialinfo://login'  // Ganti dengan deep link aplikasi Anda
        }
      });

      if (authError) {
        console.error('Auth Error:', authError);
        if (authError.message.includes('email')) {
          throw new Error('Email sudah terdaftar atau tidak valid');
        }
        throw authError;
      }

      // 2. Create profile after successful registration
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: name,
              created_at: new Date().toISOString(),
            }
          ]);

        if (profileError) {
          console.error('Profile Error:', profileError);
          await supabase.auth.signOut();
          throw new Error('Gagal membuat profil pengguna');
        }

        return authData;
      } else {
        throw new Error('Registrasi gagal, silakan coba lagi');
      }

    } catch (error) {
      console.error('SignUp error:', error);
      throw new Error(error.message || 'Gagal melakukan registrasi');
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Pastikan data user valid
      if (!data?.user) {
        throw new Error('Login gagal, silakan coba lagi');
      }

      // Ambil data profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw new Error('Gagal mengambil data profil');
      }

      return {
        ...data,
        user: {
          ...data.user,
          profile
        }
      };
    } catch (error) {
      console.error('SignIn error:', error.message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('SignOut error:', error.message);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        // Get additional profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        return { ...user, profile };
      }
      return null;
    } catch (error) {
      console.error('GetCurrentUser error:', error.message);
      throw error;
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UpdateProfile error:', error.message);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Jika ada error atau tidak ada session, kembalikan status tidak login
      if (error || !session) {
        return {
          isLoggedIn: false,
          user: null,
        };
      }

      // Cek profil pengguna
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Jika ada error saat mengambil profil, tetap coba gunakan session
      if (profileError) {
        console.error('Error mengambil profil:', profileError);
        return {
          isLoggedIn: true, // Tetap return true jika ada session valid
          user: session.user
        };
      }

      // Jika semua berhasil, kembalikan status login dengan data user lengkap
      return {
        isLoggedIn: true,
        user: { ...session.user, profile }
      };

    } catch (error) {
      console.error('Check auth error:', error);
      return {
        isLoggedIn: false,
        user: null,
      };
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error.message);
      throw error;
    }
  }
}; 
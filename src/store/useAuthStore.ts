import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  targetRole?: string;
  bio?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  hasCheckedSession: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshSession: (options?: { force?: boolean }) => Promise<void>;
}

let sessionRefreshPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isLoading: true,
  hasCheckedSession: false,

  setUser: (user) =>
    set({ user, isLoggedIn: !!user, isAdmin: user?.role === "admin", isLoading: false, hasCheckedSession: true }),

  login: (user) =>
    set({ user, isLoggedIn: true, isAdmin: user.role === "admin", isLoading: false, hasCheckedSession: true }),

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false, isAdmin: false, isLoading: false, hasCheckedSession: true });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return false;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: updates.name,
        target_role: updates.targetRole,
        bio: updates.bio,
        avatar_url: updates.avatar,
      });

    if (!error) {
      set({ user: { ...user, ...updates } });
      return true;
    }
    return false;
  },

  refreshSession: async (options) => {
    const current = get();
    if (!options?.force && current.hasCheckedSession && !current.isLoading) {
      return;
    }

    if (sessionRefreshPromise) {
      return sessionRefreshPromise;
    }

    const supabase = createClient();
    sessionRefreshPromise = (async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        const su = data.session.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", su.id)
          .single();

        set({
          user: {
            id: su.id,
            name: profile?.name || su.email?.split("@")[0] || "用户",
            email: su.email,
            phone: su.phone || profile?.phone || undefined,
            avatar: profile?.avatar_url || undefined,
            targetRole: profile?.target_role || undefined,
            bio: profile?.bio || undefined,
            role: profile?.role || undefined,
          },
          isLoggedIn: true,
          isAdmin: profile?.role === "admin",
          isLoading: false,
          hasCheckedSession: true,
        });
      } else {
        set({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          isLoading: false,
          hasCheckedSession: true,
        });
      }
    })().finally(() => {
      sessionRefreshPromise = null;
    });

    return sessionRefreshPromise;
  },
}));

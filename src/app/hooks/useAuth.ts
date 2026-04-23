"use client";

import { usePrivy } from "@privy-io/react-auth";

export type AuthUser = {
  email?: { address?: string | null } | null;
  wallet?: { address?: string | null } | null;
} | null;

type AuthState = {
  ready: boolean;
  authenticated: boolean;
  user: AuthUser;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

export function useAuth(): AuthState {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();

  return {
    ready,
    authenticated,
    user: user
      ? {
          email: user.email ?? null,
          wallet: user.wallet ?? null,
        }
      : null,
    login: async () => {
      login();
    },
    // Privy's /v1/sessions/logout can return 400 when the session was already
    // partially invalidated (e.g. user disconnected their wallet externally).
    // In that case the promise rejects and client state can end up stuck —
    // the dropdown still shows "User" and there's no way back in. To stay
    // robust we always force a full navigation to /landing (now) after attempting
    // logout, which unmounts every React/Privy client instance.
    logout: async () => {
      try {
        await logout();
      } catch (error) {
        console.warn("Privy logout failed; forcing client cleanup", error);
      } finally {
        if (typeof window !== "undefined") {
          window.location.href = "/landing";
        }
      }
    },
    getAccessToken,
  };
}

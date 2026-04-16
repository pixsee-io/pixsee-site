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
    logout,
    getAccessToken,
  };
}

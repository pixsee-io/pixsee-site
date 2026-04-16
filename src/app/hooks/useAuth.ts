"use client";

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

const noop = async () => {};
const noToken = async () => null;

export function useAuth(): AuthState {
  return {
    ready: true,
    authenticated: false,
    user: null,
    login: noop,
    logout: noop,
    getAccessToken: noToken,
  };
}

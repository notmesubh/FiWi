import type {FiwiUser} from '../types/fiwi';
export const isClientSupabaseConfigured = true;
const demoUser: FiwiUser = {id: 'demo-user', name: 'User', username: 'user', handle: '@user', email: 'user@example.com', plan: 'free', isAdmin: true, emailVerified: true, createdAt: '2026-01-01'};
export function getSupabaseClient() { return null; }
export async function getActiveSession() { return null; }
export async function getAccessToken() { return null; }
export async function signUpWithSupabase(_params: {name: string; username: string; email: string; password: string}) { return {user: demoUser, session: null, requiresEmailVerification: false}; }
export async function signInWithGoogle(_redirectTo?: string) { return {provider: 'google', user: demoUser}; }
export async function exchangeAuthCode(_code: string) { return {user: demoUser}; }
export async function verifyAuthOtp(_tokenHash: string, _type = 'signup') { return {user: demoUser}; }
export async function signInWithSupabase(_params: {email: string; password: string}) { return {user: demoUser}; }
export async function signOutFromSupabase() {}
export async function resendVerificationEmail(_email: string) {}
export async function requestPasswordReset(_email: string) {}
export async function updateAccountPassword(_newPassword: string) {}

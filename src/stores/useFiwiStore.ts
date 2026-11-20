import {useSyncExternalStore} from 'react';
import type {FiwiUser, PersonalCollection, SavedSite, WebsiteSubmissionRecord} from '../types/fiwi';
export type ToastTone = 'info' | 'success' | 'error';
export interface ToastMessage {id: string; title: string; description?: string; tone: ToastTone}
export interface ConfirmDialogState {title: string; message: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => Promise<void> | void}
const demoUser: FiwiUser = {id: 'demo-user', name: 'User', username: 'user', handle: '@user', email: 'user@example.com', plan: 'free', isAdmin: true, emailVerified: true, createdAt: '2026-01-01'};
const state: any = {supabaseConfigured: true, schemaReady: true, configChecked: true, authInitialized: true, passwordRecoveryMode: false, user: demoUser, collections: [], savedSites: [], mySubmissions: [], toasts: [], confirmDialog: null};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
const set = (patch: any) => { Object.assign(state, typeof patch === 'function' ? patch(state) : patch); emit(); };
const actions = {
 setHealthStatus: (configured: boolean, schemaReady = true) => set({supabaseConfigured: configured, schemaReady, configChecked: true}),
 setAuthInitialized: (authInitialized: boolean) => set({authInitialized}), setPasswordRecoveryMode: (passwordRecoveryMode: boolean) => set({passwordRecoveryMode}), setUser: (user: FiwiUser | null) => set({user: user ?? demoUser}),
 setCollections: (collections: PersonalCollection[]) => set({collections}), setSavedSites: (savedSites: SavedSite[]) => set({savedSites}), setMySubmissions: (mySubmissions: WebsiteSubmissionRecord[]) => set({mySubmissions}),
 refreshUserWorkspace: async () => {}, clearUserWorkspace: () => set({user: demoUser, collections: [], savedSites: [], mySubmissions: []}),
 pushToast: (toast: Omit<ToastMessage, 'id'>) => {const id = String(Date.now()); set({toasts: [...state.toasts, {...toast, id}]}); setTimeout(() => actions.dismissToast(id), 4500);},
 dismissToast: (id: string) => set({toasts: state.toasts.filter((t: ToastMessage) => t.id !== id)}), openConfirm: (confirmDialog: ConfirmDialogState) => set({confirmDialog}), closeConfirm: () => set({confirmDialog: null})
};
export function useFiwiStore<T>(selector: (value: any) => T): T { return useSyncExternalStore(fn => {listeners.add(fn); return () => listeners.delete(fn);}, () => selector({...state, ...actions})); }

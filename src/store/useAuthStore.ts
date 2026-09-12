import { create } from "zustand";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/firebase";

type AuthState = {
	user: User | null;
	// false until Firebase has resolved the persisted session on first load
	initialized: boolean;
	subscribe: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	initialized: false,
	subscribe: () =>
		onAuthStateChanged(auth, (user) => set({ user, initialized: true })),
}));

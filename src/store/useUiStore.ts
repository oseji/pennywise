import { create } from "zustand";

export type RingUpKind = "expense" | "income";

type UiState = {
	ringUp: { open: boolean; kind: RingUpKind };
	openRingUp: (kind?: RingUpKind) => void;
	closeRingUp: () => void;
	moreOpen: boolean;
	setMoreOpen: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set, get) => ({
	ringUp: { open: false, kind: "expense" },
	openRingUp: (kind) => set({ ringUp: { open: true, kind: kind ?? get().ringUp.kind } }),
	closeRingUp: () => set((s) => ({ ringUp: { ...s.ringUp, open: false } })),
	moreOpen: false,
	setMoreOpen: (moreOpen) => set({ moreOpen }),
}));

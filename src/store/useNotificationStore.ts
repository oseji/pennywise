import { create } from "zustand";

type NotificationState = {
	isOpen: boolean;
	toggle: () => void;
	open: () => void;
	close: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
	isOpen: false,
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));

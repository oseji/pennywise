"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatLogoutError } from "@/utils/formatLogoutError";

export function useLogout() {
	const router = useRouter();
	return async () => {
		try {
			await signOut(auth);
			router.push("/");
		} catch (err) {
			toast.error(formatLogoutError(err));
		}
	};
}

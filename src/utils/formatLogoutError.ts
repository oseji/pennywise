import { FirebaseError } from "firebase/app";

export const formatLogoutError = (error: unknown): string => {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case "auth/no-current-user":
				return "No user is currently logged in.";
			case "auth/internal-error":
				return "A server error occurred while logging out. Please try again.";
			case "auth/network-request-failed":
				return "Network error during logout. Check your internet connection.";
			default:
				return error.message
					.replace("Firebase: ", "")
					.replace(/\(.*\)/, "")
					.trim();
		}
	}
	return "An unknown logout error occurred.";
};

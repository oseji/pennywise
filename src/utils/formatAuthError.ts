import { FirebaseError } from "firebase/app";

export const formatAuthError = (error: unknown): string => {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case "auth/email-already-in-use":
				return "This email is already registered.";
			case "auth/weak-password":
				return "Password must be at least 6 characters.";
			case "auth/invalid-email":
				return "Please enter a valid email address.";
			default:
				return error.message
					.replace("Firebase: ", "")
					.replace(/\(.*\)/, "")
					.trim();
		}
	}
	return "An unknown error occurred.";
};

import { FirebaseError } from "firebase/app";

export const formatFetchError = (error: unknown): string => {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case "permission-denied":
				return "You do not have permission to access this data.";
			case "unavailable":
				return "Firestore service is temporarily unavailable. Please try again later.";
			case "deadline-exceeded":
				return "The request timed out. Please try again.";
			case "cancelled":
				return "The operation was cancelled.";
			case "not-found":
				return "The requested document was not found.";
			case "resource-exhausted":
				return "You have exceeded your quota or usage limits.";
			case "unauthenticated":
				return "You must be signed in to fetch this data.";
			case "network-request-failed":
				return "Network error. Please check your internet connection.";
			default:
				return error.message
					.replace("Firebase: ", "")
					.replace(/\(.*\)/, "")
					.trim();
		}
	}
	return "An unknown error occurred while fetching data.";
};

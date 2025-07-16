import { FirebaseError } from "firebase/app";

export const formatAddDocError = (error: unknown): string => {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case "permission-denied":
				return "You do not have permission to add this data.";
			case "unavailable":
				return "Firestore service is temporarily unavailable. Please try again later.";
			case "deadline-exceeded":
				return "The request to add data timed out. Please try again.";
			case "cancelled":
				return "The operation to add data was cancelled.";
			case "resource-exhausted":
				return "You have exceeded your Firestore usage quota.";
			case "unauthenticated":
				return "You must be signed in to add data.";
			case "invalid-argument":
				return "The provided data is invalid. Please check your input.";
			case "failed-precondition":
				return "The system is not in a state required to perform this write.";
			case "aborted":
				return "The operation was aborted due to a conflict or retry.";
			case "internal":
				return "An internal error occurred while trying to add data.";
			case "already-exists":
				return "The document you're trying to create already exists.";
			default:
				return error.message
					.replace("Firebase: ", "")
					.replace(/\(.*\)/, "")
					.trim();
		}
	}
	return "An unknown error occurred while adding data.";
};

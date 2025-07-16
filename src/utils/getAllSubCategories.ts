import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const getAllSubCategories = async (
	userId: string
): Promise<string[]> => {
	const topCategories = ["dailyNeeds", "plannedPayments", "others"];
	const allCategoryValues = new Set<string>();

	for (const topCategory of topCategories) {
		const dataCollectionRef = collection(
			db,
			`users/${userId}/budgetData/${topCategory}/data`
		);

		try {
			const snapshot = await getDocs(dataCollectionRef);
			snapshot.forEach((doc) => {
				const category = doc.data().category;
				if (category && typeof category === "string") {
					allCategoryValues.add(category);
				}
			});
		} catch (error) {
			console.error(`Error fetching data for ${topCategory}:`, error);
		}
	}

	return Array.from(allCategoryValues).sort();
};

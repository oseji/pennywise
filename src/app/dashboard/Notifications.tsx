"use client";

import { useState, useEffect } from "react";
import { formatFetchError } from "@/utils/formatFetchError";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { EmptyState } from "@/components/EmptyState";

import { db, auth } from "@/firebase/firebase";
import { getDocs, query, orderBy, collection } from "firebase/firestore";

import toast from "react-hot-toast";
import { X } from "lucide-react";

type notificationDataType = {
	date: string;
	notification: string;
	category: string;
	amount: number;
};

const Notifications = () => {
	const user = auth.currentUser;
	const currency = usePreferencesStore((s) => s.currency);

	const [isLoading, setIsLoading] = useState(false);
	const [notificationsData, setNotificationsData] = useState<
		notificationDataType[]
	>([]);

	const { isOpen } = useNotificationStore();
	const { close } = useNotificationStore();

	const fetchNotifications = async (userId: string) => {
		if (!userId) return;

		setIsLoading(true);

		try {
			const notificationsReference = collection(
				db,
				`users/${userId}/notifications`
			);
			const q = query(notificationsReference, orderBy("createdAt", "desc"));

			const querySnapshot = await getDocs(q);

			const notificationsList = querySnapshot.docs.map((docSnap) => {
				const data = docSnap.data();

				return {
					date:
						data.createdAt?.toDate().toLocaleString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						}) || "",
					notification: data.notification || "",
					category: data.category,
					amount: Number(data.amount) || 0,
				};
			});

			return notificationsList;
		} catch (err) {
			const message = formatFetchError(err);
			toast.error(`${message}`);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const getData = async () => {
			if (user && isOpen) {
				setNotificationsData((await fetchNotifications(user.uid)) ?? []);
			}
		};
		getData();
	}, [user, isOpen]);

	return (
		<div
			className={`fixed left-2 right-2 top-24 z-50 w-full rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-xl transition-all duration-500 ease-in-out dark:border-slate-700 dark:bg-slate-900/95 md:left-auto md:right-10 md:w-[60%] lg:w-[50%] xl:w-[40%] ${
				isOpen ? "" : "notificationsToggled"
			}`}
			role="region"
			aria-label="Notifications"
			aria-hidden={!isOpen}
		>
			<div className="notificationsHeaderContainer">
				<h2 className="text-lg font-bold capitalize text-[#2D6A4F] dark:text-[#95D5B2] md:text-xl">
					Notifications
				</h2>

				<button
					type="button"
					className="rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
					onClick={close}
					aria-label="Close notifications"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			{isLoading ? (
				<ul className="notificationsContainer mt-6">
					{[1, 2, 3, 4].map((i) => (
						<li
							key={i}
							className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
						/>
					))}
				</ul>
			) : notificationsData.length === 0 ? (
				<div className="mt-8">
					<EmptyState
						title="No notifications yet"
						description="Activity from income and expenses will show up here."
					/>
				</div>
			) : (
				<ul className="notificationsContainer">
					{notificationsData.map((data, index) => (
						<li
							key={index}
							className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
						>
							<p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
								{data.date}
							</p>

							<p className="text-sm text-slate-800 dark:text-slate-200">
								<span className="font-semibold tabular-nums">
									{formatMoney(data.amount, currency)}
								</span>
								<span>{data.notification}</span>
								<span className="font-semibold capitalize">
									{data.category}
								</span>
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Notifications;

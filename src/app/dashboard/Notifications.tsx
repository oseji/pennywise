"use client";

import { useState, useEffect } from "react";
import { formatFetchError } from "@/utils/formatFetchError";
import { useNotificationStore } from "@/store/useNotificationStore";
import { EmptyState } from "@/components/EmptyState";
import { db, auth } from "@/firebase/firebase";
import { getDocs, query, orderBy, collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { X, Bell } from "lucide-react";

type notificationDataType = {
	date: string;
	notification: string;
	category: string;
	amount: number;
};

const Notifications = () => {
	const user = auth.currentUser;

	const [isLoading, setIsLoading] = useState(false);
	const [notificationsData, setNotificationsData] = useState<notificationDataType[]>([]);

	const { isOpen, close } = useNotificationStore();

	const fetchNotifications = async (userId: string) => {
		if (!userId) return;
		setIsLoading(true);
		try {
			const ref = collection(db, `users/${userId}/notifications`);
			const q = query(ref, orderBy("createdAt", "desc"));
			const snap = await getDocs(q);
			return snap.docs.map((docSnap) => {
				const data = docSnap.data();
				return {
					date: data.createdAt?.toDate().toLocaleString("en-GB", {
						day: "2-digit", month: "short", year: "numeric",
						hour: "2-digit", minute: "2-digit", hour12: true,
					}) || "",
					notification: data.notification || "",
					category: data.category,
					amount: Number(data.amount) || 0,
				};
			});
		} catch (err) {
			toast.error(formatFetchError(err));
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
			className={`fixed left-3 right-3 top-[76px] z-50 rounded-2xl shadow-card-md
			            border border-zinc-200/80 bg-white/97 backdrop-blur-xl
			            dark:border-dark-border dark:bg-dark-raised
			            transition-all duration-300 ease-in-out
			            md:left-auto md:right-8 md:w-[420px] lg:w-[380px]
			            ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
			role="region"
			aria-label="Notifications"
			aria-hidden={!isOpen}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-dark-border">
				<div className="flex items-center gap-2">
					<Bell className="h-4 w-4 text-brand-500 dark:text-green-400" />
					<h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
						Notifications
					</h2>
					{notificationsData.length > 0 && (
						<span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-green-500">
							{notificationsData.length}
						</span>
					)}
				</div>
				<button
					type="button"
					className="rounded-xl p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700
					           dark:hover:bg-dark-overlay dark:hover:text-zinc-200"
					onClick={close}
					aria-label="Close notifications"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Body */}
			<div className="px-4 pb-4">
				{isLoading ? (
					<ul className="notificationsContainer">
						{[1, 2, 3].map((i) => (
							<li key={i} className="mt-3 h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-dark-overlay" />
						))}
					</ul>
				) : notificationsData.length === 0 ? (
					<EmptyState
						title="No notifications yet"
						description="Activity from income and expenses will appear here."
					/>
				) : (
					<ul className="notificationsContainer">
						{notificationsData.map((data, index) => (
							<li
								key={index}
								className="flex flex-col gap-1 rounded-xl border border-zinc-100 bg-zinc-50 px-3.5 py-3
								           dark:border-dark-border dark:bg-dark-overlay"
							>
								<p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
									{data.date}
								</p>
								<p className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
									{data.notification}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default Notifications;

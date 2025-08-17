"use client";

import { useState, useEffect } from "react";
import { formatFetchError } from "@/utils/formatFetchError";
import { useNotificationStore } from "@/store/useNotificationStore";

import { db, auth } from "@/firebase/firebase";
import { getDocs, query, orderBy, collection } from "firebase/firestore";
import toast from "react-hot-toast";

type notificationDataType = {
	date: string;
	notification: string;
	category: string;
	amount: number;
};

const Notifications = () => {
	const user = auth.currentUser;

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

			const notificationsList = querySnapshot.docs.map((doc) => {
				const data = doc.data();

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

	// fetch notifications data
	useEffect(() => {
		const getData = async () => {
			if (user && isOpen) {
				setNotificationsData((await fetchNotifications(user.uid)) ?? []);
			}
		};
		getData();

		console.log(isLoading);
	}, [user, isOpen]);

	return (
		<div
			className={`fixed z-50 p-4 rounded-lg shadow bg-white/80 top-24 right-10 backdrop-blur-xl w-full md:w-[60%] lg:w-[50%] xl:w-[40%]  transition-all ease-in-out duration-500 ${
				isOpen ? "" : "notificationsToggled"
			}`}
		>
			<div className=" notificationsHeaderContainer">
				<h1 className=" text-[#2D6A4F] md:text-xl font-bold capitalize mb-4">
					Notifications
				</h1>

				<p
					className="text-sm font-semibold underline transition-all duration-200 ease-in-out cursor-pointer hover:scale-110"
					onClick={close}
				>
					Close
				</p>
			</div>

			<ul className=" notificationsContainer">
				{notificationsData.map((data, index) => (
					<li
						key={index}
						className="flex flex-col gap-1 p-2 bg-white rounded-lg shadow"
					>
						<p className="text-xs font-semibold ">{data.date}</p>

						<p className="">
							<span className="font-semibold ">
								{data.amount.toLocaleString()}
							</span>

							<span>
								{data.notification}
								{""}
							</span>

							<span className="font-semibold ">{data.category}</span>
						</p>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Notifications;

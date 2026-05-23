"use client";

import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import type { CurrencyCode } from "@/store/usePreferencesStore";
import { AccessibleDialog } from "@/components/AccessibleDialog";

const SettingsPage = () => {
	const router = useRouter();
	const { currency, setCurrency, theme, setTheme, notificationsEnabled, setNotificationsEnabled } =
		usePreferencesStore();

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSendingReset, setIsSendingReset] = useState(false);

	const Toggle = ({
		checked,
		onChange,
		id,
	}: {
		checked: boolean;
		onChange: (v: boolean) => void;
		id: string;
	}) => (
		<label
			htmlFor={id}
			className="relative inline-flex cursor-pointer items-center"
		>
			<input
				id={id}
				type="checkbox"
				className="peer sr-only"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<div className="h-6 w-11 rounded-full bg-gray-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-5 dark:bg-dark-muted" />
		</label>
	);

	const handleChangePassword = async () => {
		const user = auth.currentUser;
		if (!user?.email) {
			toast.error("No email address found for this account.");
			return;
		}

		setIsSendingReset(true);
		try {
			await sendPasswordResetEmail(auth, user.email);
			toast.success(`Password reset email sent to ${user.email}`);
		} catch {
			toast.error("Failed to send password reset email. Please try again.");
		} finally {
			setIsSendingReset(false);
		}
	};

	const handleDeleteAccount = async () => {
		const user = auth.currentUser;
		if (!user) return;

		setIsDeleting(true);
		try {
			await deleteUser(user);
			toast.success("Account deleted successfully.");
			router.push("/");
		} catch (err: unknown) {
			const code = (err as { code?: string })?.code;
			if (code === "auth/requires-recent-login") {
				toast.error(
					"For security, please sign out and sign back in before deleting your account."
				);
			} else {
				toast.error("Failed to delete account. Please try again.");
			}
		} finally {
			setIsDeleting(false);
			setIsDeleteModalOpen(false);
		}
	};

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">settings</h1>

			<div className="mt-6 flex flex-col gap-8 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-raised md:p-10">
				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Appearance</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Dark mode reduces glare in low light.
						</p>
					</div>

					<div className="flex flex-row items-center gap-3">
						<span className="text-sm capitalize text-zinc-600 dark:text-zinc-400">
							{theme}
						</span>
						<Toggle
							id="theme-toggle"
							checked={theme === "dark"}
							onChange={(on) => setTheme(on ? "dark" : "light")}
						/>
					</div>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Notifications</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Show transaction notifications in the dashboard.
						</p>
					</div>

					<Toggle
						id="notif-toggle"
						checked={notificationsEnabled}
						onChange={setNotificationsEnabled}
					/>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Currency</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Used to format amounts across the dashboard.
						</p>
					</div>

					<select
						name="currency"
						id="currency"
						className="rounded-lg border border-zinc-200 bg-white p-2 capitalize text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
						value={currency}
						onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
					>
						<option value="NGN">Nigerian naira (NGN)</option>
						<option value="USD">United States dollar (USD)</option>
						<option value="EUR">Euro (EUR)</option>
					</select>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">2-Factor Authentication</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Extra login security for your account.
						</p>
					</div>
					<span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-500 dark:bg-dark-muted dark:text-zinc-400">
						Coming soon
					</span>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading text-[#2E90FA]">Change Password</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							A reset link will be sent to your email address.
						</p>
					</div>
					<button
						type="button"
						onClick={handleChangePassword}
						disabled={isSendingReset}
						className="rounded-lg border border-[#2E90FA] px-4 py-2 text-sm font-medium text-[#2E90FA] transition hover:bg-[#2E90FA]/10 disabled:opacity-60"
					>
						{isSendingReset ? "Sending…" : "Send reset email"}
					</button>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading text-[#F04438]">Delete Account</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Permanently delete your Pennywise account and all data.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsDeleteModalOpen(true)}
						className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950"
					>
						Delete account
					</button>
				</div>
			</div>

			<AccessibleDialog
				open={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Delete account?"
				titleId="settings-delete-account-title"
			>
				<p className="mb-2 text-zinc-700 dark:text-zinc-300">
					This will permanently delete your Pennywise account and all associated
					data. This cannot be undone.
				</p>
				<p className="mb-6 text-sm text-red-500">
					Are you absolutely sure?
				</p>

				<div className="flex flex-row items-center justify-center gap-4">
					<button
						type="button"
						className="w-32 rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 disabled:opacity-60"
						onClick={handleDeleteAccount}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							"Yes, delete"
						)}
					</button>
					<button
						type="button"
						className="w-32 rounded-lg bg-zinc-500 px-4 py-2 text-white transition hover:bg-zinc-600"
						onClick={() => setIsDeleteModalOpen(false)}
					>
						Cancel
					</button>
				</div>
			</AccessibleDialog>
		</div>
	);
};

export default SettingsPage;

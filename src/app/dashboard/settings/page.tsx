"use client";

import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import type { CurrencyCode } from "@/store/usePreferencesStore";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { useSwitchTheme } from "@/components/shell/ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

// Switch control. Lives outside SettingsPage so React keeps the same element
// across renders (a component declared inside would remount on every toggle).
const Toggle = ({
	checked,
	onChange,
	id,
	label,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	id: string;
	label: string;
}) => (
	<label htmlFor={id} className="relative inline-flex min-h-11 cursor-pointer items-center gap-3">
		<span className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3" aria-hidden>
			{checked ? "On" : "Off"}
		</span>
		<input
			id={id}
			type="checkbox"
			role="switch"
			aria-label={label}
			className="peer sr-only"
			checked={checked}
			onChange={(e) => onChange(e.target.checked)}
		/>
		<span className="relative h-7 w-12 rounded-[8px] bg-rule-2 transition-colors duration-150 after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-[6px] after:bg-paper after:shadow-[0_2px_0_rgb(18_22_20/0.25)] after:transition-transform after:duration-200 after:ease-out after:content-[''] peer-checked:bg-key peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--focus))]" />
	</label>
);

const Row = ({ title, children, action, danger }: { title: string; children: React.ReactNode; action: React.ReactNode; danger?: boolean }) => (
	<div className="flex flex-col gap-3 border-b border-dashed border-rule py-5 last:border-0 md:flex-row md:items-center md:justify-between md:gap-8">
		<div className="min-w-0">
			<h3 className={`text-[16px] font-semibold ${danger ? "text-neg" : "text-ink"}`}>{title}</h3>
			<p className="mt-1 max-w-[52ch] text-[15px] text-ink-2">{children}</p>
		</div>
		<div className="shrink-0">{action}</div>
	</div>
);

const SettingsPage = () => {
	const router = useRouter();
	const { currency, setCurrency, theme, notificationsEnabled, setNotificationsEnabled } = usePreferencesStore();
	const switchTheme = useSwitchTheme();
	const authUser = useAuthStore((s) => s.user);
	const sample = useFinanceStore((s) => s.sample);
	const created = authUser?.metadata.creationTime;
	const memberSince = !sample && created ? new Date(created).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null;

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSendingReset, setIsSendingReset] = useState(false);

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
		<div className="page max-w-[880px]">
			<PageHeader title="Settings">How Pennywise looks, counts and keeps your account.</PageHeader>

			<div className="flex flex-col gap-6">
				<section aria-labelledby="settings-account" className="slip px-4 md:px-6">
					<h2 id="settings-account" className="border-b border-dashed border-rule-2 pb-3 pt-5 font-mono text-[16px] font-bold uppercase tracking-[0.05em] text-ink">
						Account
					</h2>
					<Row title="Signed in as" action={null}>
						<span className="break-all">{sample ? "Sample account (development preview)" : (authUser?.email ?? "—")}</span>
						{memberSince && <span className="block text-[14px] text-ink-3">Member since {memberSince}</span>}
					</Row>
				</section>

				<section aria-labelledby="settings-display" className="slip px-4 md:px-6">
					<h2 id="settings-display" className="border-b border-dashed border-rule-2 pb-3 pt-5 font-mono text-[16px] font-bold uppercase tracking-[0.05em] text-ink">
						Display
					</h2>
					<Row
						title="Appearance"
						action={
							<ChoiceGroup
								name="theme"
								legend="Theme"
								hideLegend
								variant="segmented"
								className="w-56"
								value={theme}
								onChange={(t) => switchTheme(t)}
								options={[
									{ value: "light", label: "Light" },
									{ value: "dark", label: "Dark" },
								]}
							/>
						}
					>
						Dark mode reduces glare in low light.
					</Row>
					<Row
						title="Currency"
						action={
							<>
								<label htmlFor="currency" className="sr-only">
									Currency
								</label>
								<select
									name="currency"
									id="currency"
									className="field md:w-64"
									value={currency}
									onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
								>
									<option value="NGN">Nigerian naira (NGN)</option>
									<option value="USD">United States dollar (USD)</option>
									<option value="EUR">Euro (EUR)</option>
								</select>
							</>
						}
					>
						Used to format amounts everywhere. It changes the symbol, not the numbers — nothing is converted.
					</Row>
					<Row
						title="Notifications"
						action={
							<Toggle id="notif-toggle" label="Show notifications" checked={notificationsEnabled} onChange={setNotificationsEnabled} />
						}
					>
						Show the activity bell, with a count of unread entries, for everything you ring up.
					</Row>
				</section>

				<section aria-labelledby="settings-security" className="slip px-4 md:px-6">
					<h2 id="settings-security" className="border-b border-dashed border-rule-2 pb-3 pt-5 font-mono text-[16px] font-bold uppercase tracking-[0.05em] text-ink">
						Security
					</h2>
					<Row title="Change password" action={
						<button type="button" onClick={handleChangePassword} disabled={isSendingReset} className="key-plain">
							{isSendingReset ? "Sending…" : "Send reset email"}
						</button>
					}>
						We&apos;ll email you a link to choose a new password.
					</Row>
					<Row title="Two-factor authentication" action={<span className="tag">Coming soon</span>}>
						A second step at login for extra security.
					</Row>
					<Row title="Delete account" danger action={
						<button type="button" onClick={() => setIsDeleteModalOpen(true)} className="key-plain text-neg ring-neg/60 hover:bg-neg-soft">
							Delete account
						</button>
					}>
						Permanently delete your Pennywise account and everything in it.
					</Row>
				</section>
			</div>

			<AccessibleDialog
				open={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Delete account?"
				titleId="settings-delete-account-title"
			>
				<p className="text-[15px] leading-relaxed text-ink-2">
					This will permanently delete your Pennywise account and all associated data. This cannot be undone.
				</p>
				<p className="mt-2 text-[15px] font-semibold text-neg">Are you absolutely sure?</p>

				<div className="mt-6 grid grid-cols-2 gap-3">
					<button type="button" className="key-plain" onClick={() => setIsDeleteModalOpen(false)}>
						Cancel
					</button>
					<button type="button" className="key-void" onClick={handleDeleteAccount} disabled={isDeleting}>
						{isDeleting ? "Deleting…" : "Yes, delete"}
					</button>
				</div>
			</AccessibleDialog>
		</div>
	);
};

export default SettingsPage;

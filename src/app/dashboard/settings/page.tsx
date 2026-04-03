"use client";

import { usePreferencesStore } from "@/store/usePreferencesStore";
import type { CurrencyCode } from "@/store/usePreferencesStore";

const SettingsPage = () => {
	const { currency, setCurrency, theme, setTheme } = usePreferencesStore();

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
			<div className="h-6 w-11 rounded-full bg-gray-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-[#2D6A4F] peer-checked:after:translate-x-5 dark:bg-slate-600" />
		</label>
	);

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">settings</h1>

			<div className="mt-6 flex flex-col gap-8 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-10">
				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Appearance</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Dark mode reduces glare in low light.
						</p>
					</div>

					<div className="flex flex-row items-center gap-3">
						<span className="text-sm capitalize text-slate-600 dark:text-slate-400">
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
						<h2 className="settingsHeading">notifications</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Allow Pennywise send transaction notifications and updates.
						</p>
					</div>

					<Toggle id="notif-toggle" checked={false} onChange={() => {}} />
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Currency</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Used to format amounts across the dashboard.
						</p>
					</div>

					<select
						name="currency"
						id="currency"
						className="rounded-lg border border-slate-200 bg-white p-2 capitalize text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
						<h2 className="settingsHeading">2-Factor authentication</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Set-up 2-factor authentication on pennywise account for extra
							security
						</p>
					</div>

					<Toggle id="2fa-toggle" checked={false} onChange={() => {}} />
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading">Deactivate Account</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Temporarily or permanently suspend Pennywise account.
						</p>
					</div>

					<Toggle id="deactivate-toggle" checked={false} onChange={() => {}} />
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading text-[#2E90FA]">Change Password</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Change Pennywise account password
						</p>
					</div>
				</div>

				<div className="settingsRow">
					<div>
						<h2 className="settingsHeading text-[#F04438]">Delete Account</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Permanently delete pennywise account along with all entered
							details and transactions.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;

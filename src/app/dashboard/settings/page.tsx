"use client";

import { useState } from "react";

const SettingsPage = () => {
	const [currency, setCurrency] = useState<string>("");

	return (
		<div className=" dashboardScreen">
			<h1 className="dashboardHeading">settings</h1>

			<div className="flex flex-col gap-8 p-10 mt-6 bg-white rounded-lg">
				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading">notifications</h1>
						<p>Allow Pennywise send transaction notifications and updates.</p>
					</div>

					<div>toggle</div>
				</div>

				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading">Currency</h1>
						<p>Select pennywise default update frequency</p>
					</div>

					<select
						name="currency"
						id="currency"
						className="p-2 text-black capitalize border rounded-l border-slate-200 focus:outline-0"
						value={currency}
						onChange={(e) => setCurrency(e.target.value)}
					>
						<option value="" disabled className="text-black ">
							select currency
						</option>
						<option value="ngn">nigerian naira</option>
						<option value="usd">united states dollar</option>
						<option value="eur">euro</option>
					</select>
				</div>

				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading">2-Factor authentication</h1>
						<p>
							Set-up 2-factor authentication on pennywise account for extra
							security
						</p>
					</div>

					<div>toggle</div>
				</div>

				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading">Deactivate Account</h1>
						<p>Temporarily or permanently suspend Pennywise account.</p>
					</div>

					<div>toggle</div>
				</div>

				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading text-[#2E90FA]">Change Password</h1>
						<p>Change Pennywise account password</p>
					</div>
				</div>

				<div className="settingsRow">
					<div>
						<h1 className=" settingsHeading text-[#F04438]">Delete Account</h1>
						<p>
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

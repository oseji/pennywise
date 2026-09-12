"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatAuthError } from "@/utils/formatAuthError";

const ForgotPassword = () => {
	const [email, setEmail] = useState<string>("");
	const [isSending, setIsSending] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [sentTo, setSentTo] = useState<string>("");

	const sendReset = async () => {
		const address = email.trim();
		if (!address) {
			setErrorMessage("Please enter your email address.");
			return;
		}

		setIsSending(true);
		setErrorMessage("");
		try {
			await sendPasswordResetEmail(auth, address);
			setSentTo(address);
		} catch (err) {
			setErrorMessage(formatAuthError(err));
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12 dark:bg-dark-surface">
			<div className="w-full max-w-sm">
				{/* Brand */}
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-glow-green">
						<span className="text-xl font-black text-white">P</span>
					</div>
					<div className="text-center">
						<h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
							Reset your password
						</h1>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
							Enter your email and we&apos;ll send you a reset link.
						</p>
					</div>
				</div>

				{sentTo ? (
					<div
						role="status"
						className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm dark:border-brand-600/30 dark:bg-brand-600/10"
					>
						<p className="font-semibold text-brand-600 dark:text-green-400">
							Check your mail
						</p>
						<p className="mt-1 text-zinc-600 dark:text-zinc-300">
							We sent a password reset link to <strong>{sentTo}</strong>.
							Follow the link to choose a new password.
						</p>
						<p className="mt-3 text-zinc-500 dark:text-zinc-400">
							Didn&apos;t receive it?{" "}
							<button
								type="button"
								onClick={sendReset}
								disabled={isSending}
								className="font-semibold text-brand-500 hover:text-brand-600 disabled:opacity-60 dark:text-green-400"
							>
								{isSending ? "Resending…" : "Resend"}
							</button>
						</p>
					</div>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							sendReset();
						}}
						className="flex flex-col gap-4"
					>
						<div className="inputLabelGroup">
							<label htmlFor="email-address" className="inputLabel">
								Email address
							</label>
							<input
								type="email"
								id="email-address"
								name="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								className="authInput"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						{errorMessage && (
							<p role="alert" className="text-xs text-red-600 dark:text-red-400">
								{errorMessage}
							</p>
						)}

						<button
							type="submit"
							disabled={isSending}
							className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-glow-green transition hover:bg-brand-600 disabled:opacity-60"
						>
							{isSending ? (
								<div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : (
								"Send reset instructions"
							)}
						</button>
					</form>
				)}

				<p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
					Go back to{" "}
					<Link
						href="/"
						className="font-semibold text-brand-500 hover:text-brand-600 dark:text-green-400"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ForgotPassword;

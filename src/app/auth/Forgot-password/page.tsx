"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatAuthError } from "@/utils/formatAuthError";
import { Logo } from "@/components/Logo";

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
		<div className="flex min-h-dvh flex-col bg-ground px-5 py-6 md:px-10 md:py-8">
			<Logo href="/" />

			<main className="m-auto w-full max-w-[420px] py-10">
				<h1 className="page-title">Reset password</h1>
				<p className="mt-2.5 text-[15px] text-ink-2">Enter your email and we&apos;ll send you a reset link.</p>

				{sentTo ? (
					<div className="slip-shadow mt-7">
						<div role="status" className="slip-torn px-5 pb-9 pt-5">
							<span className="stamp border-pos text-pos">Sent</span>
							<p className="mt-3 font-mono text-[13px] font-bold uppercase tracking-[0.06em]">Check your mail</p>
							<p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
								We sent a password reset link to <strong className="font-semibold text-ink">{sentTo}</strong>.
								Follow the link to choose a new password.
							</p>
							<p className="mt-4 text-[14px] text-ink-2">
								Didn&apos;t receive it?{" "}
								<button type="button" onClick={sendReset} disabled={isSending} className="link disabled:opacity-60">
									{isSending ? "Resending…" : "Resend"}
								</button>
							</p>
						</div>
					</div>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							sendReset();
						}}
						className="mt-7 flex flex-col gap-4"
					>
						<div>
							<label htmlFor="email-address" className="field-label">
								Email address
							</label>
							<input
								type="email"
								id="email-address"
								name="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								className="field"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						{errorMessage && (
							<p role="alert" className="text-[14px] font-medium text-neg">
								{errorMessage}
							</p>
						)}

						<button type="submit" disabled={isSending} className="key-enter mt-1 min-h-12 w-full text-[13px]">
							{isSending ? "Sending…" : "Send reset link"}
						</button>
					</form>
				)}

				<p className="mt-6 text-[14px] text-ink-2">
					Remembered it?{" "}
					<Link href="/" className="link">
						Back to log in
					</Link>
				</p>
			</main>
		</div>
	);
};

export default ForgotPassword;

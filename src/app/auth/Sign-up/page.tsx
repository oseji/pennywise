"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatAuthError } from "@/utils/formatAuthError";
import { Logo } from "@/components/Logo";
import { AuthShowcase } from "@/components/AuthShowcase";
import { PasswordField } from "@/components/ui/PasswordField";

type SignUpInfo = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const SignUp = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	const [signUpInfo, setSignUpInfo] = useState<SignUpInfo>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [signUpErrorMessage, setSignUpErrorMessage] = useState<string>("");

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setSignUpInfo((prev) => ({ ...prev, [name as keyof SignUpInfo]: value }));
	};

	const signUpAccount = async (email: string, password: string) => {
		setIsLoading(true);
		setSignUpErrorMessage("");
		try {
			const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredentials.user;
			if (user) router.push("/dashboard");
		} catch (err) {
			setSignUpErrorMessage(formatAuthError(err));
		} finally {
			setIsLoading(false);
		}
	};

	const passwordFields = [
		{ id: "password",         name: "password",        label: "Password" },
		{ id: "confirm-password", name: "confirmPassword", label: "Confirm password" },
	];

	return (
		<div className="grid min-h-dvh bg-ground lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
			<main className="flex flex-col px-5 py-6 md:px-10 md:py-8">
				<Logo href="/" />

				<div className="m-auto w-full max-w-[420px] py-10">
					<h1 className="page-title">Open an account</h1>
					<p className="mt-2.5 text-[15px] text-ink-2">A fresh roll for your income, spending and budgets.</p>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (signUpInfo.password !== signUpInfo.confirmPassword) {
								setSignUpErrorMessage("Passwords don't match. Please try again.");
								return;
							}
							signUpAccount(signUpInfo.email, signUpInfo.password);
						}}
						className="mt-7 flex flex-col gap-4"
					>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label htmlFor="first-name" className="field-label">First name</label>
								<input
									type="text"
									id="first-name"
									name="firstName"
									autoComplete="given-name"
									placeholder="Jane"
									className="field"
									value={signUpInfo.firstName}
									onChange={handleChange}
								/>
							</div>
							<div>
								<label htmlFor="last-name" className="field-label">Last name</label>
								<input
									type="text"
									id="last-name"
									name="lastName"
									autoComplete="family-name"
									placeholder="Doe"
									className="field"
									value={signUpInfo.lastName}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="email" className="field-label">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								className="field"
								value={signUpInfo.email}
								onChange={handleChange}
							/>
						</div>

						{passwordFields.map(({ id, name, label }) => (
							<PasswordField
								key={id}
								id={id}
								name={name}
								label={label}
								autoComplete="new-password"
								minLength={6}
								value={signUpInfo[name as keyof SignUpInfo]}
								onChange={handleChange}
							/>
						))}
						<p className="field-hint -mt-2">At least 6 characters.</p>

						{signUpErrorMessage && (
							<p role="alert" className="text-[14px] font-medium text-neg">
								{signUpErrorMessage}
							</p>
						)}

						<button type="submit" disabled={isLoading} className="key-enter mt-1 min-h-12 w-full text-[13px]">
							{isLoading ? "Opening account…" : "Create account"}
						</button>
					</form>

					<p className="mt-6 text-[14px] text-ink-2">
						Already have an account?{" "}
						<Link href="/" className="link">
							Log in
						</Link>
					</p>
				</div>
			</main>

			<AuthShowcase />
		</div>
	);
};

export default SignUp;

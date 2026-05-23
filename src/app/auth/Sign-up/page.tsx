"use client";

import { ChangeEvent, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatAuthError } from "@/utils/formatAuthError";
import { Eye, EyeOff } from "lucide-react";

import loginImage2 from "../../../assets/onboarding/login screen image 2.svg";

type SignUpInfo = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const SignUp = () => {
	const passwordErrorRef = useRef<HTMLParagraphElement>(null);
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);
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
		try {
			const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredentials.user;
			passwordErrorRef.current?.classList.add("hidePasswordError");
			if (user) router.push("/dashboard");
		} catch (err) {
			const message = formatAuthError(err);
			setSignUpErrorMessage(message);
			passwordErrorRef.current?.classList.remove("hidePasswordError");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-dvh flex-col lg:flex-row">
			{/* Form side */}
			<div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 dark:bg-dark-surface">
				<div className="w-full max-w-sm">
					{/* Brand */}
					<div className="mb-8 flex flex-col items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-glow-green">
							<span className="text-xl font-black text-white">P</span>
						</div>
						<div className="text-center">
							<h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
								Create your account
							</h1>
							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								Start tracking your finances with Pennywise
							</p>
						</div>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (signUpInfo.password !== signUpInfo.confirmPassword) {
								setSignUpErrorMessage("Passwords don't match. Please try again.");
								passwordErrorRef.current?.classList.remove("hidePasswordError");
								return;
							}
							signUpAccount(signUpInfo.email, signUpInfo.password);
						}}
						className="flex flex-col gap-4"
					>
						<div className="grid grid-cols-2 gap-3">
							<div className="inputLabelGroup">
								<label htmlFor="first-name" className="inputLabel">First name</label>
								<input
									type="text"
									id="first-name"
									name="firstName"
									placeholder="Jane"
									className="authInput"
									value={signUpInfo.firstName}
									onChange={handleChange}
								/>
							</div>
							<div className="inputLabelGroup">
								<label htmlFor="last-name" className="inputLabel">Last name</label>
								<input
									type="text"
									id="last-name"
									name="lastName"
									placeholder="Doe"
									className="authInput"
									value={signUpInfo.lastName}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="email" className="inputLabel">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								placeholder="you@example.com"
								className="authInput"
								value={signUpInfo.email}
								onChange={handleChange}
							/>
						</div>

						{[
							{ id: "password",         name: "password",         label: "Password",         visible: isPasswordVisible,        toggle: () => setIsPasswordVisible(!isPasswordVisible) },
							{ id: "confirm-password", name: "confirmPassword",  label: "Confirm password", visible: isConfirmPasswordVisible,  toggle: () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible) },
						].map(({ id, name, label, visible, toggle }) => (
							<div key={id} className="inputLabelGroup">
								<label htmlFor={id} className="inputLabel">{label}</label>
								<div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3
								                transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20
								                dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-brand-400/60">
									<input
										type={visible ? "text" : "password"}
										id={id}
										name={name}
										placeholder="••••••••"
										className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
										value={signUpInfo[name as keyof SignUpInfo]}
										onChange={handleChange}
									/>
									<button
										type="button"
										onClick={toggle}
										className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
										aria-label={visible ? "Hide password" : "Show password"}
									>
										{visible ? <EyeOff size={17} /> : <Eye size={17} />}
									</button>
								</div>
							</div>
						))}

						<p
							ref={passwordErrorRef}
							className="text-xs text-red-500 transition-all duration-200 hidePasswordError"
						>
							{signUpErrorMessage}
						</p>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white
							           shadow-glow-green transition hover:bg-brand-600 disabled:opacity-60 mt-1"
						>
							{isLoading ? (
								<div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : (
								"Create account"
							)}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
						Already have an account?{" "}
						<Link href="/" className="font-semibold text-brand-500 hover:text-brand-600 dark:text-green-400">
							Sign in
						</Link>
					</p>
				</div>
			</div>

			{/* Illustration side */}
			<div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-brand-400 to-brand-300 p-12">
				<Image
					src={loginImage2}
					alt="Pennywise illustration"
					className="max-h-[75vh] w-full object-contain drop-shadow-2xl"
				/>
			</div>
		</div>
	);
};

export default SignUp;

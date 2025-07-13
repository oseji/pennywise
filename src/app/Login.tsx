"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import loginImage from "../assets/onboarding/login screen image.svg";
import eyeIcon from "../assets/onboarding/eye icon.svg";

const Login = () => {
	const errorMessageRef = useRef<HTMLParagraphElement>(null);
	const [userEmail, setUserEmail] = useState<string>("");
	const [userPassword, setUserPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const router = useRouter();

	const formatSignInError = (error: unknown): string => {
		if (error instanceof FirebaseError) {
			switch (error.code) {
				case "auth/invalid-email":
					return "Please enter a valid email address.";
				case "auth/user-not-found":
					return "No account found with this email.";
				case "auth/wrong-password":
					return "Incorrect password. Please try again.";
				case "auth/invalid-credential":
					return "Your login credentials are invalid or expired. Please try again.";
				case "auth/network-request-failed":
					return "Network error. Please check your internet connection.";
				default:
					return error.message
						.replace("Firebase: ", "")
						.replace(/\(.*\)/, "")
						.trim();
			}
		}
		return "An unknown error occurred during sign-in.";
	};

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;
			console.log("Logged in user:", user);
			errorMessageRef.current?.classList.add("hidePasswordError");

			if (user) {
				router.push("/dashboard");
			}
			return user;
		} catch (err) {
			const message = formatSignInError(err);
			setErrorMessage(message);
			// display error message
			errorMessageRef.current?.classList.remove("hidePasswordError");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className=" flex flex-col md:flex-row md:justify-between items-center max-h-[100dvh] h-[100dvh] text-xs">
			<div className=" bg-white w-full flex flex-col items-center justify-center h-[100dvh] min-h-[100dvh]">
				<form
					action=""
					className=" rounded-lg px-10 py-8 shadow-lg w-[90%] md:w-[50%] lg:w-[500px]"
					onSubmit={(e) => {
						e.preventDefault();

						signIn(userEmail, userPassword);
					}}
				>
					<div className=" flex flex-row items-center justify-center gap-4 font-bold text-2xl mb-4">
						<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
							P
						</span>

						<span>Pennywise</span>
					</div>
					<p className=" text-center mb-4">Welcome back to Pennywise</p>
					<div className=" flex flex-col gap-4">
						<div className=" inputLabelGroup">
							<label htmlFor="email" className=" inputLabel">
								Email
							</label>
							<input
								type="email"
								placeholder="Email"
								id="email"
								className=" w-full rounded-lg border border-slate-200 p-3 outline-0 focus:outline-0"
								value={userEmail}
								onChange={(e) => setUserEmail(e.target.value)}
							/>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="password" className=" inputLabel">
								Password
							</label>

							<div className=" flex flex-row items-center gap-4 w-full rounded-lg border border-slate-200 p-3">
								<input
									type="password"
									placeholder="Password"
									className=" outline-0 focus:outline-0 w-full"
									value={userPassword}
									onChange={(e) => setUserPassword(e.target.value)}
								/>

								<Image
									src={eyeIcon}
									alt="Eye icon"
									className=" cursor-pointer"
								/>
							</div>
						</div>
					</div>

					<p
						className="hidePasswordError text-red-500 text-sm mt-2 transition-all ease-in-out duration-200"
						ref={errorMessageRef}
					>
						{errorMessage}
					</p>

					<Link href={"/auth/Forgot-password"}>
						<p className=" py-4 cursor-pointer underline text-[#2D6A4F]">
							Forgot password
						</p>
					</Link>

					<button
						type="submit"
						className=" w-full rounded-lg text-white bg-[#2D6A4F] py-3 mb-4"
					>
						{isLoading ? (
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto capitalize" />
						) : (
							"Login"
						)}
					</button>

					{/* <Link href={"/dashboard"}>
					
					</Link> */}

					<p className=" text-center">
						Don’t have an account ?{" "}
						<span className=" text-[#2D6A4F] cursor-pointer">
							<Link href={"/auth/Sign-up"}>Sign up here</Link>
						</span>
					</p>
				</form>
			</div>

			<Image
				src={loginImage}
				alt="Login Image"
				className=" h-[100dvh] min-h-[100dvh]"
			/>
		</div>
	);
};

export default Login;

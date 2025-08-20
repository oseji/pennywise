"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import loginImage from "../assets/onboarding/login screen image.svg";

const Login = () => {
	const errorMessageRef = useRef<HTMLParagraphElement>(null);
	const [userEmail, setUserEmail] = useState<string>("fake@gmail.com");
	const [userPassword, setUserPassword] = useState<string>("523577");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
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
		<div className=" flex flex-col lg:flex-row md:justify-between items-center max-h-[100dvh] h-[100dvh]">
			<div className=" bg-white w-full flex flex-col items-center justify-center h-[100dvh] min-h-[100dvh]">
				<form
					action=""
					className=" rounded-lg px-10 py-8 shadow-lg w-[90%] md:w-[50%] lg:w-[500px]"
					onSubmit={(e) => {
						e.preventDefault();

						signIn(userEmail, userPassword);
					}}
				>
					<div className="flex flex-row items-center justify-center gap-4 mb-4 text-xl font-bold md:text-2xl ">
						<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
							P
						</span>

						<span>Pennywise</span>
					</div>

					<p className="mb-4 text-center ">Welcome back to Pennywise</p>
					<div className="flex flex-col gap-4 ">
						<div className=" inputLabelGroup">
							<label htmlFor="email" className=" inputLabel">
								Email
							</label>
							<input
								type="email"
								placeholder="Email"
								id="email"
								className="w-full p-3 border rounded-lg border-slate-200 outline-0 focus:outline-0"
								value={userEmail}
								onChange={(e) => setUserEmail(e.target.value)}
							/>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="password" className=" inputLabel">
								Password
							</label>

							<div className="flex flex-row items-center w-full gap-4 p-3 border rounded-lg border-slate-200">
								<input
									type={isPasswordVisible ? "text" : "password"}
									placeholder="Password"
									className="w-full outline-0 focus:outline-0"
									value={userPassword}
									onChange={(e) => setUserPassword(e.target.value)}
								/>

								<span
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
									className="underline cursor-pointer "
								>
									{isPasswordVisible ? "Hide" : "Show"}
								</span>
							</div>
						</div>
					</div>

					<p
						className="mt-2 text-sm text-red-500 transition-all duration-200 ease-in-out hidePasswordError"
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
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="w-5 h-5 mx-auto capitalize border-2 border-white rounded-full border-t-transparent animate-spin" />
						) : (
							"Login"
						)}
					</button>

					{/* <Link href={"/dashboard"}>
					
					</Link> */}

					<p className="text-center ">
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
				className=" hidden lg:block h-[100dvh] min-h-[100dvh]"
			/>
		</div>
	);
};

export default Login;

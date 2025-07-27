"use client";

import { ChangeEvent, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { formatAuthError } from "@/utils/formatAuthError";

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
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState<boolean>(false);
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
		setSignUpInfo((prev) => ({
			...prev,
			[name as keyof SignUpInfo]: value,
		}));
	};

	const signUpAccount = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const userCredentials = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredentials.user;
			console.log(`user created: ${user.uid}`);

			// hide error message
			passwordErrorRef.current?.classList.add("hidePasswordError");

			if (user) {
				router.push("/dashboard");
			}
		} catch (err) {
			const message = formatAuthError(err);
			setSignUpErrorMessage(message);
			// display error message
			passwordErrorRef.current?.classList.remove("hidePasswordError");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className=" flex flex-col lg:flex-row lg:justify-between items-center max-h-[100dvh] h-[100dvh] text-xs">
			<div className=" bg-white w-full flex flex-col items-center justify-center h-[100dvh] min-h-[100dvh]">
				<form
					className=" rounded-lg px-10 py-8 shadow-lg w-[90%] md:w-[50%] lg:w-[500px]"
					onSubmit={(e) => {
						e.preventDefault();
						console.log(signUpInfo);
						signUpAccount(signUpInfo.email, signUpInfo.confirmPassword);

						if (
							signUpInfo.password &&
							signUpInfo.confirmPassword &&
							signUpInfo.password !== signUpInfo.confirmPassword
						) {
							alert("passwords don't match");

							passwordErrorRef.current?.classList.remove("hidePasswordError");
						}
					}}
				>
					<div className="flex flex-row items-center justify-center gap-4 mb-4 text-xl font-bold md:text-2xl ">
						<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
							P
						</span>

						<span>Pennywise</span>
					</div>

					<p className="mb-4 text-center ">
						Register to begin Pennywise account set up
					</p>

					<div className="flex flex-col gap-4 ">
						<div className=" inputLabelGroup">
							<label htmlFor="first-name" className=" inputLabel">
								First Name
							</label>

							<input
								type="text"
								placeholder="Enter your first name"
								id="first-name"
								name="firstName"
								className="w-full p-3 border rounded-lg border-slate-200 outline-0 focus:outline-0"
								value={signUpInfo.firstName}
								onChange={handleChange}
							/>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="last-name" className=" inputLabel">
								Last Name
							</label>

							<input
								type="text"
								placeholder="Enter your last name"
								id="last-name"
								name="lastName"
								className="w-full p-3 border rounded-lg border-slate-200 outline-0 focus:outline-0"
								value={signUpInfo.lastName}
								onChange={handleChange}
							/>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="email" className=" inputLabel">
								Email
							</label>

							<input
								type="email"
								placeholder="Enter your email address"
								id="email"
								name="email"
								className="w-full p-3 border rounded-lg border-slate-200 outline-0 focus:outline-0"
								value={signUpInfo.email}
								onChange={handleChange}
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
									id="password"
									name="password"
									className="w-full outline-0 focus:outline-0"
									value={signUpInfo.password}
									onChange={handleChange}
								/>

								<span
									className="underline cursor-pointer "
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
								>
									{isPasswordVisible ? "Hide" : "Show"}
								</span>
							</div>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="confirm-password" className=" inputLabel">
								Confirm Password
							</label>

							<div className="flex flex-row items-center w-full gap-4 p-3 border rounded-lg border-slate-200">
								<input
									type={isConfirmPasswordVisible ? "text" : "password"}
									placeholder="Password"
									id="confirm-password"
									name="confirmPassword"
									className="w-full outline-0 focus:outline-0"
									value={signUpInfo.confirmPassword}
									onChange={handleChange}
								/>

								<span
									className="underline cursor-pointer "
									onClick={() =>
										setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
									}
								>
									{isConfirmPasswordVisible ? "Hide" : "Show"}
								</span>
							</div>
						</div>
					</div>

					<p
						className={`text-red-500 text-sm mt-2 transition-all ease-in-out duration-200 hidePasswordError`}
						ref={passwordErrorRef}
					>
						{signUpErrorMessage}
					</p>

					<button
						type="submit"
						className=" w-full rounded-lg text-white bg-[#2D6A4F] py-3 my-4 capitalize"
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="w-5 h-5 mx-auto border-2 border-white rounded-full border-t-transparent animate-spin" />
						) : (
							"sign up"
						)}
					</button>

					<p className="text-center ">
						Already have an account ?
						<span className=" text-[#2D6A4F] cursor-pointer">
							<Link href={"/"}> Sign in here</Link>
						</span>
					</p>
				</form>
			</div>

			<Image
				src={loginImage2}
				alt="Login Image"
				className=" hidden lg:block  h-[100dvh] min-h-[100dvh]"
			/>
		</div>
	);
};

export default SignUp;

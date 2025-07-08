"use client";

import Image from "next/image";
import Link from "next/link";

import loginImage from "../assets/onboarding/login screen image.svg";
import eyeIcon from "../assets/onboarding/eye icon.svg";

const Login = () => {
	return (
		<div className=" flex flex-col md:flex-row md:justify-between items-center max-h-[100dvh] h-[100dvh] text-xs">
			<div className=" bg-white w-full flex flex-col items-center justify-center h-[100dvh] min-h-[100dvh]">
				<form
					action=""
					className=" rounded-lg px-10 py-8 shadow-lg w-[90%] md:w-[50%] lg:w-[500px]"
					onClick={(e) => e.preventDefault()}
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
								/>

								<Image
									src={eyeIcon}
									alt="Eye icon"
									className=" cursor-pointer"
								/>
							</div>
						</div>
					</div>

					<Link href={"/auth/Forgot-password"}>
						<p className=" py-4 cursor-pointer underline text-[#2D6A4F]">
							Forgot password
						</p>
					</Link>

					<Link href={"/Dashboard"}>
						<button
							type="submit"
							className=" w-full rounded-lg text-white bg-[#2D6A4F] py-3 mb-4"
						>
							Login
						</button>
					</Link>

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

"use client";

import Image from "next/image";
import Link from "next/link";

import loginImage2 from "../../../assets/onboarding/login screen image 2.svg";
import eyeIcon from "../../../assets/onboarding/eye icon.svg";

const SignUp = () => {
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

					<p className=" text-center mb-4">
						Register to begin Pennywise account set up
					</p>

					<div className=" flex flex-col gap-4">
						<div className=" inputLabelGroup">
							<label htmlFor="first-name" className=" inputLabel">
								First Name
							</label>

							<input
								type="text"
								placeholder="Enter your first name"
								id="first-name"
								className=" w-full rounded-lg border border-slate-200 p-3 outline-0 focus:outline-0"
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
								className=" w-full rounded-lg border border-slate-200 p-3 outline-0 focus:outline-0"
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
									id="password"
									className=" outline-0 focus:outline-0 w-full"
								/>

								<Image
									src={eyeIcon}
									alt="Eye icon"
									className=" cursor-pointer"
								/>
							</div>
						</div>

						<div className=" inputLabelGroup">
							<label htmlFor="confirm-password" className=" inputLabel">
								Confirm Password
							</label>

							<div className=" flex flex-row items-center gap-4 w-full rounded-lg border border-slate-200 p-3">
								<input
									type="password"
									placeholder="Password"
									id="confirm-password"
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

					<button
						type="submit"
						className=" w-full rounded-lg text-white bg-[#2D6A4F] py-3 my-4 capitalize"
					>
						sign up
					</button>

					<p className=" text-center">
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
				className=" h-[100dvh] min-h-[100dvh]"
			/>
		</div>
	);
};

export default SignUp;

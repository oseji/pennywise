"use client";
import Link from "next/link";

import { useRef, useState } from "react";

const ForgotPassword = () => {
	const alertModalRef = useRef<HTMLDivElement>(null);

	const [hide, setHide] = useState(true);

	const showAlertModal = () => {
		setHide(false);
		setTimeout(() => setHide(true), 5000);
	};

	return (
		<div className="  max-h-[100dvh] h-[100dvh]  relative">
			<div className=" bg-white w-full flex flex-col items-center justify-center h-[100dvh] min-h-[100dvh]">
				<form
					action=""
					className=" rounded-lg px-10 py-8 shadow-lg w-[90%] md:w-[50%] lg:w-[500px]"
					onClick={(e) => e.preventDefault()}
				>
					<div className="flex flex-row items-center justify-center gap-4 mb-4 text-xl font-bold md:text-2xl">
						<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
							P
						</span>

						<span>Pennywise</span>
					</div>

					<h2 className="mb-4 text-lg font-bold text-center ">
						Reset your password
					</h2>

					<p className="mb-4 text-center text-slate-400">
						Enter your email below and we’ll send you instructions on how to
						reset your password.
					</p>

					<div className="flex flex-col gap-4 ">
						<div className=" inputLabelGroup">
							<label htmlFor="email-address" className=" inputLabel">
								Email address
							</label>
							<input
								type="email"
								placeholder="Email"
								id="email-address"
								className="w-full p-3 border rounded-lg border-slate-200 outline-0 focus:outline-0"
							/>
						</div>
					</div>

					<button
						type="submit"
						className=" w-full rounded-lg text-white bg-[#2D6A4F] py-3 my-4 font-semibold"
						onClick={showAlertModal}
					>
						Send reset instructions
					</button>

					<p className="text-center text-slate-400">
						Go back to
						<span className=" underline cursor-pointer text-[#2D6A4F] ">
							<Link href={"/"}> Sign in</Link>
						</span>
					</p>
				</form>
			</div>

			{/* alert modal */}
			<div
				className={`absolute top-5 left-1/2 -translate-x-1/2 text-center rounded-lg opacity-90 bg-white shadow-xl w-80 flex flex-col gap-4 p-9 transition ease-in-out duration-300  ${
					hide ? "hideAlertModal" : ""
				}`}
				ref={alertModalRef}
			>
				<h1 className="text-lg font-bold ">Check your mail</h1>

				<p>
					We sent a password reset link to your email. Please click the link to
					reset your password.
				</p>

				<p>
					Didn’t received an email?{" "}
					<span className=" underline text-[#101828] cursor-pointer">
						Click to Resend
					</span>
				</p>
			</div>
		</div>
	);
};

export default ForgotPassword;

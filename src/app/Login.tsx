"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff } from "lucide-react";

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
                password,
            );
            const user = userCredential.user;
            errorMessageRef.current?.classList.add("hidePasswordError");
            if (user) router.push("/dashboard");
            return user;
        } catch (err) {
            const message = formatSignInError(err);
            setErrorMessage(message);
            errorMessageRef.current?.classList.remove("hidePasswordError");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-dvh lg:flex-row">
            {/* Form side */}
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 bg-white dark:bg-dark-surface">
                <div className="w-full max-w-sm">
                    {/* Brand */}
                    <div className="flex flex-col items-center gap-3 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 shadow-glow-green">
                            <span className="text-xl font-black text-white">
                                P
                            </span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Welcome back
                            </h1>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                Sign in to your Pennywise account
                            </p>
                        </div>
                    </div>

                    {/* Demo banner */}
                    <div className="px-4 py-3 mb-6 text-sm border rounded-xl border-brand-200 bg-brand-50 dark:border-brand-600/30 dark:bg-brand-600/10">
                        <p className="font-semibold text-brand-600 dark:text-green-400">
                            Demo credentials pre-filled
                        </p>
                        <p className="mt-0.5 text-xs text-brand-500/80 dark:text-green-500/70">
                            Hit Login to explore the app without creating an
                            account.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            signIn(userEmail, userPassword);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="inputLabelGroup">
                            <label htmlFor="email" className="inputLabel">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                className="authInput"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>

                        <div className="inputLabelGroup">
                            <label htmlFor="password" className="inputLabel">
                                Password
                            </label>
                            <div className="flex items-center gap-3 px-4 py-3 transition bg-white border rounded-xl border-zinc-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-brand-400/60">
                                <input
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
                                    id="password"
                                    placeholder="••••••••"
                                    className="w-full text-sm bg-transparent outline-none text-zinc-900 placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500"
                                    value={userPassword}
                                    onChange={(e) =>
                                        setUserPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsPasswordVisible(!isPasswordVisible)
                                    }
                                    className="transition shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                    aria-label={
                                        isPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <p
                            ref={errorMessageRef}
                            className="text-xs text-red-500 transition-all duration-200 hidePasswordError"
                        >
                            {errorMessage}
                        </p>

                        <Link
                            href="/auth/Forgot-password"
                            className="-mt-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-green-400 dark:hover:text-green-300"
                        >
                            Forgot password?
                        </Link>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 text-sm font-semibold text-white transition rounded-xl bg-brand-500 shadow-glow-green hover:bg-brand-600 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 mx-auto border-2 border-white rounded-full animate-spin border-t-transparent" />
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/Sign-up"
                            className="font-semibold text-brand-500 hover:text-brand-600 dark:text-green-400"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Illustration side */}
            <div className="items-center justify-center hidden p-12 lg:flex lg:flex-1 bg-gradient-to-br from-brand-500 to-brand-400">
                <Image
                    src={loginImage}
                    alt="Pennywise illustration"
                    className="max-h-[75vh] w-full object-contain drop-shadow-2xl"
                />
            </div>
        </div>
    );
};

export default Login;

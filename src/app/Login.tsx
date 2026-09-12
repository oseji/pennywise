"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthShowcase } from "@/components/AuthShowcase";

const Login = () => {
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
        setErrorMessage("");
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );
            const user = userCredential.user;
            if (user) router.push("/dashboard");
            return user;
        } catch (err) {
            setErrorMessage(formatSignInError(err));
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
                        <Logo size="lg" />
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
                                name="email"
                                autoComplete="email"
                                required
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
                            <div className="flex items-center gap-3 px-4 py-3 transition bg-white border rounded-xl border-zinc-500 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-400/50 dark:border-zinc-500 dark:bg-zinc-900 dark:focus-within:border-brand-400">
                                <input
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full text-sm bg-transparent outline-none text-zinc-900 placeholder-zinc-500 dark:text-zinc-100 dark:placeholder-zinc-400"
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
                                    className="iconBtn -my-3 -mr-3"
                                    aria-label={
                                        isPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={isPasswordVisible}
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff size={17} aria-hidden />
                                    ) : (
                                        <Eye size={17} aria-hidden />
                                    )}
                                </button>
                            </div>
                        </div>

                        {errorMessage && (
                            <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                                {errorMessage}
                            </p>
                        )}

                        <Link
                            href="/auth/Forgot-password"
                            className="-mt-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-green-400 dark:hover:text-green-300"
                        >
                            Forgot password?
                        </Link>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 shadow-glow-green"
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

            <AuthShowcase />
        </div>
    );
};

export default Login;

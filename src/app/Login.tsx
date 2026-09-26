"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Logo } from "@/components/Logo";
import { AuthShowcase } from "@/components/AuthShowcase";
import { PasswordField } from "@/components/ui/PasswordField";

const Login = () => {
    const [userEmail, setUserEmail] = useState<string>("fake@gmail.com");
    const [userPassword, setUserPassword] = useState<string>("523577");
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
        <div className="grid min-h-dvh bg-ground lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <main className="flex flex-col px-5 py-6 md:px-10 md:py-8">
                <Logo />

                <div className="m-auto w-full max-w-[400px] py-10">
                    <h1 className="page-title">Log in</h1>
                    <p className="mt-2.5 text-[15px] text-ink-2">
                        Pick up where your roll left off.
                    </p>

                    <div className="mt-6 flex items-start gap-3 rounded-[6px] border border-dashed border-rule-2 px-3.5 py-3">
                        <span className="stamp mt-0.5 border-pos text-pos">Demo</span>
                        <p className="text-[14px] leading-snug text-ink-2">
                            Demo credentials are filled in. Log in to explore without creating an account.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            signIn(userEmail, userPassword);
                        }}
                        className="mt-6 flex flex-col gap-4"
                    >
                        <div>
                            <label htmlFor="email" className="field-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                required
                                placeholder="you@example.com"
                                className="field"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>

                        <PasswordField
                            id="password"
                            name="password"
                            label="Password"
                            autoComplete="current-password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                        />

                        {errorMessage && (
                            <p role="alert" className="text-[14px] font-medium text-neg">
                                {errorMessage}
                            </p>
                        )}

                        <Link href="/auth/Forgot-password" className="link -mt-1 self-start text-[14px]">
                            Forgot password?
                        </Link>

                        <button type="submit" disabled={isLoading} className="key-enter mt-1 min-h-12 w-full text-[13px]">
                            {isLoading ? "Checking…" : "Log in"}
                        </button>
                    </form>

                    <p className="mt-6 text-[14px] text-ink-2">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/Sign-up" className="link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>

            <AuthShowcase />
        </div>
    );
};

export default Login;

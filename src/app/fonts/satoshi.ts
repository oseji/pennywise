// app/fonts/satoshi.ts
import localFont from "next/font/local";

export const satoshiVariable = localFont({
  src: "./Satoshi-Variable.ttf",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-satoshi-variable",
});

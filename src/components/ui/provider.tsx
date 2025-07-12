"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ReactNode } from "react";

const theme = extendTheme(); // optional

export function Provider({ children }: { children: ReactNode }) {
	return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

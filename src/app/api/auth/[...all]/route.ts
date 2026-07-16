import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Direct JavaScript style implementation with simple type mapping
export const { GET, POST } = toNextJsHandler(auth) as any;
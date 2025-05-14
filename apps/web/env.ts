import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
    extends: [vercel()],
    client: {
        NEXT_PUBLIC_SSE_URL: z.string().url(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_SSE_URL: process.env.NEXT_PUBLIC_SSE_URL,
    },
    skipValidation:
        !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
    extends: [vercel()],
    shared: {
        NODE_ENV: z
            .enum(["development", "production", "test"])
            .default("development"),
    },
    server: {
        POSTGRES_URL: z.string().url(),
        CAMERA_IMAGE_URL: z.string().url(),
        CAMERA_USERNAME: z.string(),
        CAMERA_PASSWORD: z.string(),
        CHECK_INTERVAL: z.string().transform((val) => parseInt(val)),
        AUTH_DIGEST: z.string(),
        MOONDREAM_API_KEY: z.string(),
    },
    experimental__runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
    },
    skipValidation:
        !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
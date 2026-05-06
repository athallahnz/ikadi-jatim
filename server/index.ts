// server/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { generateUstadzResponse } from "./rag-service";

import type { AskUstadzPayload, AskUstadzResponse } from "../src/types/api";

const app = express();
const PORT = process.env.PORT || 3000;

// Di server/index.ts atau app.ts
app.use(cors({
    origin: [
        "https://ikadijatim.org",
        "https://www.ikadijatim.org",
        "https://ikadi-jatim.vercel.app",
        "http://localhost:5173", // Tetap izinkan untuk testing lokal
    ],
    methods: ["POST", "GET"],
    credentials: true,
}));

app.use(express.json());

app.post(
    "/api/chat",
    async (
        // Menggunakan unknown alih-alih {} untuk menghindari error ESLint
        req: Request<unknown, unknown, AskUstadzPayload>,
        res: Response<AskUstadzResponse | { error: string }>,
    ) => {
        try {
            const { message } = req.body;

            if (!message || message.trim() === "") {
                return res.status(400).json({
                    error: "Pesan tidak boleh kosong",
                });
            }

            console.log(`[LOG] Menerima pertanyaan: "${message}"`);

            const responseData = await generateUstadzResponse(message);
            res.status(200).json(responseData);
        } catch (error: unknown) {
            console.error("[ERROR] Server failure:", error);
            res.status(500).json({
                error: "Terjadi kesalahan internal pada server RAG.",
            });
        }
    },
);

app.listen(PORT, () => {
    console.log(`🚀 RAG Server IKADI berjalan di http://localhost:${PORT}`);
});

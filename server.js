import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({ apiKey: "SUA_CHAVE_AQUI" });

app.post("/asla", async (req, res) => {
    const r = await client.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
            { role: "system", content: "Você é a ASLA, IA corporativa da Ascendant." },
            { role: "user", content: req.body.message }
        ]
    });    
    res.json({ reply: r.choices[0].message.content });
});

app.listen(3000, () => console.log("ASLA online em http://localhost:3000"));

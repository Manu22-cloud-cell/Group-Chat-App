const genAI = require("../config/gemini");

exports.predictText = async (req, res) => {
    try {
        const { text, userStyle } = req.body;
        if (!text) return res.json({ suggestions: [] });

        const prompt = `
You are a chat assistant.
User typing: "${text}"

Suggest 3 short next phrases (max 3 words each).
Tone: ${userStyle || "neutral"}

Return ONLY a JSON array of strings.
`;

        const result = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        console.log(result.text);
        const raw = result.text;
        const clean = raw.replace(/```json|```/g, "").trim();

        res.json({ suggestions: JSON.parse(clean) });
    } catch (err) {
        console.error("Predictive typing failed", err);
        res.json({ suggestions: [] });
    }
};

exports.smartReplies = async (req, res) => {
    try {
        const { message, userStyle } = req.body;

        const prompt = `
You are a chat assistant.
Incoming message: "${message}"

Generate 3 short reply options.
Tone: ${userStyle || "neutral"}

Rules:
- Each reply max 8 words
- Friendly and natural
- Return ONLY a JSON array
`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        console.log(result.text);
        const raw = result.text;
        const clean = raw.replace(/```json|```/g, "").trim();

        res.json({ replies: JSON.parse(clean) });
    } catch (err) {
        console.error("Smart reply failed", err);
        res.json({ replies: [] });
    }
};

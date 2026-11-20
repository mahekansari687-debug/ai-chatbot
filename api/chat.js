module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body || {};

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a valid message."
            });
        }

        if (message.length > 4000) {
            return res.status(400).json({
                error: "Message is too long."
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Gemini API key is not configured."
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: message }]
                    }],
                    systemInstruction: {
                        parts: [{
                            text: "You are a helpful and friendly AI assistant. Give clear, accurate and simple answers."
                        }]
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(502).json({
                error: data.error?.message || "Gemini service failed."
            });
        }

        const answer = (data.candidates?.[0]?.content?.parts || [])
            .map(part => part.text || "")
            .join("\n")
            .trim();

        return res.status(200).json({
            reply: answer || "Sorry, I could not generate a response."
        });

    } catch (error) {
        console.error("Chatbot error:", error);

        return res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
};
/**
 * AI Service for Faculty Notice Refinement
 * Calls Google Gemini API if configured; falls back to basic rules if not.
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getIsGeminiConfigured = () => {
    return process.env.GEMINI_API_KEY &&
           process.env.GEMINI_API_KEY !== "your_gemini_api_key" &&
           process.env.GEMINI_API_KEY.trim() !== "";
};

exports.refineNoticeText = async (text) => {
    if (getIsGeminiConfigured()) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are an AI assistant for a college campus portal. A faculty member or admin has written a notice. Refine the text of the notice to make it clean, professional, and well-structured. Correct any grammar mistakes. Do not change the original facts or dates. If the notice is long (more than 200 characters), add a brief, clear "**TL;DR:** [One sentence summary]" at the very beginning, followed by a horizontal rule (---) and then the refined text. Here is the notice text:\n\n${text}`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            if (responseText) {
                return responseText.trim();
            }
        } catch (error) {
            console.error("[Gemini AI Service] Error refining text, falling back to mock:", error.message);
        }
    }

    // Simulate API delay for mock
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic cleaning logic as a mock fallback
    let refined = text.trim();

    // Example: If it's too long, add a TL;DR
    if (refined.length > 200 && !refined.toLowerCase().includes("tl;dr")) {
        const sentences = refined.split(/[.!?]/);
        const summary = sentences[0] + ".";
        refined = `**TL;DR:** ${summary}\n\n---\n\n${refined}`;
    }

    // Capitalize first letters of sentences
    refined = refined.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    return refined;
};

exports.suggestCategory = async (text) => {
    if (getIsGeminiConfigured()) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Classify the following campus notice text into exactly one of these categories: "Academic", "Placements", "Events", "Sports", "Administrative", "General".
Output ONLY the category name. Do not include quotes, periods, or extra explanation.

Notice text:
${text}`;

            const result = await model.generateContent(prompt);
            const category = result.response.text().trim();
            const validCategories = ["Academic", "Placements", "Events", "Sports", "Administrative", "General"];
            
            if (validCategories.includes(category)) {
                return category;
            }
            
            for (const cat of validCategories) {
                if (category.toLowerCase().includes(cat.toLowerCase())) {
                    return cat;
                }
            }
        } catch (error) {
            console.error("[Gemini AI Service] Error suggesting category, falling back to mock:", error.message);
        }
    }

    const categories = ["Academic", "Placements", "Events", "Sports", "Administrative", "General"];
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.includes("exam") || lowercaseText.includes("result") || lowercaseText.includes("assignment")) return "Academic";
    if (lowercaseText.includes("job") || lowercaseText.includes("interview") || lowercaseText.includes("company") || lowercaseText.includes("hiring")) return "Placements";
    if (lowercaseText.includes("football") || lowercaseText.includes("match") || lowercaseText.includes("tournament")) return "Sports";
    if (lowercaseText.includes("workshop") || lowercaseText.includes("seminar") || lowercaseText.includes("fest")) return "Events";

    return "General";
};

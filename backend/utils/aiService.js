/**
 * Mock AI Service for Faculty Notice Refinement
 * In a real-world scenario, this would call OpenAI, Claude, or Google Gemini API.
 */

exports.refineNoticeText = async (text) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic cleaning logic as a mock
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
    const categories = ["Academic", "Placements", "Events", "Sports", "Administrative", "General"];
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.includes("exam") || lowercaseText.includes("result") || lowercaseText.includes("assignment")) return "Academic";
    if (lowercaseText.includes("job") || lowercaseText.includes("interview") || lowercaseText.includes("company") || lowercaseText.includes("hiring")) return "Placements";
    if (lowercaseText.includes("football") || lowercaseText.includes("match") || lowercaseText.includes("tournament")) return "Sports";
    if (lowercaseText.includes("workshop") || lowercaseText.includes("seminar") || lowercaseText.includes("fest")) return "Events";

    return "General";
};

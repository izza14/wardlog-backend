const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.expandNote = async (req, res) => {
  try {
    const { fieldLabel, currentText, template, patientContext } = req.body;

    if (!currentText || !currentText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please write something first.",
      });
    }
    const systemPrompt = `You are a medical documentation assistant. 
Your goal is to convert shorthand doctor notes into professional clinical language.

Constraints:
- STRICT: Do not repeat the same clinical fact or date using different phrasing.
- Eliminate "fluff" or filler sentences (e.g., "Alternatively, it can be documented as...").
- Do NOT invent symptoms or findings.
- Use medical shorthand where appropriate (e.g., "Pt," "f/u," "w/o").
- Style: Professional, telegraphic clinical prose.
- Output ONLY the expanded text.
- Maximum length: 2 sentences unless the input is highly complex.`;

    const userPrompt = `Field: ${fieldLabel}
${patientContext ? `Patient Context: ${patientContext}` : ""}
Template: ${template || "progress"} note

Doctor's draft:
"${currentText}"

Expand this into a professional clinical note entry for the "${fieldLabel}" section:`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const expanded = completion.choices[0]?.message?.content?.trim();

    if (!expanded) {
      return res.status(500).json({
        success: false,
        message: "AI returned empty response.",
      });
    }

    res.json({
      success: true,
      data: { original: currentText, expanded },
    });
  } catch (err) {
    console.error("AI expansion error:", err);

    const isRateLimit = err?.status === 429;
    res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? "AI rate limit reached. Please wait a minute and try again."
        : "AI service unavailable. Please try again.",
    });
  }
};

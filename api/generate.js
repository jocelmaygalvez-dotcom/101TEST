export default async function handler(req, res) {
  // Enforce secure POST communication channel
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { lessonTitle } = req.body;
    if (!lessonTitle) {
      return res.status(400).json({ error: 'Missing Required Parameter: lessonTitle' });
    }

    // Safely reads the hidden key inside Vercel's cloud settings
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'System configuration error: Groq API Key missing.' });
    }

    const systemPrompt = "You are an expert curriculum design assistant for DepEd Senior High School Philippines. Populate detailed, professional academic content structures tailored for Grade 12 Empowerment Technology lessons.";
    const userPrompt = `Generate structured lesson items for an Empowerment Technology Lesson titled: "${lessonTitle}". Provide outputs clearly segmented for: References, Learning Objectives, and brief instructional cues for the 5E cycle stages. Keep responses concise and highly actionable for immediate teaching use.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: `Groq Cloud Engine Error: ${errorText}` });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

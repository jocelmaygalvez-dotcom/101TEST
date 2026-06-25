export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { lessonTitle, learningArea } = req.body;
    if (!lessonTitle) {
      return res.status(400).json({ error: 'Missing Required Parameter: lessonTitle' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'System configuration error: Groq API Key missing.' });
    }

    const systemPrompt = "You are an expert curriculum design assistant for DepEd Senior High School Philippines. Populate detailed, professional academic content structures tailored for the Strengthened SHS Curriculum.";
    const userPrompt = `Generate a complete structured lesson plan for a Senior High School Lesson titled: "${lessonTitle}" under the subject area "${learningArea || 'Empowerment Technology'}". 
    Provide the output clearly separated into these EXACT sections so the user can easily view and distribute them:
    
    [REFERENCES]
    (Provide relevant textbook resources and links)
    
    [OBJECTIVES]
    (Provide clear KSA objectives)
    
    [INTEGRATION]
    (Provide meaningful cross-curricular links)
    
    [ENGAGE]
    (5-minute hook activity)
    
    [EXPLORE]
    (15-minute hands-on research or activity)
    
    [EXPLAIN]
    (Core concepts discussion)
    
    [ELABORATE]
    (Deep real-world application)
    
    [EVALUATE]
    (Formative assessment strategies and criteria)`;

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

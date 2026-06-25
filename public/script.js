// ==========================================
// 1. STATE MANAGEMENT (5Es Framework Memory)
// ==========================================
const eFrameworkData = {
  engage: "",
  explore: "",
  explain: "",
  elaborate: "",
  evaluate: "",
  reflection: ""
};

const eeSelector = document.getElementById('eeSelector');
const eeContent = document.getElementById('eeContent');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiStatus = document.getElementById('aiStatus');
const dlpForm = document.getElementById('dlpForm');

if (eeSelector) {
  eeSelector.dataset.preval = "engage";
}

eeSelector?.addEventListener('change', (e) => {
  const previousValue = eeSelector.dataset.preval || "engage";
  eFrameworkData[previousValue] = eeContent.value;
  
  const newValue = e.target.value;
  eeContent.value = eFrameworkData[newValue] || "";
  eeSelector.dataset.preval = newValue;
});

// ==========================================
// 2. RUNTIME ROUTING SWITCH (CodePen vs Vercel Production)
// ==========================================
aiGenerateBtn?.addEventListener('click', async () => {
  const lessonTitleField = document.getElementById('lessonTitleInput');
  const lessonTitle = lessonTitleField?.value.trim();
  
  if (!lessonTitle) {
    alert("Please enter a Lesson Title first so the AI knows what to generate content for!");
    lessonTitleField?.focus();
    return;
  }

  aiStatus.textContent = "Connecting to AI Online Engine... Please wait...";
  aiStatus.className = "status-msg loading";
  aiGenerateBtn.disabled = true;

  const isBrowserSandbox = window.location.hostname.includes("codepen") || window.location.hostname === "localhost" || window.location.hostname === "";

  try {
    let aiTextContent = "";

    if (isBrowserSandbox) {
      // --- MODE A: DIRECT CODEPEN SANDBOX (Uses fallback key config) ---
      console.log("Routing Profile: Sandbox mode active.");
      const apiKey = "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";
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // 🌟 FIXED MODEL NAME HERE TOO
          messages: [
            { role: "system", content: "You are an expert curriculum design assistant for DepEd Senior High School Philippines. Populate detailed, professional academic content structures tailored for Grade 12 Empowerment Technology lessons." },
            { role: "user", content: `Generate structured lesson items for an Empowerment Technology Lesson titled: "${lessonTitle}". Provide outputs clearly segmented for: References, Learning Objectives, and brief instructional cues for the 5E cycle stages. Keep responses concise and highly actionable for immediate teaching use.` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Groq direct connection failed with status: ${response.status}`);
      const data = await response.json();
      aiTextContent = data.choices[0].message.content;

    } else {
      // --- MODE B: VERCEL DEPLOYMENT PRODUCTION (Secure Serverless Architecture) ---
      console.log("Routing Profile: Vercel Production Active.");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonTitle: lessonTitle })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Serverless endpoint exception: ${response.status}`);
      aiTextContent = data.choices[0].message.content;
    }

    const targetTextarea = document.getElementById('ksaObjectives');
    if (targetTextarea) {
      targetTextarea.value = aiTextContent;
    }
    
    aiStatus.textContent = "Generation complete! Content successfully synchronized into Objectives field.";
    aiStatus.className = "status-msg success";
    
  } catch (error) {
    console.error("AI Operations Error Track:", error);
    aiStatus.textContent = `Error syncing with generator pipeline: ${error.message}`;
    aiStatus.className = "status-msg loading";
  } finally {
    aiGenerateBtn.disabled = false;
  }
});

// ==========================================
// 3. STORAGE & PRESERVATION
// ==========================================
dlpForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (eeSelector && eeContent) {
    eFrameworkData[eeSelector.value] = eeContent.value;
  }
  console.log("Form data stored successfully:", eFrameworkData);
  alert("Daily Lesson Plan configurations saved successfully!");
});

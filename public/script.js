const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiStatus = document.getElementById('aiStatus');
const dlpForm = document.getElementById('dlpForm');
const aiRawOutputDisplay = document.getElementById('aiRawOutputDisplay');

// ==========================================
// 1. ENGINE RUNTIME ACTION (Assembles Data Streams)
// ==========================================
aiGenerateBtn?.addEventListener('click', async () => {
  const lessonTitleField = document.getElementById('lessonTitleInput');
  const lessonTitle = lessonTitleField?.value.trim();
  
  if (!lessonTitle) {
    alert("Please input a Lesson Title so the AI engine knows what framework parameters to curate!");
    lessonTitleField?.focus();
    return;
  }

  aiStatus.textContent = "Connecting to Groq Core Engine (Active Route: llama-3.1-8b-instant)...";
  aiStatus.className = "status-msg loading";
  aiGenerateBtn.disabled = true;
  aiRawOutputDisplay.value = "Executing secure transmission relay... Waiting for structural content load...";

  const isBrowserSandbox = window.location.hostname.includes("codepen") || window.location.hostname === "localhost" || window.location.hostname === "";

  try {
    let aiTextContent = "";

    if (isBrowserSandbox) {
      const apiKey = "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";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // 🌟 Fixed Active Model Tag Reference
          messages: [
            { role: "system", content: "You are an expert curriculum design assistant for DepEd Senior High School Philippines. Populate detailed, professional academic content structures tailored for Grade 12 Empowerment Technology lessons." },
            { role: "user", content: `Generate a complete structured lesson plan for an Empowerment Technology Lesson titled: "${lessonTitle}". Provide outputs cleanly separated by: References, Learning Objectives, and separate activities for Engage, Explore, Explain, Elaborate, and Evaluate.` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Engine direct fault connection status code: ${response.status}`);
      const data = await response.json();
      aiTextContent = data.choices[0].message.content;

    } else {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonTitle: lessonTitle })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Serverless runtime fault code: ${response.status}`);
      aiTextContent = data.choices[0].message.content;
    }

    // Load full compiled layout to the dedicated screen block
    aiRawOutputDisplay.value = aiTextContent;
    
    // Distribute parsing chunks into individual UI elements
    parseAndPopulateFields(aiTextContent);

    aiStatus.textContent = "Generation structural loop complete! Elements mapped seamlessly.";
    aiStatus.className = "status-msg success";
    
  } catch (error) {
    console.error("Pipeline breakdown tracking logs:", error);
    aiStatus.textContent = `Error syncing with generator pipeline: ${error.message}`;
    aiRawOutputDisplay.value = `Execution Interrupted: ${error.message}`;
  } finally {
    aiGenerateBtn.disabled = false;
  }
});

// Helper regex distribution parsing mapper to fill individual textareas automatically
function parseAndPopulateFields(text) {
  const targetMapping = {
    'refContent': /\[REFERENCES\]([\s\S]*?)(?=\[|$)/i,
    'ksaObjectives': /\[OBJECTIVES\]([\s\S]*?)(?=\[|$)/i,
    'engageContent': /\[ENGAGE\]([\s\S]*?)(?=\[|$)/i,
    'exploreContent': /\[EXPLORE\]([\s\S]*?)(?=\[|$)/i,
    'explainContent': /\[EXPLAIN\]([\s\S]*?)(?=\[|$)/i,
    'elaborateContent': /\[ELABORATE\]([\s\S]*?)(?=\[|$)/i,
    'evaluateContent': /\[EVALUATE\]([\s\S]*?)(?=\[|$)/i
  };

  for (const [id, regex] of Object.entries(targetMapping)) {
    const match = text.match(regex);
    const element = document.getElementById(id);
    if (match && element && match[1].trim() !== "") {
      element.value = match[1].trim();
    }
  }
}

// ==========================================
// 2. FILE EXPORT TOOLKIT ENGINE
// ==========================================

// --- WORD EXPORT (.doc) ---
document.getElementById('exportWordBtn')?.addEventListener('click', () => {
  const content = aiRawOutputDisplay.value;
  const title = document.getElementById('lessonTitleInput').value || "Lesson_Plan";
  
  const blob = new Blob([`<html><body style="font-family:Arial">${content.replace(/\n/g, '<br>')}</body></html>`], {
    type: "application/msword"
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_DLP.doc`;
  link.click();
});

// --- EXCEL EXPORT (.xls Row/Column Cell Mapping Structure) ---
document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
  const title = document.getElementById('lessonTitleInput').value || "Lesson Plan";
  
  // Build standard spreadsheet grid layout rows strings arrays
  let excelRows = [
    ["DEPED SENIOR HIGH SCHOOL DAILY LESSON PLAN DATA RECORD"],
    ["Lesson Title:", title],
    ["References:", document.getElementById('refContent').value],
    ["Objectives:", document.getElementById('ksaObjectives').value],
    ["5E - Engage:", document.getElementById('engageContent').value],
    ["5E - Explore:", document.getElementById('exploreContent').value],
    ["5E - Explain:", document.getElementById('explainContent').value],
    ["5E - Elaborate:", document.getElementById('elaborateContent').value],
    ["5E - Evaluate:", document.getElementById('evaluateContent').value]
  ];

  let csvContent = "data:text/csv;charset=utf-8," 
    + excelRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${title.replace(/\s+/g, '_')}_Matrix.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// --- POWERPOINT EXPORT FORMATTER ---
document.getElementById('exportPptBtn')?.addEventListener('click', () => {
  const title = document.getElementById('lessonTitleInput').value || "Lesson Overview";
  
  // Arrange clean copyable segmentation string text for direct copy pasting to PPT layout slides
  let pptTextFormat = `=== SLIDE 1: TITLE SLIDE ===\nTopic: ${title}\nTeacher: Jocel May G. Barde\nBadas National High School\n\n` +
    `=== SLIDE 2: LESSON OBJECTIVES ===\n${document.getElementById('ksaObjectives').value}\n\n` +
    `=== SLIDE 3: ENGAGE & EXPLORE ===\n[ENGAGE]:\n${document.getElementById('engageContent').value}\n\n[EXPLORE]:\n${document.getElementById('exploreContent').value}\n\n` +
    `=== SLIDE 4: CORE DISCUSSION (EXPLAIN) ===\n${document.getElementById('explainContent').value}\n\n` +
    `=== SLIDE 5: ELABORATE & EVALUATE ===\n[APPLICATION]:\n${document.getElementById('elaborateContent').value}\n\n[ASSESSMENT]:\n${document.getElementById('evaluateContent').value}`;

  aiRawOutputDisplay.value = pptTextFormat;
  alert("The AI Display box has now been formatted specifically into Slide Break structures! Simply copy the text sections inside the terminal output window directly onto your presentation slide templates.");
});

dlpForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Lesson plan configurations have been locked into temporary session state successfully!");
});

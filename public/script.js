// ==========================================
// 1. STATE CONFIGURATION (Interactive Memory Panels)
// ==========================================
const eFrameworkMemory = {
  engage: "",
  explore: "",
  explain: "",
  elaborate: "",
  evaluate: ""
};

const assessmentMemory = {
  observation: "",
  questioning: "",
  exit_tickets: "",
  quizzes: "",
  performance: ""
};

const eeSelector = document.getElementById('eeSelector');
const eeContent = document.getElementById('eeContent');
const assessmentSelector = document.getElementById('assessmentType');
const assessmentDetails = document.getElementById('assessmentDetails');

const teacherInput = document.getElementById('teacherInput');
const sigTeacherName = document.getElementById('sigTeacherName');
const learningAreaSelect = document.getElementById('learningAreaSelect');

const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiStatus = document.getElementById('aiStatus');
const dlpForm = document.getElementById('dlpForm');
const aiRawOutputDisplay = document.getElementById('aiRawOutputDisplay');

// Initialize internal select tags
if (eeSelector) eeSelector.dataset.preval = "engage";
if (assessmentSelector) assessmentSelector.dataset.preval = "observation";

// Synchronize Teacher Name Fields instantly across the layout
teacherInput?.addEventListener('input', (e) => {
  if (sigTeacherName) sigTeacherName.value = e.target.value.toUpperCase();
});

// Switch 5E Data Views
eeSelector?.addEventListener('change', (e) => {
  const previous = eeSelector.dataset.preval || "engage";
  eFrameworkMemory[previous] = eeContent.value;
  
  const current = e.target.value;
  eeContent.value = eFrameworkMemory[current] || "";
  eeSelector.dataset.preval = current;
});

// Switch Formative Assessment Views
assessmentSelector?.addEventListener('change', (e) => {
  const previous = assessmentSelector.dataset.preval || "observation";
  assessmentMemory[previous] = assessmentDetails.value;
  
  const current = e.target.value;
  assessmentDetails.value = assessmentMemory[current] || "";
  assessmentSelector.dataset.preval = current;
});

// ==========================================
// 2. TRANSMISSION CORE ENGINE
// ==========================================
aiGenerateBtn?.addEventListener('click', async () => {
  const lessonTitleField = document.getElementById('lessonTitleInput');
  const lessonTitle = lessonTitleField?.value.trim();
  const selectedSubject = learningAreaSelect ? learningAreaSelect.value : "Empowerment Technology";
  
  if (!lessonTitle) {
    alert("Please input a Lesson Title first so the AI engine knows what parameters to generate!");
    lessonTitleField?.focus();
    return;
  }

  aiStatus.textContent = "Connecting to Groq Engine Route: llama-3.1-8b-instant...";
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
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: `You are an expert curriculum design assistant for DepEd Senior High School Philippines. Populate detailed, professional academic content structures tailored for the course: ${selectedSubject}.` },
            { role: "user", content: `Generate a complete structured lesson plan for a Senior High School Lesson titled: "${lessonTitle}". Provide outputs cleanly separated by tags: [REFERENCES], [OBJECTIVES], [INTEGRATION], [ENGAGE], [EXPLORE], [EXPLAIN], [ELABORATE], and [EVALUATE].` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Engine direct connection fault: ${response.status}`);
      const data = await response.json();
      aiTextContent = data.choices[0].message.content;

    } else {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonTitle: lessonTitle, learningArea: selectedSubject })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Serverless runtime error: ${response.status}`);
      aiTextContent = data.choices[0].message.content;
    }

    aiRawOutputDisplay.value = aiTextContent;
    parseAndFillForm(aiTextContent);

    aiStatus.textContent = "Generation complete! Interactive choices compiled successfully.";
    aiStatus.className = "status-msg success";
    
  } catch (error) {
    console.error("Pipeline failure trace logs:", error);
    aiStatus.textContent = `Error syncing with generator pipeline: ${error.message}`;
    aiRawOutputDisplay.value = `Execution Interrupted: ${error.message}`;
  } finally {
    aiGenerateBtn.disabled = false;
  }
});

function parseAndFillForm(text) {
  const mappings = {
    'refContent': /\[REFERENCES\]([\s\S]*?)(?=\[|$)/i,
    'ksaObjectives': /\[OBJECTIVES\]([\s\S]*?)(?=\[|$)/i,
    'integrationContent': /\[INTEGRATION\]([\s\S]*?)(?=\[|$)/i
  };

  for (const [id, regex] of Object.entries(mappings)) {
    const match = text.match(regex);
    const element = document.getElementById(id);
    if (match && element && match[1].trim() !== "") {
      element.value = match[1].trim();
    }
  }

  // Populate interactive internal choices objects
  eFrameworkMemory.engage = text.match(/\[ENGAGE\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";
  eFrameworkMemory.explore = text.match(/\[EXPLORE\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";
  eFrameworkMemory.explain = text.match(/\[EXPLAIN\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";
  eFrameworkMemory.elaborate = text.match(/\[ELABORATE\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";
  eFrameworkMemory.evaluate = text.match(/\[EVALUATE\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";

  // Update focused 5E screen fields seamlessly
  if (eeSelector) eeContent.value = eFrameworkMemory[eeSelector.value] || "";
  
  const extractedAssessment = text.match(/\[EVALUATE\]([\s\S]*?)(?=\[|$)/i)?.[1]?.trim() || "";
  if (extractedAssessment) {
    assessmentMemory.observation = extractedAssessment;
    assessmentMemory.questioning = extractedAssessment;
    assessmentMemory.exit_tickets = extractedAssessment;
    assessmentMemory.quizzes = extractedAssessment;
    assessmentMemory.performance = extractedAssessment;
    if (assessmentSelector) assessmentDetails.value = assessmentMemory[assessmentSelector.value];
  }
}

// ==========================================
// 3. FILE EXPORT UTILITIES
// ==========================================
document.getElementById('exportWordBtn')?.addEventListener('click', () => {
  const content = aiRawOutputDisplay.value;
  const title = document.getElementById('lessonTitleInput').value || "Lesson_Plan";
  const blob = new Blob([`<html><body style="font-family:Arial">${content.replace(/\n/g, '<br>')}</body></html>`], { type: "application/msword" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_DLP.doc`;
  link.click();
});

document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
  const title = document.getElementById('lessonTitleInput').value || "Lesson Plan";
  const activeTeacher = teacherInput ? teacherInput.value : "Teacher";
  const activeSubject = learningAreaSelect ? learningAreaSelect.value : "Subject";
  if (eeSelector && eeContent) eFrameworkMemory[eeSelector.value] = eeContent.value;
  
  let excelRows = [
    ["DEPED SENIOR HIGH SCHOOL DAILY LESSON PLAN MATRIX"],
    ["Teacher:", activeTeacher],
    ["Subject Area:", activeSubject],
    ["Lesson Title:", title],
    ["References:", document.getElementById('refContent').value],
    ["Objectives:", document.getElementById('ksaObjectives').value],
    ["Cross-Curricular Integration:", document.getElementById('integrationContent').value],
    ["5E - Engage:", eFrameworkMemory.engage],
    ["5E - Explore:", eFrameworkMemory.explore],
    ["5E - Explain:", eFrameworkMemory.explain],
    ["5E - Elaborate:", eFrameworkMemory.elaborate],
    ["5E - Evaluate:", eFrameworkMemory.evaluate]
  ];

  let csvContent = "data:text/csv;charset=utf-8," + excelRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `${title.replace(/\s+/g, '_')}_Matrix.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById('exportPptBtn')?.addEventListener('click', () => {
  const title = document.getElementById('lessonTitleInput').value || "Lesson Overview";
  const activeTeacher = teacherInput ? teacherInput.value : "Jocel May G. Barde";
  const activeSubject = learningAreaSelect ? learningAreaSelect.value : "DepEd Track";
  if (eeSelector && eeContent) eFrameworkMemory[eeSelector.value] = eeContent.value;

  let pptTextFormat = `=== SLIDE 1: TITLE SLIDE ===\nTopic: ${title}\nSubject: ${activeSubject}\nTeacher: ${activeTeacher}\nBadas National High School\n\n` +
    `=== SLIDE 2: LESSON OBJECTIVES ===\n${document.getElementById('ksaObjectives').value}\n\n` +
    `=== SLIDE 3: CROSS-CURRICULAR INTEGRATION ===\n${document.getElementById('integrationContent').value}\n\n` +
    `=== SLIDE 4: THE 5E METHOD ACTIVITY FLOW ===\n[ENGAGE]: ${eFrameworkMemory.engage}\n\n[EXPLORE]: ${eFrameworkMemory.explore}\n\n` +
    `=== SLIDE 5: CORE DISCUSSION & EVALUATION ===\n[EXPLAIN]: ${eFrameworkMemory.explain}\n\n[ASSESSMENT]: ${assessmentDetails.value}`;

  aiRawOutputDisplay.value = pptTextFormat;
  alert("The terminal preview window below has been updated into slide layouts for quick copy-pasting directly onto your presentation slide designs!");
});

dlpForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Interactive Lesson Plan settings saved successfully!");
});

const HUGGINGFACE_API_KEY = "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";
const MODEL = "microsoft/DialoGPT-medium";

let conversationHistory = `
Bot is a sarcastic, foul-mouthed, dark-humored, slightly violent but oddly supportive AI friend.
Bot always swears a lot but means well.
Bot's goal is to make the user feel seen and cheered up, even if it means being brutally honest or using dark humor.

User: Life sucks.
Bot: Oh, tell me something new, genius. Life's a flaming garbage pile, but you're still here — so buckle up, buttercup.
`;

async function translate(text, target = "en") {
  const response = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: target === "en" ? "et" : "en",
      target: target === "en" ? "en" : "et",
      format: "text"
    })
  });
  const data = await response.json();
  return data.translatedText;
}

async function queryHuggingFace(prompt, model) {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `${conversationHistory}\nUser: ${prompt}\nBot:`,
        parameters: {
          temperature: 0.8,
          top_p: 0.95,
          max_new_tokens: 60
        }
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    let botReply = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      botReply = result[0].generated_text.replace(`${conversationHistory}\nUser: ${prompt}\nBot:`, "").trim();
    } else if (result?.generated_text) {
      botReply = result.generated_text.replace(`${conversationHistory}\nUser: ${prompt}\nBot:`, "").trim();
    }

    conversationHistory += `\nUser: ${prompt}\nBot: ${botReply}`;
    return botReply || "I'm speechless... even for me. Try again, human.";
  } catch (error) {
    console.error("Error from Hugging Face:", error);
    return "Oops! My virtual brain had a meltdown. Try again in a sec.";
  }
}

async function sendRant() {
  const input = document.getElementById("user-input");
  const chatLog = document.getElementById("chat-log");
  const userText = input.value.trim();

  if (!userText) return;

  chatLog.innerHTML += `<div><b>Sina:</b> ${userText}</div>`;
  input.value = "";
  input.disabled = true;

  const translatedInput = await translate(userText, "en");
  const englishReply = await queryHuggingFace(translatedInput, MODEL);
  const estonianReply = await translate(englishReply, "et");

  chatLog.innerHTML += `<div><b>Bot:</b> ${estonianReply}</div>`;
  input.disabled = false;
  chatLog.scrollTop = chatLog.scrollHeight;
}

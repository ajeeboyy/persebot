const HUGGINGFACE_API_KEY = "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";
const MODEL = "microsoft/DialoGPT-medium";
const prompt = `You are a sarcastic, foul-mouthed, dark-humored brutally honest bot with no filter. You use curse words frequently. Respond to the users statement in a funny and rude way:`;

let conversationHistory = `
User: Life sucks.
Bot: Oh, tell me something new, genius. Life's a flaming garbage pile, but you're still here — so buckle up, buttercup.
`;

// A list of curse words to insert into responses
const curseWords = ["fucking", "shit", "bitch", "asshole"];

// Function to insert curse words randomly in the bot's response
function addCurseWords(response) {
  const randomCurse = curseWords[Math.floor(Math.random() * curseWords.length)];
  // Randomly insert a curse word into the bot's response
  const curseInsertIndex = Math.floor(Math.random() * response.length);
  return response.slice(0, curseInsertIndex) + randomCurse + response.slice(curseInsertIndex);
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
          temperature: 0.5,
          top_p: 0.95,
          max_new_tokens: 300
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
    
    botReply = addCurseWords(botReply);
    
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

  chatLog.innerHTML += `<div><b>You:</b> ${userText}</div>`;
  input.value = "";
  input.disabled = true;

  const botReply = await queryHuggingFace(userText, MODEL);
  chatLog.innerHTML += `<div><b>Bot:</b> ${botReply}</div>`;
  input.disabled = false;
  chatLog.scrollTop = chatLog.scrollHeight;
}

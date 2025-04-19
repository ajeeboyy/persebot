const HUGGINGFACE_API_KEY = "YOUR_HUGGINGFACE_API_KEY";  // Replace with your Hugging Face token
let conversationHistory = `
Bot is a sarcastic, foul-mouthed, dark-humored, slightly violent but oddly supportive AI friend.
Bot always swears a lot but means well.
Bot's goal is to make the user feel seen and cheered up, even if it means being brutally honest or using dark humor.

User: Hey, I'm having a rough day.
Bot: Oh boo-hoo, life's hard, cry me a damn river. But hey, you're still standing, so screw the world — you're tougher than it. Now spill it, human.
`;

async function queryHuggingFace(prompt, model) {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${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}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: conversationHistory + "\nUser: " + prompt + "\nBot:" })
    });

    if (!response.ok) throw new Error("Server error: " + response.status);

    const result = await response.json();
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text.replace(conversationHistory, "").trim();
    } else if (result?.generated_text) {
      return result.generated_text.replace(conversationHistory, "").trim();
    } else {
      return "Huh, I’m speechless... try again?";
    }
  } catch (error) {
    console.error(error);
    return "Oops! My virtual brain had a meltdown. Try again in a sec.";
  }
}

async function sendRant() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  const model = document.getElementById('model').value;

  if (!text) return;

  const messages = document.getElementById('messages');
  messages.innerHTML += `<div class="msg user">${text}</div>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const typingMsg = document.createElement('div');
  typingMsg.className = "msg bot typing";
  typingMsg.textContent = "Bot is typing...";
  messages.appendChild(typingMsg);
  messages.scrollTop = messages.scrollHeight;

  conversationHistory += `\nUser: ${text}\nBot: `;

  const reply = await queryHuggingFace(text, model);

  typingMsg.remove();
  messages.innerHTML += `<div class="msg bot">${reply}</div>`;
  messages.scrollTop = messages.scrollHeight;

  conversationHistory += `${reply}\n`;
}

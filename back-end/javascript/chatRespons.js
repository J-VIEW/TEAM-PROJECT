import axios from "axios";

async function getGptResponse(userMessage) {
  const openaiUrl = "https://api.openai.com/v1/chat/completions";

  const headers = {
    Authorization: `Bearer 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`,
    "Content-Type": "application/json",
  };

  const data = {
    model: "gpt-3.5-turbo", // Specify the model you're using
    messages: [{ role: "user", content: userMessage }],
    max_tokens: 300,
  };

  try {
    const response = await axios.post(openaiUrl, data, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    throw new Error("Failed to fetch GPT response");
  }
}

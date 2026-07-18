import axios from 'axios';
import buildPrompt from '../prompt/prompt.js';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Generic plain-text LLM call.
 * Use this for nodes that expect a simple text response.
 */
async function callLLM(prompt) {
  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 128,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const choice = response.data.choices?.[0];
  if (!choice?.message?.content) {
    const finishReason = choice?.finish_reason ?? 'unknown';
    console.error('Groq returned no content. finish_reason:', finishReason);
    throw new Error(`Groq returned empty content (finish_reason: ${finishReason})`);
  }

  console.log('Raw Groq response received successfully');
  return choice.message.content.trim();
}

/**
 * Structured JSON LLM call — generic version.
 * Use this for any node that expects a JSON array/obj.
 */
async function callLLMJson(prompt, maxOutputTokens = 2048) {
  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: maxOutputTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const choice = response.data.choices?.[0];
  if (!choice?.message?.content) {
    const finishReason = choice?.finish_reason ?? 'unknown';
    console.error('Groq returned no content. finish_reason:', finishReason);
    throw new Error(`Groq returned empty content (finish_reason: ${finishReason})`);
  }

  console.log('Raw Groq JSON response received successfully');

  const cleaned = choice.message.content
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Groq returned invalid JSON:', cleaned);
    throw new Error('LLM returned invalid JSON format');
  }
}

/**
 * Structured JSON review call.
 * Use this for the main code-review flow that expects a JSON object back.
 */
async function getCodeReview(prTitle, author, formattedDiff, codebaseContext = []) {
  const prompt = buildPrompt(prTitle, author, formattedDiff, codebaseContext);
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response received successfully');

    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Gemini returned invalid JSON');
      throw new Error('LLM returned invalid JSON format');
    }
    console.error('Gemini API error:', error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

export { callLLM, callLLMJson, getCodeReview };
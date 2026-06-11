import axios from 'axios';
import { buildPrompt } from '../prompt/prompt.js';

// Call Gemini API and get structured review
async function getCodeReview(prTitle, author, formattedDiff) {
  const prompt = buildPrompt(prTitle, author, formattedDiff);

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature consistent structured output
         maxOutputTokens: 8192, // Limit response size     
        },
      }
    );

    // Extract text from Gemini response structure

    const rawText =
      response.data.candidates[0].content.parts[0].text;

    console.log('Raw Gemini response received successfully');

    // Clean the response
    const cleaned = rawText
      .replace(/```json/g, '') // remove ```json
      .replace(/```/g, '')     // remove ```
      .trim();                 // remove whitespace

    // Parse JSON
    const review = JSON.parse(cleaned);

    return review;

  } catch (error) {
    // If JSON parsing fails — LLM returned invalid format
    if (error instanceof SyntaxError) {
      console.error('Gemini returned invalid JSON');
      throw new Error('LLM returned invalid JSON format');
    }

    // If API call failed
    console.error('Gemini API error:', error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

export { getCodeReview };
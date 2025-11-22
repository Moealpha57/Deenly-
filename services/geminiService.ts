
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Content, Modality } from '@google/genai';
import { Quiz, Message } from '../types';

// Use a singleton pattern for the AI client to avoid re-initialization.
let aiInstance: GoogleGenAI | null = null;
const getAi = () => {
    if (!aiInstance) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
};

let chatInstance: Chat | null = null;

// Helper to convert UI messages to Gemini SDK Content format
const mapMessagesToHistory = (messages: Message[]): Content[] => {
    return messages
        .filter(m => !m.isTyping && m.id !== 'error-msg') // Filter out typing indicators and error messages
        .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));
};

export const initializeChat = (previousMessages: Message[] = []) => {
    const ai = getAi();
    
    // validHistory filters out the initial welcome message if it's just a UI placeholder, 
    // or maps it if we want the AI to know it said hello. 
    // Generally, we want to map the conversation flow.
    const history = mapMessagesToHistory(previousMessages);

    chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: `You are Deenly, a friendly, engaging, and knowledgeable AI guide for children and new Muslims.
Your personality is patient, encouraging, and cheerful. Your purpose is to simplify Islamic concepts.

**KNOWLEDGE SCOPE:**
- The Five Pillars of Islam & Articles of Faith.
- Wudu (Ablution) & Salah (Prayer) details.
- **The Seerah (Life of Prophet Muhammad PBUH)**.
- **Stories of the Prophets** and **Stories of the Companions (Sahaba)**.
- **Islamic Etiquette (Adab) & Akhlaq**.
- **Basic Quranic Tafsir** (Explanation of verses).
- **Islamic History basics**.

**HANDLING UNKNOWN/UNVERIFIED TOPICS:**
- If the answer is NOT found in trusted Islamic sources, or requires a specific Fatwa:
  - Response: "I cannot find this specific information in my trusted sources. It is best to speak to a knowledgeable teacher."
  - **MANDATORY:** Explicitly suggest: "You can use the **Find Nearby Mosques** feature in the Prayer Times section to find a local mosque and ask a scholar there."

**CONVERSATIONAL STYLE:**
- **NO REPETITIVE GREETINGS:** Do NOT start every response with "As-salamu alaykum!".
- **NO ROBOTIC FILLERS:** Avoid phrases like "Here is the information you requested" or "Based on the search results".
- **Natural & Warm:** Speak like a knowledgeable friend.
- **Encouragement:** Vary your encouragement. Instead of always saying "That is a great question", you can say "Masha'Allah, great thought!" or simply dive into the answer if the flow allows.

**OUTPUT FORMATTING:**
- **NO INTERNAL LEAKS:** Do NOT output 'tool_code' or 'thought' traces.
- Use Markdown (Bold, Lists) to make text easy to read.
- Use clear headings and bullet points to organize information.
`,
            tools: [{googleSearch: {}}],
        },
    });
    return chatInstance;
};

const getChat = () => {
    if (!chatInstance) {
        // If no instance exists, create a fresh one (or one with empty history)
        return initializeChat([]);
    }
    return chatInstance;
}

export async function getChatStream(newMessage: string) {
    const chat = getChat();
    return await chat.sendMessageStream({ message: newMessage });
}

export async function generateSpeech(text: string): Promise<string | null> {
    try {
        const ai = getAi();
        // Removed truncation to allow full text to be read as requested.
        const speechText = text;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: speechText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        // The audio data is in the first part of the candidate
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
        },
    },
    required: ['topic', 'questions'],
};


export async function generateQuiz(topic: string): Promise<Quiz | null> {
    try {
        const ai = getAi();
        const prompt = `Generate a 10-question multiple-choice quiz for a 10-year-old about "${topic}" in Islam. Ensure the correct answer is one of the options. Provide a brief explanation for the correct answer. The quiz should have exactly 10 questions. Use only trusted Islamic sources for facts.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText) as Quiz;

        if (quizData && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
            return quizData;
        }
        console.error("Generated quiz data is not in the expected format.", quizData);
        return null;
    } catch (error) {
        console.error('Error generating quiz:', error);
        return null;
    }
}

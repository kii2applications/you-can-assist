import * as genai from '@google/genai';

const ai = new genai.GoogleGenAI({ apiKey: 'test' });
// Try to call with an object and see what it expects?
// Or just check the generateContent function's source if possible (not easily).
// Let's check internal types used by generateContent.
console.log('genai.GoogleGenAI methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ai)));
console.log('ai.models methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ai.models)));

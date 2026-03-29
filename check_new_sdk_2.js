import * as genai from '@google/genai';

// Try to find GenerateContentParameters or equivalent
console.log('Checking for tool-related properties in GenerateContentParameters if available');
// Since it's likely a type/interface, it won't be in the JS keys unless it's a class.
// Let's check the GoogleGenAI class methods.
const ai = new genai.GoogleGenAI({ apiKey: 'test' });
console.log('ai.models properties:', Object.keys(ai.models));

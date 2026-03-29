import * as genai from '@google/generative-ai';
console.log(Object.keys(genai));
const keys = Object.keys(genai);
for (const key of keys) {
    if (key.includes('Dynamic') || key.includes('Retrieval')) {
        console.log(`${key}:`, genai[key]);
    }
}

import * as genai from '@google/genai';
console.log(Object.keys(genai));
const keys = Object.keys(genai);
for (const key of keys) {
    console.log(`${key}:`, genai[key]);
}

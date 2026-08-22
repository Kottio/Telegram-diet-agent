import { parseMeal } from "../src/ai/parse";
const text = process.argv.slice(2).join(" ");
console.dir(await parseMeal(text), { depth: null });

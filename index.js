import { setupWordNet, getWordBubble } from "./wordnet.js";
export async function init() {
    await setupWordNet();
}
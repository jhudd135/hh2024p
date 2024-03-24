import { setup, getWordBubble } from "./wordnet.js";
export async function init() {
    await setup();
    console.log(getWordBubble("chair"));
}
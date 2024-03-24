import { setup, getWordBubble } from "./wordnet.js";
import {pdfSetup} from "./pdf.js"
export async function init() {
    await setup();
    await pdfSetup();
    console.log(getWordBubble("chair"));

}
import { setupWordNet, getWordBubble } from "./wordnet.js";
import {pdfSetup} from "./pdf.js"
export async function init() {
    await setupWordNet();
    await pdfSetup();
    document.body.insertBefore(createConfirm(), document.body.firstChild);
    // document.body.insertBefore(createSearch(), document.body.firstChild);
}
function fromHtmlText(text) {
    const template = document.createElement("template");
    template.innerHTML = text
    return template.content;
}

function createConfirm() {
    const div = document.createElement("div");
    div.classList.add("confirm")
    const button = document.createElement("button");
    button.innerText = "CONFIRM";
    button.onclick = () => {
        toSpans();
        document.body.insertBefore(createSearch(), document.body.firstChild);
    };
    div.appendChild(button)
    return div
}

function toSpans() {
    const main = document.getElementsByTagName("main")[0];
    const textarea = main.getElementsByTagName("textarea")[0];
    const text = textarea.value;
    const indices = [-1, ...Array.from(text.matchAll(/[.\n]/g)).map(m => m.index)];
    const sentences = [];
    indices.forEach((idx, i) => {
        sentences.push(text.slice(idx + 1, (i + 1 === indices.length) ? text.length : indices[i + 1] + 1));
    })
    const div = document.createElement("div");
    div.classList.add("text");
    sentences.forEach((s, i) => {
        const span = document.createElement("span");
        span.innerText = s;
        span.id = "s" + i
        div.appendChild(span);
    });
    main.textContent = "";
    main.appendChild(div);
}

function createSearch() {
    const div = document.createElement("div");
    div.classList.add("search")
    const input = document.createElement("input");
    input.type = "text"
    div.appendChild(input);
    const button = document.createElement("button");
    button.innerText = "SEARCH";
    button.onclick = () => {
        const word = input.value.split(" ")[0].trim().toLowerCase();
        const bubble = getWordBubble(word);
        const text = document.getElementsByClassName("text")[0]
        const sentences = Array.from(text.children).map(c => c.innerText);
        
    };
    div.appendChild(button)
    return div;

}
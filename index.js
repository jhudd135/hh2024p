import { setupWordNet, getWordBubble } from "./wordnet.js";
import {pdfSetup, pdfText} from "./pdf.js"
export async function init() {
    await setupWordNet();
    await pdfSetup();
    document.getElementsByTagName("header")[0].appendChild(createConfirm());
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
    button.innerText = "Confirm";
    button.onclick = () => {
        const main = document.getElementsByTagName("main")[0];
        const spans = toSpans()
        main.textContent = "";
        main.appendChild(spans);
        document.body.insertBefore(createSearch(), document.body.firstChild);
        const header = document.getElementsByTagName("header")[0]
        header.removeChild(header.lastChild);
        header.appendChild(createEdit());
    };
    div.appendChild(button)
    return div
}

function createEdit() {
    const div = document.createElement("div");
    div.classList.add("confirm")
    const button = document.createElement("button");
    button.innerText = "Edit";
    button.onclick = () => {
        const main = document.getElementsByTagName("main")[0];
        const text = main.innerText;
        const textarea = document.createElement("textarea");
        textarea.id = "textInput";
        textarea.value = text;
        main.textContent = "";
        main.appendChild(textarea);
        const header = document.getElementsByTagName("header")[0]
        header.removeChild(header.lastChild);
        header.appendChild(createConfirm());
        document.body.removeChild(document.getElementsByClassName("search")[0]);
    };
    div.appendChild(button)
    return div
}

function toSpans() {
    // const main = document.getElementsByTagName("main")[0];
    const textarea = document.getElementsByTagName("textarea")[0];
    const text = textarea ? textarea.value : pdfText;
    const indices = [-1, ...Array.from(text.matchAll(/[.]/g)).map(m => m.index)];
    const sentences = [];
    indices.forEach((idx, i) => {
        sentences.push(text.slice(idx + 1, (i + 1 === indices.length) ? text.length : indices[i + 1] + 1));
    })
    const div = document.createElement("div");
    div.classList.add("text");
    sentences.forEach((s, i) => {
        const span = document.createElement("span");
        span.classList.add("tooltip")
        span.innerText = s;
        span.id = "s" + i
        const tooltip = document.createElement("span")
        tooltip.classList.add("tooltiptext");
        tooltip.style.display = "none";
        span.appendChild(tooltip)
        div.appendChild(span);
    });
    return div;
}

function createSearch() {
    const div = document.createElement("div");
    div.classList.add("search")
    const input = document.createElement("input");
    input.type = "text"
    input.placeholder = "Search..."
    div.appendChild(input);
    const button = document.createElement("button");
    const img = document.createElement("img");
    img.src = "icons/search.svg";
    button.appendChild(img);
    button.onclick = () => {
        const words = input.value.split(/[ ,]/g).map(w => w.trim().toLowerCase()).filter(w => w);
        // left associative operators & |
        let bubble = new Set();
        let op = "";
        words.forEach(w => {
            if ("&|".includes(w)) {
                op = w;
            } else {
                if (!op) {
                    op = "|";
                }
                switch (op) {
                    case "&":
                        bubble = bubble.intersection(new Set(getWordBubble(w)));
                        break;
                    case "|":
                        bubble = bubble.union(new Set(getWordBubble(w)));
                }
                op = "";
            }
        })
        bubble = Array.from(bubble);
        console.log(words, bubble)
        const text = document.getElementsByClassName("text")[0]
        const sentences = Array.from(text.children).map(c => c.innerText.toLowerCase());
        const values = new Array(sentences.length);
        const matched = new Array(sentences.length);
        sentences.forEach((s, i) => {
            matched[i] = [];
            values[i] = 0
            bubble.forEach(w => {
                const matches = Array.from(s.matchAll(new RegExp("\\b" + w + "\\b", "g"))).length;
                values[i] += matches;
                if (0 < matches) {
                    matched[i].push(w)
                }
            });
        });
        const maxVal = Math.max(...values, 0);
        values.forEach((v, i) => {
            const span = document.getElementById("s" + i);
            const tooltip = span.getElementsByClassName("tooltiptext")[0];
            if (v === 0) {
                tooltip.style.display = "none";
            } else {
                tooltip.style.display = "unset";
                tooltip.innerText = matched[i].join(", ");
            }
            span.style.backgroundColor = interpolateRGB( "#D7263D","#1e2329", maxVal === 0 ? 0 : v / maxVal);
        })
    };
    div.appendChild(button)
    return div;

}

function interpolate(a, b, n) {
    return a + (b - a) * n
}
function HEXtoRGB(str) {
    str = str.substring(1)
    const result = [];
    for (let i = 0; i < 6; i+=2) {
        result.push(parseInt(str.substr(i, 2), 16))
    }
    return result;
}
function RGBtoHEX(rgb) {
    let result = "#";
    rgb.forEach(c => {
        result += Math.floor(c).toString(16).padStart(2, "0");
    });
    return result;
}

function interpolateRGB(min, max, n) {
    return RGBtoHEX(HEXtoRGB(min).map((c, i) => interpolate(HEXtoRGB(max)[i], c, n)))
}

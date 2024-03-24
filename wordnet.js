const wordTypes = ["adj", "adv", "noun", "verb"];
const shortWordTypes = ["a", "r", "n", "v"];
const translateShortTypes = (s) => wordTypes[shortWordTypes.indexOf(s)];
const wordIndex = {};
const wordData = {};

const wordNetPath = "./node_modules/wordnet-db/dict/";
export async function setup() {
    console.log("SETTING UP WORDNET")
    for (let i = 0; i < wordTypes.length; i++) {
        const wt = wordTypes[i]
        const response = await fetch(wordNetPath + "index." + wt);
        const text = await response.text()
        const lines = text.split("\n").slice(29);
        wordIndex[wt] = lines
    }
    for (let i = 0; i < wordTypes.length; i++) {
        const wt = wordTypes[i]
        const response = await fetch(wordNetPath + "data." + wt);
        // const text = await response.text()
        // const lines = text.split("\n").filter((v, i) => 28 < i);
        wordData[wt] = new Uint8Array(await response.arrayBuffer());
    }
    console.log(wordIndex, wordData);

    
}

function getIndexEntriesFromWord(word) {
    const firstWord = str => str.substring(0, str.indexOf(" "));
    console.log("GEI called")
    word = word.toLowerCase();
    const results = []
    wordTypes.forEach(k => {
        const index = wordIndex[k];
        let low = 0;
        let high = index.length;
        let prev = "";
        while (low < high) {
            const mid = Math.floor((high + low) / 2);
            if (mid === low) {
                break;
            }
            const midWord = firstWord(index[mid]);
            if (word < midWord) {
                high = mid;
            } else {
                low = mid;
            }
        }
        while (firstWord(index[low]) === word) {
            results.push(index[low])
            low++;
        }
    });
    return results.map(e => parseIndexEntry(e))
}

function parseIndexEntry(entry) {
    const items = entry.split(" ").map(i => i.trim()).filter(i => i);
    const result = {word: items[0], type: items[1], synset_cnt: parseInt(items[2]), p_cnt: parseInt(items[3])};
    const p_cnt = result["p_cnt"];
    result["ptr_symbol"] = items.slice(4, p_cnt + 4)
    result["sense_cnt"] = parseInt(items[p_cnt + 4])
    result["tagsense_cnt"] = parseInt(items[p_cnt + 5])
    result["synset_offset"] = items.slice(p_cnt + 6)
    return result;
}

function readArrayBuffer(buffer, start) {
    let result = "";
    let c = "";
    while (c !== "\n") {
        c = String.fromCharCode(buffer[start])
        result += c;
        start++;
    }
    return result;
}

function parseDataEntry(entry) {
    const items = entry.split(" ").map(i => i.trim()).filter(i => i);
    const result = {synset_offset: items[0], lex_filenum: parseInt(items[1]), ss_type: items[2], w_cnt: parseInt(items[3], 16)};//, word: items[4], lex_id: parseInt(items[5], 16), p_cnt: parseInt(items[6])}
    const w_cnt = result["w_cnt"];
    result["word"] = []
    for (let i = 0; i < w_cnt; i++) {
        const base = 4 + 2*i;
        result["word"].push({word: items[base], lex_id: parseInt(items[base + 1], 16)})
    }
    result["p_cnt"] = items[4 + 2*w_cnt];
    const p_cnt = result["p_cnt"];
    result["ptr"] = [];
    for (let i = 0; i < p_cnt; i++) {
        const base = 5 + 2*w_cnt + 4*i;
        const st = {source: parseInt(items[base + 3].slice(0, 2), 16), target: parseInt(items[base + 3].slice(2, 4), 16)}
        result["ptr"].push({pointer_symbol: items[base], synset_offset: parseInt(items[base + 1]), pos: items[base + 2], source_target: st});
    }
    return result;
}

export function getDataEntriesFromWord(word) {
    const indexEntries = getIndexEntriesFromWord(word);
    let result = [];
    indexEntries.forEach(e => {
        result = result.concat(getDataEntriesFromIndexEntry(e));
    });
    return result;
}
function getDataEntriesFromIndexEntry(entry) {
    const result = [];
    entry["synset_offset"].forEach(offset => {
        result.push(getDataEntry(translateShortTypes(entry["type"]), offset));
    });
    return result;
}

function getDataEntry(wt, offset) {
    return parseDataEntry(readArrayBuffer(wordData[wt], offset));
}

export function getWordBubble(word) {
    const dataEntries = getDataEntriesFromWord(word);
    const result = new Set([[word, "og"]]);
    dataEntries.forEach(entry => { // each sense
        console.log(entry);
        entry.word.forEach(w => { // sense synonyms
            // result.add([w.word, "sense"]);
            result.add(w.word);
        });
        entry.ptr.filter(p => p.pointer_symbol === "~" || p.pointer_symbol === "~").forEach(p => { // hyponyms and derivationally related words
            const data = getDataEntry(translateShortTypes(p.pos), p.synset_offset);
            data.word.filter(w => w.lex_id === p.source_target.target).forEach(w => {
                // result.add([w.word, p.pointer_symbol === "~" ? "hyponym" : "derivation"]);
                result.add(w.word)
            });
        });
        entry.ptr.filter(p => p.pointer_symbol === "@").forEach(p => { // siblings
            const data = getDataEntry(translateShortTypes(p.pos), p.synset_offset);
            data.ptr.filter(p => p.pointer_symbol === "~").forEach(p => {
                getDataEntry(translateShortTypes(p.pos), p.synset_offset).word.filter(w => w.lex_id === p.source_target.target).forEach(w => {
                    // result.add([w.word, "sibling"]);
                    result.add(w.word)
                });
            });
        });
    });
    return Array.from(result);
}
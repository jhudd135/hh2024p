import { setup, getDataEntries } from "./wordnet.js";
export async function init() {
    await setup();
    console.log(getDataEntries("table"));
}
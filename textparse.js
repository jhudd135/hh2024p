function countWordOccurrences(wordsArray, text) {
    const occurrences = [];

    const sentences = text.split(/[.!?]/);


    if (sentences[sentences.length-1].trim() === '') {
        sentences.pop();
    }

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        let count = 0;

        const words = sentence.toLowerCase().match(/\b[\w']+(?:\b[\w']+)*/g);

        if (words) {
            for (let word of words) {
                if (wordsArray.includes(word)) {
                    count++;
                }
            }
        }

        occurrences.push(count); 
    }

    const indexesArray = [];

    console.log(occurrences);

    let maxValue = 0;

    for (let occurrence of occurrences) {
        if (occurrence > maxValue) {
            maxValue = occurrence;
        }
    }

    while (maxValue > 0) {
        for (let i = 0; i < occurrences.length; i++) {
            if (occurrences[i] == maxValue) {
                let sentence = sentences[i];
                let startIndex = text.indexOf(sentence);
                let endIndex = startIndex + sentence.length;

                indexesArray.push({ start: startIndex, end: endIndex });
            }
        }
        maxValue--;
    }

    return {occurrences, indexesArray};
}

const wordsArray = ["apples", "bananas", "oranges", "grapes", "kiwis", "melons"];
const text = "I like apples, bananas, and oranges. Grapes are my favorite fruit. Kiwis and melons are also delicious."
const occurrences = countWordOccurrences(wordsArray, text);
console.log(occurrences);


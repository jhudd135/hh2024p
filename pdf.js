import * as pdfjsLib from "./pdfjs-dist/build/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs-dist/build/pdf.worker.mjs";

export async function openPDF(pdfPath) {
    const loadingTask = await pdfjsLib.getDocument(pdfPath);

    const pdf = await loadingTask.promise;

    let text = await getPDFText(pdf);

    return text;
}

async function getPDFText(pdfData){
    let maxPages = pdfData.numPages;
    let countPromises = [];
    for (let j = 1; j <= maxPages; j++) {
        var page = pdfData.getPage(j);

        countPromises.push(page.then((page) => {
            var textContent = page.getTextContent();
            return textContent.then((text) => {
                return text.items.map((s) => {
                    if (s.str === '') {
                        return ' ';
                    } else {
                        return s.str;
                    }
                }).join(''); 
            });
        }));
    }
    return Promise.all(countPromises).then(texts => {
        return texts.join('');
    });
  }
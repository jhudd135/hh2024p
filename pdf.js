import * as pdfjsLib from "./pdfjs-dist/build/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs-dist/build/pdf.worker.mjs";

let started = false;
export async function pdfSetup() {
    var reader = new FileReader();
    const inputElement = document.getElementById("fileItem");

    inputElement.addEventListener("change", () => {
        if (typeof inputElement.files[0] === "object") {
            reader.readAsArrayBuffer(inputElement.files[0]);
            reader.onload = async (e) => {
                var myData = new Uint8Array(e.target.result);

                console.log(await openPDF({data: myData}));
            }
        }
    }, false);
}

async function openPDF(pdfData) {
    let body = document.getElementById("body");

    let prev = document.getElementById("viewer");

    if (started) {
        body.removeChild(prev);
    }

    const blob = new Blob([pdfData.data], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    
    let viewer = document.createElement("iframe");
    viewer.src = url;
    viewer.type="application/pdf";
    viewer.id="viewer";

    
    body.appendChild(viewer);

    started = true;


    const loadingTask = await pdfjsLib.getDocument(pdfData);

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
        return texts.join('').split('.');
    });
  }
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { JSDOM } = require('jsdom');

async function convertirPDFaXML(pdfPath, xmlPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);

        const dom = new JSDOM();
        const doc = dom.window.document;

        let xmlDoc = doc.implementation.createDocument("", "documento", null);

        const preguntasRegex = /(.*?)\s*A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*?)\s*ANSWER:\s*([A-D])/gs;


        const matches = [...data.text.matchAll(preguntasRegex)];

        matches.forEach((match, index) => {
            let pregunta = xmlDoc.createElement("pregunta");
            /* pregunta.setAttribute("id", index + 1); */

            let enunciado = xmlDoc.createElement("enunciado");
            enunciado.textContent = match[1];
            pregunta.appendChild(enunciado);

            /* let opciones = xmlDoc.createElement("opciones"); */
            ["A", "B", "C", "D"].forEach((letra, i) => {
                let opcion = xmlDoc.createElement(`${letra}`);
                opcion.textContent = match[i + 2];
                /* opciones.appendChild(opcion); */
                pregunta.appendChild(opcion);
            });
            

            let respuesta = xmlDoc.createElement("respuesta_correcta");
            respuesta.textContent = match[6]; // Captura la respuesta correcta
            pregunta.appendChild(respuesta);

            xmlDoc.documentElement.appendChild(pregunta);
        });

        const serializer = new dom.window.XMLSerializer();
        fs.writeFileSync(xmlPath, serializer.serializeToString(xmlDoc), "utf-8");

        console.log(`✅ Conversión completada: ${xmlPath}`);
    } catch (error) {
        console.error("❌ Error al convertir el PDF a XML:", error);
    }
}

// Ejecutar conversión con un archivo de ejemplo
convertirPDFaXML("./assets/prac.pdf", "archivo.xml");

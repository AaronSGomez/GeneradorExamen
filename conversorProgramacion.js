const fs = require('fs');
const { JSDOM } = require('jsdom');

function convertirXMLaNuevoFormato(entradaPath, salidaPath) {
    try {
        const xmlContent = fs.readFileSync(entradaPath, "utf-8");
        const dom = new JSDOM(xmlContent, { contentType: "text/xml" });
        const doc = dom.window.document;

        const nuevoDoc = new JSDOM().window.document;
        const root = nuevoDoc.createElement("documento");

        const preguntas = [...doc.querySelectorAll("pregunta")];

        preguntas.forEach((pregunta, index) => {
            const nuevaPregunta = nuevoDoc.createElement("pregunta");

            const enunciado = pregunta.querySelector("enunciado")?.textContent.trim();
            const opciones = [...pregunta.querySelectorAll("opcion")];
            const respuesta = pregunta.querySelector("respuesta")?.textContent.trim().toUpperCase();
            const explicacion = pregunta.querySelector("explicacion")?.textContent.trim();

            // Enunciado
            const nuevoEnunciado = nuevoDoc.createElement("enunciado");
            nuevoEnunciado.textContent = enunciado;
            nuevaPregunta.appendChild(nuevoEnunciado);

            // Opciones A, B, C, D
            const letras = ['A', 'B', 'C', 'D'];
            opciones.forEach((opcion, i) => {
                const texto = opcion.textContent.replace(/^[a-d]\)\s*/i, '').trim();
                const nodo = nuevoDoc.createElement(letras[i]);
                nodo.textContent = texto;
                nuevaPregunta.appendChild(nodo);
            });

            // Respuesta correcta
            const nodoRespuesta = nuevoDoc.createElement("respuesta_correcta");
            nodoRespuesta.textContent = respuesta;
            if (explicacion) {
                nodoRespuesta.setAttribute("explicacion", explicacion);
            }
            nuevaPregunta.appendChild(nodoRespuesta);

            root.appendChild(nuevaPregunta);
        });

        const finalDoc = nuevoDoc.implementation.createDocument(null, "documento", null);
        finalDoc.replaceChild(root, finalDoc.documentElement);

        const serializer = new dom.window.XMLSerializer();
        fs.writeFileSync(salidaPath, serializer.serializeToString(finalDoc), "utf-8");

        console.log(`✅ XML transformado exitosamente en: ${salidaPath}`);
    } catch (error) {
        console.error("❌ Error al transformar XML:", error);
    }
}

// Ejecutar con archivo de entrada y salida
convertirXMLaNuevoFormato("archivo.xml", "formato_convertido.xml");

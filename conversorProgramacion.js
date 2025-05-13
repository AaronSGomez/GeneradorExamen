const fs = require('fs');
const { JSDOM } = require('jsdom');
const format = require('xml-formatter'); // Asegúrate de instalarlo: npm install xml-formatter

function convertirXMLaNuevoFormato(entradaPath, salidaPath) {
    try {
        const xmlContent = fs.readFileSync(entradaPath, "utf-8");
        const dom = new JSDOM(xmlContent, { contentType: "text/xml" });
        const doc = dom.window.document;

        // Crear nuevo documento XML con raíz <documento>
        const impl = doc.implementation;
        const nuevoDoc = impl.createDocument(null, "documento", null);
        const root = nuevoDoc.documentElement;

        const preguntas = [...doc.querySelectorAll("pregunta")];
        const letras = ['A', 'B', 'C', 'D'];

        preguntas.forEach((pregunta) => {
            const nuevaPregunta = nuevoDoc.createElement("pregunta");

            // Enunciado
            const enunciado = pregunta.querySelector("enunciado")?.textContent.trim();
            const nuevoEnunciado = nuevoDoc.createElement("enunciado");
            nuevoEnunciado.textContent = enunciado;
            nuevaPregunta.appendChild(nuevoEnunciado);

            // Opciones A-D
            const opciones = [...pregunta.querySelectorAll("opcion")];

            if (opciones.length !== 4) {
                console.warn(`⚠️ Pregunta ID ${pregunta.getAttribute("id")} tiene ${opciones.length} opciones.`);
            }

            opciones.forEach((opcion, i) => {
                const texto = opcion.textContent.trim().replace(/^[a-d]\)\s*/i, '');
                const nodoOpcion = nuevoDoc.createElement(letras[i] || `Extra${i}`);
                nodoOpcion.textContent = texto;
                nuevaPregunta.appendChild(nodoOpcion);
            });

            // Respuesta
            const respuesta = pregunta.querySelector("respuesta")?.textContent.trim().toUpperCase();
            if (!letras.includes(respuesta)) {
                console.warn(`⚠️ Respuesta no válida en pregunta ID ${pregunta.getAttribute("id")}: ${respuesta}`);
            }

            const nodoRespuesta = nuevoDoc.createElement("respuesta_correcta");
            nodoRespuesta.textContent = respuesta;

            // Explicación como atributo
            const explicacion = pregunta.querySelector("explicacion")?.textContent.trim();
            if (explicacion) {
                nodoRespuesta.setAttribute("explicacion", explicacion);
            }

            nuevaPregunta.appendChild(nodoRespuesta);
            root.appendChild(nuevaPregunta);
        });

        // Serializar y formatear el XML
        const serializer = new dom.window.XMLSerializer();
        const xmlString = serializer.serializeToString(nuevoDoc);
        const xmlFormateado = format(xmlString, { indentation: '  ' });

        fs.writeFileSync(salidaPath, xmlFormateado, "utf-8");
        console.log(`✅ XML transformado exitosamente en: ${salidaPath}`);
    } catch (error) {
        console.error("❌ Error al transformar XML:", error);
    }
}

// Ejecutar
convertirXMLaNuevoFormato("./preguntas.xml", "Programacion.xml");

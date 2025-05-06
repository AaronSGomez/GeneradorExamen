const fs = require('fs');
const { JSDOM } = require('jsdom');

function convertirXMLaNuevoFormato(entradaPath, salidaPath) {
    try {
        const xmlContent = fs.readFileSync(entradaPath, "utf-8");
        const dom = new JSDOM(xmlContent, { contentType: "text/xml" });
        const doc = dom.window.document;

        const nuevoDoc = new JSDOM().window.document;
        const impl = nuevoDoc.implementation;
        const nuevoXML = impl.createDocument(null, "documento", null);
        const root = nuevoXML.documentElement;

        const preguntas = [...doc.querySelectorAll("pregunta")];

        preguntas.forEach((pregunta) => {
            const nuevaPregunta = nuevoXML.createElement("pregunta");

            // Enunciado
            const enunciado = pregunta.querySelector("enunciado")?.textContent.trim();
            const nuevoEnunciado = nuevoXML.createElement("enunciado");
            nuevoEnunciado.textContent = enunciado;
            nuevaPregunta.appendChild(nuevoEnunciado);

            // Opciones
            const letras = ['A', 'B', 'C', 'D'];
            const opciones = [...pregunta.querySelectorAll("opcion")];

            opciones.forEach((opcion, i) => {
                const texto = opcion.textContent.trim().replace(/^[a-d]\)\s*/i, '');
                const nodo = nuevoXML.createElement(letras[i]); // clave: mayúscula aquí
                nodo.textContent = texto;
                nuevaPregunta.appendChild(nodo);
            });

            // Respuesta correcta (en mayúscula)
            const respuesta = pregunta.querySelector("respuesta")?.textContent.trim().toUpperCase();
            const nodoRespuesta = nuevoXML.createElement("respuesta_correcta");
            nodoRespuesta.textContent = respuesta;
            nuevaPregunta.appendChild(nodoRespuesta);

            root.appendChild(nuevaPregunta);
        });

        const serializer = new dom.window.XMLSerializer();
        fs.writeFileSync(salidaPath, serializer.serializeToString(nuevoXML), "utf-8");

        console.log(`✅ XML convertido correctamente a: ${salidaPath}`);
    } catch (error) {
        console.error("❌ Error al transformar XML:", error);
    }
}

// Ejecutar con archivo de entrada y salida
convertirXMLaNuevoFormato("./bbdd.xml", "./assets/formato_convertido.xml");

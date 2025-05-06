const fs = require('fs');
const { JSDOM } = require('jsdom');

function convertirXMLaNuevoFormato(entradaPath, salidaPath) {
    try {
        const xmlContent = fs.readFileSync(entradaPath, "utf-8");
        const dom = new JSDOM(xmlContent, { contentType: "text/xml" });
        const doc = dom.window.document;

        // Crear un nuevo documento XML correctamente sin espacio de nombres
        const impl = doc.implementation;
        const nuevoDoc = impl.createDocument(null, "documento", null); // Aquí se crea el documento vacío con la raíz <documento>
        const root = nuevoDoc.documentElement;

        const preguntas = [...doc.querySelectorAll("pregunta")];

        preguntas.forEach((pregunta) => {
            const nuevaPregunta = nuevoDoc.createElement("pregunta");

            // Enunciado
            const enunciado = pregunta.querySelector("enunciado")?.textContent.trim();
            const nuevoEnunciado = nuevoDoc.createElement("enunciado");
            nuevoEnunciado.textContent = enunciado;
            nuevaPregunta.appendChild(nuevoEnunciado);

            // Opciones A, B, C, D
            const letras = ['A', 'B', 'C', 'D'];
            const opciones = [...pregunta.querySelectorAll("opcion")];

            opciones.forEach((opcion, i) => {
                const texto = opcion.textContent.trim().replace(/^[a-d]\)\s*/i, ''); // Eliminar "a) "
                const nodo = nuevoDoc.createElement(letras[i]);
                nodo.textContent = texto;
                nuevaPregunta.appendChild(nodo);
            });

            // Respuesta correcta (en mayúscula)
            const respuesta = pregunta.querySelector("respuesta")?.textContent.trim().toUpperCase();
            const nodoRespuesta = nuevoDoc.createElement("respuesta_correcta");
            nodoRespuesta.textContent = respuesta;

            // Si existe la explicación, se pone como atributo
            const explicacion = pregunta.querySelector("explicacion")?.textContent.trim();
            if (explicacion) {
                nodoRespuesta.setAttribute("explicacion", explicacion);
            }

            nuevaPregunta.appendChild(nodoRespuesta);

            root.appendChild(nuevaPregunta);
        });

        // Serializar el documento y escribirlo en el archivo de salida
        const serializer = new dom.window.XMLSerializer();
        fs.writeFileSync(salidaPath, serializer.serializeToString(nuevoDoc), "utf-8");

        console.log(`✅ XML transformado exitosamente en: ${salidaPath}`);
    } catch (error) {
        console.error("❌ Error al transformar XML:", error);
    }
}

// Ejecutar con archivo de entrada y salida
convertirXMLaNuevoFormato("./assets/xml/Programacion.xml", "Programacion.xml");

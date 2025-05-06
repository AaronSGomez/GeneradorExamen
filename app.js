let seleccion = [];
let indicePregunta = 0;
let aciertos = 0;
let fallos=0;
let saltadas=0;
let cantidadPreguntas=0;

async function cargarXML() {
  const response = await fetch('./archivo.xml');
  const text = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  // Acceder a las preguntas dentro de <Cuestionario>
  const preguntas = Array.from(xmlDoc.getElementsByTagName("pregunta")).map(p => ({
    enunciado: p.getElementsByTagName("enunciado")[0]?.textContent ?? "",
    A: p.getElementsByTagName("A")[0]?.textContent ?? "",
    B: p.getElementsByTagName("B")[0]?.textContent ?? "",
    C: p.getElementsByTagName("C")[0]?.textContent ?? "",
    D: p.getElementsByTagName("D")[0]?.textContent ?? "",
    respuestaCorrecta: p.getElementsByTagName("respuesta_correcta")[0]?.textContent ?? ""
  }));
  cantidadPreguntas= preguntas.length;
  seleccion =obtenerPreguntasAleatorias(preguntas);
  mostrarPregunta();
}




//mostramos la pregunta
function mostrarPregunta() {
  if (indicePregunta >= seleccion.length) {
    let marcador= (aciertos*0.25)-(fallos*0.08);
    document.getElementById("pregunta-container").innerHTML = `<h2>Juego terminado! Nota obtenida: ${marcador}</h2>
    <h2>Aciertos ${aciertos}</h2>
    <h2>Fallos ${fallos}</h2>
    <h2>No respondidas ${saltadas}</h2>`;
    let respuestaDiv= document.getElementById("respuesta");
    respuestaDiv.style.display = "block";
    return;
  }

  const preguntaActual = seleccion[indicePregunta];
  let opcionesHTML = "";

  // Crear botones con las opciones correctamente referenciadas
  [preguntaActual.A, preguntaActual.B, preguntaActual.C, preguntaActual.D].forEach(opcion => {
    const opcionCodificada = encodeURIComponent(opcion);
    opcionesHTML += `<li><a href="#" onclick="verificarRespuesta(decodeURIComponent('${opcionCodificada}'))">${opcion}</a></li>`;
  });

  document.getElementById("pregunta-container").innerHTML = `
      <h3>${preguntaActual.enunciado}</h3>
      <ul>
      ${opcionesHTML}
      <li><a href="#" onclick="saltar()">Dejar sin contestar</a></li>
      </ul>
      <p>Pregunta ${indicePregunta+1} de 40 . Preguntas XML total: ${cantidadPreguntas}</p>`;
}

function verificarRespuesta(respuestaSeleccionada) {
    const preguntaActual = seleccion[indicePregunta];
    let respuestaDiv = document.getElementById("respuesta");

    // Obtener el contenido real de la opción correcta
    const respuestaCorrectaTexto = preguntaActual[preguntaActual.respuestaCorrecta];

    if (respuestaSeleccionada === respuestaCorrectaTexto) {
        aciertos ++;
        respuestaDiv.innerHTML = `¡Correcto!`;
        respuestaDiv.style.color = "whitesmoke";
    } else {
        respuestaDiv.innerHTML = `Incorrecto. La respuesta correcta es: ${respuestaCorrectaTexto}`;
        respuestaDiv.style.color = "crimson";
        fallos++;
    }

    respuestaDiv.style.display = "block";
    setTimeout(() => {
        respuestaDiv.style.display = "none";
        cargarSiguientePregunta();
    }, 3000); // 3 segundos
}
function saltar(){
    saltadas++;
    cargarSiguientePregunta();
}

//cargar siguiente pregunta
function cargarSiguientePregunta() {
  indicePregunta++;
  mostrarPregunta();
}
// Función para seleccionar 15 preguntas aleatorias
function obtenerPreguntasAleatorias(preguntas) {
  return preguntas.sort(() => Math.random() - 0.5).slice(0, 40);
}

//cargar xml al cargar la ventana
window.onload = cargarXML;

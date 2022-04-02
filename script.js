// TEXTAREAS
const textareas = document.getElementsByTagName("textarea");

for (let i = 0; i < textareas.length; i++) {
    textareas[i].addEventListener("input", () => resizeTextarea(textareas[i]), false);
}

function resizeTextarea(element) {
    element.setAttribute("style", "height: auto;");
    element.setAttribute("style", "height:" + (element.scrollHeight + 30) + "px;overflow-y:hidden;");
}




// EXAMPLE CODE
const text = `Proceso Suma Super

  // Todos los comentarios que quieras

  Escribir "Suma de Números -----------------------------"
  Escribir "Ingrese números para sumar (0 para terminar):";

  nuevoSumando <= 1;
  total <= 0;


  Mientras nuevoSumando > 0 hacer

    Leer nuevoSumando;

    Si nuevoSumando > 0 Entonces

      Si total != 0 Entonces
        Escribir "+" sin salto;
      FinSi

      Escribir nuevoSumando sin salto;
      total <= total + nuevoSumando;

    FinSi

  FinMientras


  Escribir "=", total;

FinProceso`

textareas[0].innerHTML = text;
resizeTextarea(textareas[0])



// CLEAR BUTTON
document.getElementById("clear").addEventListener("click", () => {
    textareas[0].innerHTML = "";
});


// GET RESULT
document.getElementById("start-result").addEventListener("click", async () => {

    const code = document.getElementById("code-editor");

    const comp = new Compiler();
    const data = await comp.start(code.value);

    const exec = new Executer();
    exec.start(data);
});


// GET DIAGRAM
document.getElementById("start-diagram").addEventListener("click", () => {

    const code = document.getElementById("code-editor");

    const comp = new Compiler();
    const data = comp.start(code.value);

    // const diag = new Diagramer();
    // diag.start(data);
});


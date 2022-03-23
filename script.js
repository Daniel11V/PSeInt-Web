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

  Escribir "Ingrese el primer numero:"
  Leer A

  Escribir "Ingrese el segundo numero:"
  Leer B

  // Asignacion (<-)

  C <- A + B

  Escribir "El resultado es: ", C

FinProceso`

textareas[0].innerHTML = text;
resizeTextarea(textareas[0])



document.getElementById("clear").addEventListener("click", () => {
    textareas[0].innerHTML = "";
});


// GET RESULT
const initialData2 = {
  name: "",
  var: {},
  result: []
}

const initialData = {
  proceso: {
    name: '',
    var: {},
    code: []
  }
}

let data = JSON.parse(JSON.stringify(initialData));

document.getElementById("start-result").addEventListener("click", () => {
    data = JSON.parse(JSON.stringify(initialData));

    const code = document.getElementById("code-editor");

    const arrayCode = code.value.split("\n").map(line => line.split(" ").filter(word => word !== "")).filter(line => line.length);

    const isExistingVar = (v, vs) => Object.keys(vs.var).includes(v)
  
    for (line of arrayCode) {
      const firstWordM = line.shift();
      const firstWord = firstWordM.toLowerCase();
      if (firstWord === "//") {continue;}
      if (firstWord === "proceso") {compProceso(line); continue;}
      if (firstWord === "escribir") {compEscribir(line); continue;}
      if (firstWord === "leer") {compLeer(line); continue;}
      if (firstWord === "definir") {compDefinir(line); continue;}
      if (firstWord === "finproceso") {break;}
      compSetvar(firstWordM, line);
      continue;
    }

    console.log(data);
    console.log(data.proceso.code);

    async function runCode() {
        const result = document.getElementById("result");
        const storage = getParent();
        result.innerHTML = "";
        for (action of storage.code) {
          console.log("storage", action)
            switch (action[0]) {
                case "escribir":
                    for (let text of action[1]) {
                        if (isExistingVar(text, storage)) {
                            result.textContent += storage.var[text] + " ";
                        } else {
                            result.textContent += text + " ";
                        }
                    }
                    result.textContent += "\n";
                    await resizeTextarea(result)
                    break;
                case "leer":
                    const value = await prompt(action[1]);
                    storage.var[action[1]] = value;
                    break;
                case "setvar":
                    const varToSet = action[1];
                    const operation = action[2].split(" ");
                    for (let i = 0; i < operation.length; i++) {
                        if (isExistingVar(operation[i], storage)) {
                            operation[i] = storage.var[operation[i]];
                        }
                    }
                    storage.var[varToSet] = "" + eval(operation.join(" "));
                    break;
                default:
                    break;
            }
        }

        console.log(storage);
    }
  
    runCode();
});
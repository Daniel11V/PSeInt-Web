class Diagramer {
    constructor() {

        this.start = diagrame;


        const result = document.getElementById("result");

        let data = {
            proceso: {
                name: '',
                var: {},
                code: []
            }
        }

        let parent = ["proceso"];
        const getParent = () => {
            let newStorage = parent[0] ? data[parent[0]] : "x";
            let parentLength = parent.length - 1;
            while (parentLength > 0) {
                newStorage = newStorage.code[newStorage.code.length - 1][1];
                parentLength--;
            }
            return newStorage;
        }

        const isLastWord = (w, ws) => w === ws[ws.length - 1];
        const isExistingVar = (v, vs) => Object.keys(vs.var).includes(v)


        async function diagrame(codeCompiled) {
            data = codeCompiled;
            result.innerHTML = "";

            for (let action of storage.code) {
                console.log("storage", action)
                const actName = action.shift();
                const actCont = action;

                if (actName === "escribir") { await escribir(actCont); }
                else if (actName === "leer") { await leer(actCont); }
                else if (actName === "setvar") { setvar(actCont); }
                else if (actName === "si") { si(actCont); }
                else { console.warn("Not recognized to execute: ", actName); }
            }
        }



        async function escribir(actCont) {
            const storage = getParent();

            for (let text of actCont) {
                if (isExistingVar(text, storage)) {
                    result.textContent += storage.var[text] + " ";
                } else {
                    result.textContent += text + " ";
                }
            }
            result.textContent += "\n";
            await resizeTextarea(result);
        }

        async function leer(actCont) {
            const storage = getParent();

            const answer = await prompt("Ingresar valor de " + actCont + ": ");
            storage.var[actCont] = answer;
        }

        function setvar(actCont) {
            const storage = getParent();

            const varToSet = actCont[0];
            const operation = actCont[1].split(" ");
            for (let i = 0; i < operation.length; i++) {
                if (isExistingVar(operation[i], storage)) {
                    operation[i] = storage.var[operation[i]];
                }
            }
            storage.var[varToSet] = "" + eval(operation.join(" "));
        }

        function si(actCont) {
            const storage = getParent();
            parent.push("si");

        }

        function execCondicion(conds) {
            const operation = [];

            if (conds.length == 1) {
                if (conds[0]) return true;
                return false;
            }

            for (cond of conds) {
                if (Array.isArray(cond)) cond = execCondicion(cond);

                operation.push(wordM.replace(";", ""));
                if (wordM.includes(";") || isLastWord(wordM, words)) {
                    data.data.push(["setvar", editingVar, operation.join(" ")])
                };
            }
        }
    }
}
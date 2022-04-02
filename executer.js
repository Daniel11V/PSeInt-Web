class Executer {
    constructor() {

        const result = document.getElementById("result");

        let parent = [];

        let data = {
            proceso: {
                name: '',
                var: {},
                code: []
            }
        }


        this.start = async (codeCompiled) => {
            data = codeCompiled;
            parent = [codeCompiled.proceso];
            result.innerHTML = "";
            await execute(data.proceso);
            console.log(" ");
            console.log("After Execution: ", data);
        };



        let lastIfResult = false;

        const getVar = (v) => {
            for (let i = parent.length - 1; i >= 0; i--) {
                if (Object.keys(parent[i].var).includes(v)) return parent[i].var[v];
            }
            return v;
        }

        const editVar = (v, value) => {
            for (let i = parent.length - 1; i >= 0; i--) {
                if (Object.keys(parent[i].var).includes(v)) {
                    parent[i].var[v] = value; return;
                }
            }
            parent[parent.length - 1].var[v] = value;
        }

        const evalWithVars = (cond) => {
            let operation = "";

            for (let text of cond) {
                operation += getVar(text) + " ";
            }

            return eval(operation);
        }


        async function execute(storage) {

            for (let action of storage.code) {
                const actName = action[0];
                const actCont = action[2] ? action.slice(1, action.length) : action[1];
                console.log("- action: ", action)

                if (actName === "escribir") { await escribir(actCont); }
                else if (actName === "leer") { await leer(actCont, storage); }
                else if (actName === "setvar") { setvar(actCont, storage); }
                else if (actName === "si") { await si(actCont); }
                else if (actName === "sino") { await sino(actCont); }
                else if (actName === "mientras") { await mientras(actCont); }
                else { console.warn("Not recognized to execute: ", actName); }
            }
        }



        async function escribir(actCont) {
            const toWrite = actCont[0];
            const sinSalto = actCont[1].sinSalto;

            for (let text of toWrite) {
                result.textContent += getVar(text) + " ";
            }
            if (!sinSalto) {
                result.textContent += "\n";
            }
            await resizeTextarea(result);
        }

        async function leer(actCont, storage) {
            const answer = await prompt("Ingresar valor de " + actCont + ": ");
            editVar(actCont, answer);
        }

        function setvar(actCont, storage) {
            const varToSet = actCont[0];
            const operation = actCont[1].split(" ");
            for (let i = 0; i < operation.length; i++) {
                operation[i] = getVar(operation[i]);
            }
            editVar(varToSet, "" + eval(operation.join(" ")));
        }

        async function si(actCont) {

            if (evalWithVars(actCont.cond)) {
                parent.push(actCont);
                await execute(actCont);
                parent.pop();
                lastIfResult = true;
            } else {
                lastIfResult = false;
            }
        }

        async function sino(actCont) {
            if (!lastIfResult) {
                parent.push(actCont);
                await execute(actCont);
                parent.pop();
            }
        }

        async function mientras(actCont) {

            while (evalWithVars(actCont.cond)) {
                parent.push(actCont);
                await execute(actCont);
                parent.pop();
                lastIfResult = true;
            }
        }
    }
}
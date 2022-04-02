class Compiler {
    constructor() {

        this.start = compile;

        const result = {
            proceso: {
                name: '',
                var: {},
                code: []
            }
        }

        let parent = [];
        function getParent() {
            let newStorage = parent[0] ? result[parent[0]] : result.error;
            let parentLength = parent.length - 1;
            while (parentLength > 0) {
                newStorage = newStorage.code[newStorage.code.length - 1][1];
                parentLength--;
            }
            return newStorage;
        }

        const isLastWord = (w, ws) => w === ws[ws.length - 1]

        const fins = ["finproceso", "finsi", "finmientras"];
        const isFin = (firstWord) => fins.some(w => w === firstWord);

        function compile(codeString) {
            const codeArray = codeString.split("\n").map(line => line.split(" ").filter(word => word !== "")).filter(line => line.length);

            for (let line of codeArray) {
                const firstWordM = line.shift();
                const firstWord = firstWordM.toLowerCase();

                if (firstWord === "//") { }
                else if (firstWord === "proceso") { proceso(line); }
                else if (firstWord === "escribir") { escribir(line); }
                else if (firstWord === "leer") { leer(line); }
                else if (firstWord === "definir") { definir(line); }
                else if (firstWord === "si") { si(line); }
                else if (firstWord === "sino") { siNo(line); }
                else if (firstWord === "mientras") { mientras(line); }
                else if (isFin(firstWord)) { fin(); }
                else { setvar(firstWordM, line); }
            }

            return JSON.parse(JSON.stringify(result));
        }




        function proceso(words) {
            let name = "";
            parent.push("proceso");

            for (let wordM of words) {
                if (wordM === "//") break;

                if (name.length) name += " ";
                name += wordM;

                if (wordM.includes(";") || isLastWord(wordM, words)) {
                    result.proceso.name = name;
                    break;
                }

            }
        }

        function escribir(words) {
            const storage = getParent();
            storage.code.push(["escribir", [], { sinSalto: false }]);
            let inString = false;
            const lastCode = storage.code.length - 1;
            const lastStrIndex = () => storage.code[lastCode][1].length - 1;

            for (let wordM of words) {
                const word = wordM.toLowerCase();
                if (wordM === "//") break;
                if (word.includes("sin")) {
                    storage.code[lastCode][2].sinSalto = true;
                    break;
                };

                const numberOfQuotes = word.split('"').length - 1;

                if (numberOfQuotes == 2) {
                    storage.code[lastCode][1].push(wordM.replaceAll(",", "").replaceAll(";", "").replaceAll('"', ''))
                } else if (numberOfQuotes == 1) {
                    if (!inString) {
                        if (lastStrIndex() + 1) {
                            storage.code[lastCode][1][lastStrIndex()] += wordM.replace('"', '') + " ";
                        } else {
                            storage.code[lastCode][1][0] = wordM.replace('"', '') + " ";
                        }
                    } else {
                        if (word[0] !== '"') {
                            const newWord = wordM.split('"')[0];
                            storage.code[lastCode][1][lastStrIndex()] += newWord + " ";
                        }
                    }
                    inString = !inString;

                } else if (inString) {
                    storage.code[lastCode][1][lastStrIndex()] += word + " ";

                } else {
                    storage.code[lastCode][1].push(wordM.replace(",", "").replace(";", ""))
                }
            }
        }

        function leer(words) {
            const storage = getParent();
            const creatingVars = []

            for (let wordM of words) {
                if (wordM === "//") break;
                creatingVars.push(wordM.replace(",", "").replace(";", ""));
                if (wordM.includes(";") || isLastWord(wordM, words)) {
                    creatingVars.forEach(variable => storage.code.push(["leer", variable]));
                    break;
                }
            }
        }

        function definir(words) {
            const storage = getParent();
            const creatingVars = [];
            let como = false;
            let firstEmptyValue = 0;

            for (let wordM of words) {
                const word = wordM.toLowerCase();
                if (wordM === "//") break;

                if (word === "como") { como = true; continue; }

                if (como) {
                    if (word === "cadena" || word === "caracter") firstEmptyValue = "";
                    if (word === "real") firstEmptyValue = 0.0;
                    if (word === "logico") firstEmptyValue = false;
                    for (variable of creatingVars)
                        storage.code.push(["setvar", variable, firstEmptyValue, wordM]);
                    break;
                } else {
                    creatingVars.push(wordM.replace(",", "").replace(";", ""));

                    if (word.includes(";") || isLastWord(wordM, words)) {
                        for (variable of creatingVars) storage.code.push(["setvar", variable, 0, 0]);
                    }
                }

            }
        }

        function setvar(editingVar, words) {
            const storage = getParent();
            const operation = [];
            const arrow = words.shift();

            for (let wordM of words) {
                if (wordM === "//") break;

                operation.push(wordM.replace(";", ""));
                if (wordM.includes(";") || isLastWord(wordM, words)) {
                    storage.code.push(["setvar", editingVar, operation.join(" ")])
                };
            }
        }

        function si(words) {
            const storage = getParent();
            const operation = [];

            for (let wordM of words) {
                if (wordM === "//") break;
                if (wordM.toLowerCase() == "entonces") break;

                operation.push(wordM.replace(";", ""));
            }

            parent.push("si");
            storage.code.push(["si", { cond: operation, var: {}, code: [] }])
        }

        function siNo() {
            parent.pop();
            const storage = getParent();

            parent.push("sino");
            storage.code.push(["sino", { var: {}, code: [] }])
        }

        function mientras(words) {
            const storage = getParent();
            const operation = [];

            for (let wordM of words) {
                if (wordM === "//") break;
                if (wordM.toLowerCase() == "hacer") break;

                operation.push(wordM.replace(";", ""));
            }

            parent.push("mientras");
            storage.code.push(["mientras", { cond: operation, var: {}, code: [] }])
        }

        function fin() {
            parent.pop();
        }

        //// Compare Condition if eval() doesn't exist
        // function compCond(conds) {
        //   // & (only acepts one)
        //   if (conds.includes("&")) {
        //     const parts = splitArray(conds, "&");
        //     return {
        //       oper: "&",
        //       first: compCond(parts[0]),
        //       second: compCond(parts[1]),
        //     };
        //   }

        //   // <= (only acepts one)
        //   if (conds.includes("<=")) {
        //     const parts = splitArray(conds, "<=");
        //     return {
        //       oper: "<=",
        //       first: compCond(parts[0]),
        //       second: compCond(parts[1]),
        //     };
        //   }

        //   // >= (only acepts one)
        //   if (conds.includes(">=")) {
        //     const parts = splitArray(conds, ">=");
        //     return {
        //       oper: ">=",
        //       first: compCond(parts[0]),
        //       second: compCond(parts[1]),
        //     };
        //   }

        //   // < (only acepts one)
        //   if (conds.includes("<")) {
        //     const parts = splitArray(conds, "<");
        //     return {
        //       oper: "<",
        //       first: compCond(parts[0]),
        //       second: compCond(parts[1]),
        //     };
        //   }

        //   // > (only acepts one)
        //   if (conds.includes(">")) {
        //     const parts = splitArray(conds, ">");
        //     return {
        //       oper: ">",
        //       first: compCond(parts[0]),
        //       second: compCond(parts[1]),
        //     };
        //   }

        //   return {
        //     oper: "Resolve",
        //     first: conds
        //   };
        // }

        // function splitArray(arr, separator) {
        //   const final = [[],[]];
        //   let inArr = 0;
        //   for (item of arr) {
        //     if (item == separator) {
        //       if (!inArr) {
        //         inArr = 1;
        //       } else {
        //         final[1].push(item);
        //       }
        //     } else {
        //       final[inArr].push(item);
        //     }
        //   }
        //   return final;
        // }
    }
}
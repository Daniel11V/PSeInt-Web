const ej = {
    proceso: {
      name: '',
      var: {},
      code: []
    }
  }
  
  const isLastWord = (w, ws) => w === ws[ws.length - 1]
  let parent = [];
  
  function getParent() {
    if (parent.length == 2) {
      return data[parent[0]].code[code.length -1][1];
    } 
    return data[parent[0]];
  }
  
  function compProceso(words) {
    let name = "";
    parent.push("proceso");
  
    for (wordM of words) {
      if (wordM === "//") break;
  
      if (name.length) name += " ";
      name += wordM;
  
      if (wordM.includes(";") || isLastWord(wordM, words)) {
        data.proceso.name = name;
        break;
      }
  
    }
  }
  
  function compFinProceso() {
    parent = [];
  }
  
  function execProceso(words) {
    for (wordM of words) {
      if (wordM === "//") break;
      
      if (data.name.length) data.name += " ";
      data.name += wordM;
    }
  }
  
  function compEscribir(words) {
    const storage = getParent();
    storage.code.push(["escribir", [""]]);
    let inString = false;
    const lastStr = storage.code.length - 1;
    const lastStrInStr = storage.code[lastStr][1].length - 1;
    
    for (wordM of words) {
      const word = wordM.toLowerCase();
      if (wordM === "//") break;
      
      if (word.includes('"')) {
        if (!inString) {
          if (storage.code[lastStr][1].length) {
              storage.code[lastStr][1][lastStrInStr] += " " + wordM.replace('"', "");
          } else {
              storage.code[lastStr][1][0] = wordM.replace('"', "");
          }
        } else {
          if (word[0] !== '"') {
              const newWord = wordM.split('"')[0];
              storage.code[lastStr][1][lastStrInStr] += " " + newWord;
          }
        }
        inString = !inString
        
      } else if (inString) {
          storage.code[lastStr][1][lastStrInStr] += " " + word;
          
      } else {
          storage.code[lastStr][1].push(wordM.replace(",", "").replace(";", ""))
          if (word.includes(";") || isLastWord(wordM, words)) break;
      }
    }
  }
  
  function compLeer(words) {
    const storage = getParent();
    const creatingVars = []
  
    for (wordM of words) {
      if (wordM === "//") break;
      creatingVars.push(wordM.replace(",", "").replace(";", ""));
      if (wordM.includes(";") || isLastWord(wordM, words)) {
        creatingVars.forEach(variable => storage.code.push(["leer", variable]));
        break;
      }
    }
  }
  
  function compDefinir(words) {
    const storage = getParent();
    const creatingVars = [];
    let como = false;
    let firstEmptyValue = 0;
  
    for (wordM of words) {
      const word = wordM.toLowerCase();
      if (wordM === "//") break;
                
      if (word === "como") {como = true; continue;}
  
      if (como) {
        if (word === "cadena" || word === "caracter") firstEmptyValue = "";
        if (word === "real") firstEmptyValue = 0.0;
        if (word === "logico") firstEmptyValue = false;
        for (variable of creatingVars) 
          storage.code.push(["setvar",variable, firstEmptyValue, wordM]);
        break;
      } else {   
        creatingVars.push(wordM.replace(",", "").replace(";", ""));
        
        if (word.includes(";") || isLastWord(wordM, words)) {
          for (variable of creatingVars) storage.code.push(["setvar",variable, 0, 0]);
        }
      }
                
    }
  }
  
  function execDefinir(words) {
    const creatingVars = [];
    let como = false;
    let firstEmptyValue = 0;
  
    for (wordM of words) {
      const word = wordM.toLowerCase();
      if (wordM === "//") break;
                
      if (word === "como") {como = true; continue;}
  
      if (como) {
        if (word === "cadena" || word === "caracter") firstEmptyValue = "";
        if (word === "real") firstEmptyValue = 0.0;
        if (word === "logico") firstEmptyValue = false;
        for (variable of creatingVars) data.var[variable] = [firstEmptyValue, wordM];
        break;
      } else {   
        creatingVars.push(wordM.replace(",", "").replace(";", ""));
        if (word.includes(";") || isLastWord(wordM, words)) {
          for (variable of creatingVars) data.var[variable] = [0, 0];
        }
      }
                
    }
  }
  
  function compSetvar(editingVar, words) {
    const storage = getParent();
    const operation = [];
    const arrow = words.shift();
   
    for (wordM of words) {
      if (wordM === "//") break;
      
      operation.push(wordM.replace(";", ""));
      if (wordM.includes(";") || isLastWord(wordM, words)) {
        storage.code.push(["setvar", editingVar, operation.join(" ")])
      };
    }
  }
  
  function execCondicion(conds) {
    const operation = [];
    const arrow = words.shift();
   
    for (cond of conds) {
      if (Array.isArray(cond)) cond = execCondicion(cond);
      
      operation.push(wordM.replace(";", ""));
      if (wordM.includes(";") || isLastWord(wordM, words)) {
        data.result.push(["setvar", editingVar, operation.join(" ")])
      };
    }
  }
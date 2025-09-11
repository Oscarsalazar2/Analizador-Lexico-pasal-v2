// Palabras reservadas (minúsculas)
const palabrasreservadas = new Set([
  "program",
  "const",
  "type",
  "var",
  "array",
  "of",
  "record",
  "function",
  "procedure",
  "begin",
  "end",
  "if",
  "then",
  "else",
  "while",
  "do",
  "for",
  "to",
  "downto",
  "repeat",
  "until",
  "case",
  "with",
  "goto",
  "and",
  "or",
  "not",
  "div",
  "mod",
  "true",
  "false",
  "integer",
  "real",
  "boolean",
  "char",
  "string",
  "write",
  "writeln",
  "read",
  "readln",
  "uses",
  "input",
  "output",
]);

const libreria = new Set([
  "system",
  "sysutils",
  "strutils",
  "math",
  "dateUtils",
  "Types",
  "variants",
  "typInfo",
  "crt",
  "winCrt",
  "video",
  "keyboard",
  "mouse",
  "printers",
  "dos",
  "fileUtil",
  "baseUnix",
  "unix",
  "windows",
  "process",
  "shell",
  "iniFiles",
  "graph",
  "winGraph",
  "dialogs",
  "Forms",
  "controls",
  "graphics",
  "extctrls",
  "menus",
  "classes",
  "contnrs",
  "rtlconsts",
  "syncobjs",
  "sockets",
  "ssockets",
  "fphttpclient",
  "fpftpclient",
  "fpjson",
  "jsonparser",
  "xmlread",
  "netdb",
  "db",
  "sqldb",
  "sqlite3conn",
  "mysql57conn",
  "pqconnection",
  "odbcconn",
  "threads",
  "syncobjs",
  "MTProcs",
  "mathconsts",
  "comobj",
  "printers",
  "registry",
  "filectrl",
]);

const TOKEN_CODES = {
  // Categorías principales (tu mapa)
  PALABRA_RESERVADAS: 0,
  LIBRERIA: 1,
  IDENTIFICADOR: 2,
  NUMERO: 3,
  CADENA: 4,
  COMENTARIO: 5,
  ASIGNACION: 7,
  CONDICIONES: 8, // (<, >, <=, >=, =, <>)
  OPERADOR: 11, // (+, -, *, /)
  SIMBOLOS_ESPECIALES: 12, // (; : , . ( ) [ ] ..)
  ERROR: 99,

  NUMERO_ENTERO: 3,
  NUMERO_REAL: 3,

  IGUAL: 8,
  MENOR: 8,
  MAYOR: 8,
  MENOR_IGUAL: 8,
  MAYOR_IGUAL: 8,
  DESIGUALDAD: 8,

  SUMA: 11,
  RESTA: 11,
  MULTIPLICACION: 11,
  DIVISION: 11,

  
  PUNTO_COMA: 12,
  DOS_PUNTOS: 12,
  COMA: 12,
  PUNTO: 12,
  PARENTESIS_ABIERTO: 12,
  PARENTESIS_CERRADO: 12,
  CORCHETE_ABIERTO: 12,
  CORCHETE_CERRADO: 12,
  PUNTOPUNTO: 12,
};

const TOKEN_CODES_TABLA = {

  PALABRA_RESERVADAS: 0,
  LIBRERIA: 1,
  IDENTIFICADOR: 2,
  NUMERO: 3,
  CADENA: 4,
  COMENTARIO: 5,
  ASIGNACION: 7,
  CONDICIONES: 8, 
  OPERADORES: 11, 
  SIMBOLOS_ESPECIALES: 12, 
  ERROR: 99,
};


function tokenizar(codigo) {
  const tokens = [];
  const tokenRE = new RegExp(
    [
      "(\\s+)", 
      "(\\(\\*[\\s\\S]*?\\*\\))", 
      "(\\{[\\s\\S]*?\\})", 
      "(//[^\\n]*)", 
      "('(?:''|[^'])*')", 
      "(\\.\\.)", 
      "(:=|<=|>=|<>)", 
      "([+\\-*/=<>])", 
      "([;:.,()\\[\\]])", 
      "([A-Za-z_][A-Za-z0-9_]*)", 
      "((?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?)", 
      "(.)", 
    ].join("|"),
    "g"
  );

  let m;
  while ((m = tokenRE.exec(codigo)) !== null) {
    const idx = m.index;
    // helper: calcular línea y columna (1-based)
    const before = codigo.slice(0, idx);
    const line = (before.match(/\n/g) || []).length + 1;
    const lastCr = before.lastIndexOf("\n");
    const column = lastCr === -1 ? idx + 1 : idx - lastCr;

    // m[1] = espacios en blanco
    if (m[1]) {
      continue;
    }
    // comentarios
    if (m[2]) {
      const type = "COMENTARIO";
      tokens.push({
        type,
        lexeme: m[2],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }
    if (m[3]) {
      const type = "COMENTARIO";
      tokens.push({
        type,
        lexeme: m[3],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }
    if (m[4]) {
      const type = "COMENTARIO";
      tokens.push({
        type,
        lexeme: m[4],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // string literal: quitar comillas externas y reemplazar '' -> '
    if (m[5]) {
      const raw = m[5];
      const inner = raw.slice(1, -1).replace(/''/g, "'");
      const type = "CADENA";
      tokens.push({
        type,
        lexeme: inner,
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // ..
    if (m[6]) {
      const type = "PUNTOPUNTO";
      tokens.push({
        type,
        lexeme: m[6],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // operadores mas (:=, <=, >=, <>)
    if (m[7]) {
      const map = {
        ":=": "ASIGNACION",
        "<=": "MENOR_IGUAL",
        ">=": "MAYOR_IGUAL",
        "<>": "DESIGUALDAD",
        
      };
      const tipoMul = map[m[7]];
      // tipoMul siempre está mapeado; si no, cae a ERROR para no dejar "OPERADORES" sin código
      const type = tipoMul || "ERROR";
      tokens.push({
        type,
        lexeme: m[7],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // operadores simples + - * / = < >
    if (m[8]) {
      const map = {
        "+": "SUMA",
        "-": "RESTA",
        "*": "MULTIPLICACION",
        "/": "DIVISION",
        "=": "IGUAL",
        "<": "MENOR",
        ">": "MAYOR",
      };
      const type = map[m[8]] || "ERROR";
      tokens.push({
        type,
        lexeme: m[8],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // delimitadores ; : , . ( ) [ ]
    if (m[9]) {
      const map = {
        ";": "PUNTO_COMA",
        ":": "DOS_PUNTOS",
        ",": "COMA",
        ".": "PUNTO",
        "(": "PARENTESIS_ABIERTO",
        ")": "PARENTESIS_CERRADO",
        "[": "CORCHETE_ABIERTO",
        "]": "CORCHETE_CERRADO",
      };
      const type = map[m[9]] || "ERROR";
      tokens.push({
        type,
        lexeme: m[9],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // identifier / keyword
    if (m[10]) {
      const lex = m[10].toLowerCase(); //  convierto a minúsculas
      let type;
      if (palabrasreservadas.has(lex)) {
        type = "PALABRA_RESERVADAS"; // ← plural, como quieres que se muestre
      } else if (libreria.has(lex)) {
        type = "LIBRERIA";
      } else {
        type = "IDENTIFICADOR";
      }
      tokens.push({
        type,
        lexeme: m[10],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // números (entero/real/exponentes)
    if (m[11]) {
      const lex = m[11];
      const esReal = /[.\eE]/.test(lex);
      const type = esReal ? "NUMERO_REAL" : "NUMERO_ENTERO";
      tokens.push({
        type,
        lexeme: lex,
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }

    // token de error: carácter no reconocido
    if (m[12]) {
      const type = "ERROR";
      tokens.push({
        type,
        lexeme: m[12],
        line,
        column,
        code: TOKEN_CODES[type] ?? -1,
      });
      continue;
    }
  }

  return tokens;
}

// UI: render tokens
function renderTokens(tokens) {
  const tbody = document.getElementById("tokensBody");
  if (!tokens.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="letras">Sin tokens (entrada vacía o sólo espacios).</td></tr>';
    return;
  }
  tbody.innerHTML = tokens
    .map((t, i) => {
      const lex = escapeHtml(String(t.lexeme));
      return `<tr>
          <td>${i + 1}</td>
          <td>${t.line}:${t.column}</td>
          <td>${t.type}</td>
          <td><pre style="margin:0;background:transparent;border:0;padding:0">${lex}</pre></td>
          <td>${t.code}</td>
        </tr>`;
    })
    .join("");
}

// Escape para HTML
function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Eventos UI
document.getElementById("btnAnalizar").addEventListener("click", () => {
  const codigo = document.getElementById("codigo").value;
  const tokens = tokenizar(codigo);
  renderTokens(tokens);
});

document.getElementById("btnCargarEjemplo").addEventListener("click", () => {
  const sample = `program Ejemplo;
var s: string;
begin
  s := 'can''t';
  // comentario de línea
  { comentario en llaves }
  (* comentario de bloque
     multilinea *)
  if s <> '' then
    writeln(s);
  x := 3.14e-2;
  r := 1..10;
end.`;
  document.getElementById("codigo").value = sample;
});

document.getElementById("btnLimpiar").addEventListener("click", () => {
  document.getElementById("codigo").value = "";
  document.getElementById("tokensBody").innerHTML =
    '<tr><td colspan="5" class="letras">Presiona <strong>Analizar</strong> para generar tokens.</td></tr>';
});

// file load (.pas)
const fileInput = document.getElementById("fileInput");
document
  .getElementById("btnCargasPas")
  .addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (ev) =>
    (document.getElementById("codigo").value = ev.target.result);
  reader.readAsText(f);
});

// download .lex
document.getElementById("btnDescargar").addEventListener("click", () => {
  const codigo = document.getElementById("codigo").value;
  const tokens = tokenizar(codigo);
  if (!tokens.length) {
    alert("Primero analiza el código o asegúrate de que no esté vacío.");
    return;
  }
  // Encabezado incluye la nueva columna NUMERO
  let content = "LINEA:COL\tTIPO\tLEXEMA\tNUMERO\n";
  for (const t of tokens) {
    content += `${t.line}:${t.column}\t${t.type}\t${t.lexeme}\t${t.code}\n`;
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resultado.lex";
  a.click();
  URL.revokeObjectURL(url);
});

// Mostrar tabla predeterminada de números de token
document.getElementById("btnListaCodigos").addEventListener("click", () => {
  const tbody = document.querySelector("#tablaCodigos tbody");
  tbody.innerHTML = "";

  // Recorrer el diccionario TOKEN_CODES y llenar tabla
  for (const [token, numero] of Object.entries(TOKEN_CODES_TABLA)) {
    const row = `<tr>
      <td>${numero}</td>
      <td>${token}</td>
    </tr>`;
    tbody.innerHTML += row;
  }

  document.getElementById("modalCodigos").style.display = "block";
});

// Cerrar modal
document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalCodigos").style.display = "none";
});

// Cerrar si se hace clic fuera del modal
window.addEventListener("click", (event) => {
  const modal = document.getElementById("modalCodigos");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

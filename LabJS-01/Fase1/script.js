var nome = "Joana";
console.log(nome); // "João"

nome = "Mariana";
console.log(nome); // “Maria”

let idade = 20;
console.log(idade); // 20

idade = 21;
console.log(idade); // 21

let morada = "Rua das Flores, 21";
console.log(morada); // "Rua das Flores, 21"

// **const**
const PI = 3.14;
console.log(PI); // 3.14

const dois = 2.0;
console.log(dois);

/*let dois = 3.0;
console.log(dois); deu erro*/

// *Tipos de Dados*

// String
let frase = "Olá, mundo!";
console.log(typeof frase); // "string"
// Number

let numero = 10;
console.log(typeof numero); // “number”
// Boolean

let verdadeiro = true;
console.log(typeof verdadeiro); // "boolean"
// Arroy

let lista = ["banana", "maçã", "laranja"];
console.log(typeof lista); // "object"
// Object

let pessoa = { nome: "João", idade: 20 };
console.log(typeof pessoa); // “object”
// num)

let nulo = null;
console.log(typeof nulo); // "object"

// undefined

let indefinido;
console.log(typeof indefinido); // “undefined”

let Array = [
  "Olá, mundo!",
  10,
  true,
  ["banana", "maçã", "laranja"],
  { nome: "João", idade: 20 },
  null,
  undefined,
];

for (let i = 0; i < Array.length; i++) {
  console.log(Array[i]);
}

// Criando um objeto com diferentes propriedades
const Object = {
  string: "Olá, mundo!",
  number: 10,
  boolean: true,
  array: ["banana", "maçã", "laranja"],
  object: { nome: "João", idade: 20 },
  nullValue: null,
  undefinedValue: undefined,
};

console.log(Object); //simples actually

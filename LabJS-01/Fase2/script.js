// Obter o elemento botão
const botao = document.getElementById("botao");

// Adicionar um event handler ao botao
botao.addEventListener("click", function () {
  //Manipular o elemento h1
  const h1 = document.querySelector("h1");
  h1.textContent = "Botão clicado!";
  h1.style.backgroundColor = "red";
});

// diferença entre document e window?
window.addEventListener("load", function () {
  const h1 = document.querySelector("h1");
  h1.textContent = "Olá, mundo!";
});

document.addEventListener("DOMContentLoaded", function () {
  const texto = document.getElementById("texto");

  texto.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      console.log(texto.value);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const lista = document.getElementById("lista");

  lista.addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
      event.target.remove();
    }
  });
});

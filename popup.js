var paginasPop = [];
var tiempoT = 0;
var porcentaje = false;
let contador;
document.addEventListener("DOMContentLoaded", function () {
  actualizarLista();
  iniciarContador();
});
// detiene el contador
function detenerContador() {
  clearInterval(contador);
}
//iniciar contador
function iniciarContador() {
  contador = setInterval(actualizarLista, 5000);
}
// Actualziar cronometro
function actualizarCronometro(i, tiempoH, tiempoM, paginas) {
  var tiempo =
    paginas[i].inicioCronometro + paginas[i].tiempoAlerta - paginas[i].tiempo;
  if (paginas[i].cronometroActivado) {
    tiempoH = Math.floor(tiempo / 60000 / 60);
    tiempoM = Math.ceil((tiempo / 60000) % 60);
  }
  return { tiempoH: tiempoH, tiempoM: tiempoM };
}
//conseguir datos
function conseguirDatos(){
  const mensaje = {
    tipo: "Cargado",
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    paginasPop = response.array;
    tiempoT = response.tiempoT;
    return {array: response.array, tiempo:response.tiempoT};
  });
};
// Actualziar Valroes lista
function actualziarValroes(){
  const listaMadre = document.querySelector(".listaUl");
  if(listaMadre.firstChild){
    const array = conseguirDatos(array);
    const tiempo = conseguirDatos(tiempo);
    const ls = parseInt(array.length);
    for (let i = 0; i < ls; i++){
      const pagina = document.querySelector(`.li-${i}`);
      const temporizador = pagina.querySelector(".tiempo");
      
    }
  }
};
// Actualizar lista
function actualizarLista() {
  let busquedaInput = document.querySelector("#busqueda").value;
  borrarLu();
  const mensaje = {
    tipo: "Cargado",
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    paginasPop = response.array;
    tiempoT = response.tiempoT;
    imprimirLista(response.array, response.tiempoT, busquedaInput);
  });
}
//Imprimir lista de paginas
function imprimirLista(paginas, tiempoTotal, busquedaInput) {
  console.log("tiempo total" + tiempoTotal);
  const ls = parseInt(paginas.length);
  const lu = document.querySelector(".listaUl");

  for (let i = 0; i < ls; i++) {
    const listaCronometro = document.createElement("DIV");
    listaCronometro.classList.add("lista-cronometro");
    const listas = document.createElement("LI");
    listas.classList.add("pagina");
    listas.classList.add(`li-${i}`);
    var minutos = 0;
    var tiempo = "Minutos";
    var cantidadTiempo = 0;
    var textoTiempo = "";
    var horas = 0;
    var restante = 0;
    var tiempoH = 0;
    var tiempoM = 0;
    var resultadoCronometro = actualizarCronometro(
      i,
      tiempoH,
      tiempoM,
      paginas
    );
    tiempoH = resultadoCronometro.tiempoH;
    tiempoM = resultadoCronometro.tiempoM;
    if (Math.floor(paginas[i].tiempo / 60000) < 60) {
      cantidadTiempo = (paginas[i].tiempo / 60000).toFixed(2);
    } else if (Math.floor(paginas[i].tiempo / 60000) >= 60) {
      tiempo = "Hora";
      restante = (paginas[i].tiempo / 60000) % 60;
      console.log(restante);
      minutos = Math.floor(restante);
      console.log(minutos);
      cantidadTiempo = Math.floor(paginas[i].tiempo / 60000 / 60);
      console.log(cantidadTiempo);
      if (cantidadTiempo > 1) {
        tiempo = "Horas";
      }
    }
    if (!porcentaje) {
      if (minutos != 0) {
        textoTiempo = `${cantidadTiempo} ${tiempo} & ${minutos} Minutos`;
      } else {
        textoTiempo = `${cantidadTiempo} ${tiempo}`;
      }
    } else {
      var totalEnM = tiempoTotal / 60000;
      var porcentajeT = ((paginas[i].tiempo / 60000 / totalEnM) * 100).toFixed(
        2
      );
      textoTiempo = `${porcentajeT}%`;
    }
    var botonBorrar = document.createElement("img");
    botonBorrar.setAttribute("type", "input");
    botonBorrar.classList.add("borrar");
    botonBorrar.src = "./assets/delete-1487-svgrepo-com.svg";
    botonBorrar.addEventListener("click", function () {
      borrarPagina(i);
    });
    var icono = document.createElement("img");
    icono.classList.add("icono");
    icono.src = paginas[i].icono;
    var contenedorTiempo = document.createElement("DIV");
    contenedorTiempo.classList.add("contenedor-tiempo");
    var tiempoElemento = document.createElement("p");
    tiempoElemento.classList.add("tiempo");
    tiempoElemento.textContent = textoTiempo;
    contenedorTiempo.appendChild(tiempoElemento);
    var contenedorNombre = document.createElement("DIV");
    contenedorNombre.classList.add("contenedor-nombre");
    var nombre = document.createElement("p");
    nombre.classList.add("nombre");
    nombre.textContent = paginas[i].url;
    contenedorNombre.appendChild(nombre);
    var cronometro = document.createElement("img");
    cronometro.classList.add("cronometro");
    cronometro.src = "./assets/timer-svgrepo-com.svg";
    var configCronometro = document.createElement("DIV");
    configCronometro.classList.add("config-cronometro");
    configCronometro.classList.add(`c${i}`);
    if (tiempoH != 0 || tiempoM != 0) {
      configCronometro.style.height = "50px";
    } else {
      configCronometro.style.height = "0px";
    }
    cronometro.addEventListener("click", function () {
      cronometroBoton(i);
    });
    var divConfigCronometro = document.createElement("DIV");
    var timerC = document.createElement("DIV");
    timerC.classList.add("timers");
    divConfigCronometro.classList.add("divCronometro");
    var tiempoCronomreto = document.createElement("input");
    tiempoCronomreto.classList.add(`horas${i}`);
    tiempoCronomreto.type = "number";
    tiempoCronomreto.placeholder = "H";
    tiempoCronomreto.min = 0;
    if (tiempoH != 0) {
      tiempoCronomreto.value = tiempoH;
    }
    var separador = document.createElement("P");
    separador.textContent = ":";
    separador.classList.add("separador");
    var tiempoCronomreto1 = document.createElement("input");
    tiempoCronomreto1.classList.add(`minutos${i}`);
    tiempoCronomreto1.type = "number";
    tiempoCronomreto1.placeholder = "M";
    tiempoCronomreto1.min = 0;
    tiempoCronomreto1.max = 59;
    if (tiempoM != 0) {
      tiempoCronomreto1.value = tiempoM;
    }
    const comenzar = document.createElement("INPUT");
    comenzar.classList.add(`comenzar${i}`);
    comenzar.classList.add(`comenzar`);
    comenzar.classList.add("button");
    comenzar.value = "Comenzar";
    comenzar.type = "submit";
    comenzar.addEventListener("click", function () {
      cronometroComenzar(i);
    });
    const cancelar = document.createElement("INPUT");
    cancelar.classList.add(`cancelar${i}`);
    cancelar.classList.add(`cancelar`);
    cancelar.classList.add("button");
    cancelar.value = "Cancelar";
    cancelar.type = "submit";
    cancelar.addEventListener("click", function () {
      cronometroCancelar(i);
    });
    const contando = document.createElement('img');
    contando.src = './assets/Spinner-1s-200px.svg'
    contando.classList.add('contando');
    contando.classList.add(`contando${i}`);
    if (tiempoH != 0 || tiempoM != 0) {
      cancelar.style.display = "flex";
      comenzar.style.display = "none";
      contando.style.display = "flex";
    } else {
      cancelar.style.display = "none";
      comenzar.style.display = "flex";
      contando.style.display = "none";
    }
    timerC.appendChild(tiempoCronomreto);
    timerC.appendChild(separador);
    timerC.appendChild(tiempoCronomreto1);
    divConfigCronometro.appendChild(timerC);
    configCronometro.appendChild(divConfigCronometro);
    configCronometro.appendChild(contando);
    configCronometro.appendChild(comenzar);
    configCronometro.appendChild(cancelar);
    listas.appendChild(botonBorrar);
    listas.appendChild(icono);
    listas.appendChild(contenedorTiempo);
    listas.appendChild(contenedorNombre);
    listas.appendChild(cronometro);
    listaCronometro.appendChild(listas);
    listaCronometro.appendChild(configCronometro);
    lu.appendChild(listaCronometro);
  }
  console.log(porcentaje);
  buscar(busquedaInput);
}
function borrarPagina(i) {
  console.log("se borro");
  const mensaje = {
    tipo: "Borrar",
    dato: i,
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    console.log(response.data);
    location.reload();
  });
}
//Barra de busqueda
const barraBusqueda = document.getElementById("buscadaDiv");
barraBusqueda.addEventListener("input", function () {
  let busquedaInput = document.querySelector("#busqueda").value;
  console.log(busquedaInput);
  buscar(busquedaInput);
});
//funcion busqueda
function buscar(input) {
  console.log(paginasPop);
  const ls = parseInt(paginasPop.length);
  for (let i = 0; i < ls; i++) {
    var pagina = document.querySelector(`.li-${i}`);
    if (!paginasPop[i]["url"].toLowerCase().includes(input)) {
      pagina.style.display = "none";
      console.log("No tiene: " + paginasPop[i]["url"].toLowerCase());
    } else {
      console.log("tiene: " + paginasPop[i]["url"].toLowerCase());
      pagina.style.display = "flex";
    }
  }
}
// Cambiar orden
const botonOrden = document.querySelector(".orden");
botonOrden.addEventListener("click", function () {
  console.log("si entro");
  const mensaje = {
    tipo: "Ordenar",
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    borrarLu();
    actualizarLista();
  });
});
// Cambiar de porcentaje O a porcentaje
const botonPorcentaje = document.querySelector(".porcentaje");
botonPorcentaje.addEventListener("click", function () {
  if (porcentaje) {
    porcentaje = false;
  } else {
    porcentaje = true;
  }
  const mensaje = {
    tipo: "Porcentaje",
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    borrarLu();
    actualizarLista();
  });
});
// borrar Paginas
function borrarLu() {
  const lu = document.querySelector(".listaUl");
  while (lu.firstChild) {
    lu.removeChild(lu.firstChild);
  }
}
// Configurar cronometro
function cronometroBoton(i) {
  const listaLu = document.querySelector(".listaUl");
  const cronometroOpciones = listaLu.querySelector(`.c${i}`);
  if (cronometroOpciones.style.height == "0px") {
    cronometroOpciones.style.height = "50px";
    detenerContador();
  } else {
    cronometroOpciones.style.height = "0px";
    iniciarContador();
  }
}
// Comenzar cronometro
function cronometroComenzar(i) {
  const cancelar = document.querySelector(`.cancelar${i}`);
  const comenzar = document.querySelector(`.comenzar${i}`);
  const contando = document.querySelector(`.contando${i}`);
  const valueH = document.querySelector(`.horas${i}`);
  const valueM = document.querySelector(`.minutos${i}`);
  const tiempoH = valueH.value * 60 * 60000;
  const tiempoM = valueM.value * 60000;
  const mensaje = {
    tipo: "Cronometro",
    dato: i,
    tiempo: tiempoH + tiempoM,
  };
  chrome.runtime.sendMessage(mensaje, function (response) {});
  cancelar.style.display = "flex";
  comenzar.style.display = "none";
  contando.style.display = "flex";
}
// Cancelar cronometro
function cronometroCancelar(i) {
  const tiempoCronomreto1 = document.querySelector(`.minutos${i}`);
  const tiempoCronomreto = document.querySelector(`.horas${i}`);
  const contando = document.querySelector(`.contando${i}`);
  const cancelar = document.querySelector(`.cancelar${i}`);
  const comenzar = document.querySelector(`.comenzar${i}`);
  const mensaje = {
    tipo: "Cancelar",
    dato: i,
  };
  chrome.runtime.sendMessage(mensaje, function (response) {});
  cancelar.style.display = "none";
  comenzar.style.display = "flex";
  tiempoCronomreto1.value = "";
  tiempoCronomreto.value = "";
  contando.style.display = "none";
}
//escucahr mensajes
chrome.runtime.onMessage.addEventListener(function (message) {
  if (message.tipo === "Alerta") {
    alert("¡" + message.dato + "!");
    console.log(message.dato);
    sendResponse("hola");
  }
});


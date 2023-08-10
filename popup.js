var paginasPop = [];
var tiempoT = 0;
var porcentaje = false;
let contador;
var filtro = 999;
document.addEventListener("DOMContentLoaded", function () {
  actualizarLista();
  iniciarContador();
});
//Detectar boton filtros
const btnfiltro1 = document.querySelector(".btn-filtro1");
const btnfiltro3 = document.querySelector(".btn-filtro3");
const btnfiltro7 = document.querySelector(".btn-filtro7");
const btnfiltrosAll = document.querySelector(".btn-filtros-all");
btnfiltro1.addEventListener("click", function () {
  filtrarPorDias(1);
});
btnfiltro3.addEventListener("click", function () {
  filtrarPorDias(3);
});
btnfiltro7.addEventListener("click", function () {
  filtrarPorDias(7);
});
btnfiltrosAll.addEventListener("click", function () {
  filtrarPorDias(999);
});
//filtrar
function filtrarPorDias(x) {
  filtro = x;
  actualizarLista();
}
// detiene el contador
function detenerContador() {
  clearInterval(contador);
}
//iniciar contador
function iniciarContador() {
  contador = setInterval(actualizarValores, 50000);
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
async function conseguirDatos() {
  const mensaje = {
    tipo: "Cargado",
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(mensaje, function (response) {
      paginasPop = response.array;
      tiempoT = response.tiempoT;
      resolve({
        array: response.array,
        tiempo: response.tiempoT,
        activa: response.activa,
      });
    });
  });
}
// Actualizar Valores lista solo modificando el text el html
async function actualizarValores() {
  const listaMadre = document.querySelector(".listaUl");
  if (listaMadre.firstChild) {
    const datos = await conseguirDatos();
    const array = datos.array;
    const tiempo = datos.tiempo;
    const ls = parseInt(array.length);
    for (let i = 0; i < ls; i++) {
      const pagina = array[i];
      var anterior;
      if (array[i].url == datos.activa) {
        if (array[i].tiempo > anterior) {
          actualizarLista();
          break;
        }
      }
      const paginaHtml = document.querySelector(`.li-${i}`);
      const temporizador = paginaHtml.querySelector(".tiempo");
      temporizador.textContent = calcularTiempo(pagina, tiempo);
      anterior = array[i].tiempo;
    }
  }
}
// Actualizar lista imprimiendola otra vez
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

//Calcular Tiempo
function calcularTiempo(pagina, tiempoTotal) {
  var minutos = 0;
  var tiempo = "Minutos";
  var cantidadTiempo = 0;
  var restante = 0;
  var textoTiempo = "";
  var paginaTiempo =0;
  var tiempoAtras = pagina.fechas;
  var suma;
  console.log("calcular tiempooooooooooooooooooooo")
  if (filtro != 999) {
    const fechaHoy = new Date();
    const fechaN = fechaHoy.setHours(fechaHoy.getHours());
    const dia = 60000;
    //const dia = 24*60*60*1000;
    const n = tiempoAtras.length;
    console.log("El filtro es = "+filtro)
    console.log(tiempoAtras)
    if (filtro == 1){
      console.log("este es el lagro = "+n)
      for (
        let i = 0;
        i < tiempoAtras.length;
        i++
      ) {
        console.log("este es el i = "+i)
        console.log("este es el tiempo = "+tiempoAtras[i].fecha)
        if(tiempoAtras[i].fecha >= fechaN-dia){
          if(i !=0){
            paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i-1].tiempo;
          console.log("Pagina tiempooooooooooooooooooooooooooooooooooooooooooooooooo = "+paginaTiempo);
          break;
          }else{
            paginaTiempo = tiempoAtras[n-1].tiempo;
            break;
          } 
        }
      }
    } else if (filtro == 3) {
      for (
        let i = 0;
        i < tiempoAtras.length;
        i++
      ){
        if(tiempoAtras[i].fecha >= fechaN-(dia*3)){
          paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i].tiempo;
          break;
        }
      }
    } else if (filtro == 7) {
      for (
        let i = 0;
        i < tiempoAtras.length;
        i++
      ) {
        if(tiempoAtras[i].fecha >= fechaN-(dia*7)){
          paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i].tiempo;
          break;
        }
      }
    }
  } else {
    paginaTiempo = pagina.tiempo;
  }
  if (Math.floor(paginaTiempo / 60000) < 60) {
    cantidadTiempo = (paginaTiempo / 60000).toFixed(2);
  } else if (Math.floor(paginaTiempo / 60000) >= 60) {
    tiempo = "Hora";
    restante = (paginaTiempo / 60000) % 60;
    minutos = Math.floor(restante);
    cantidadTiempo = Math.floor(paginaTiempo / 60000 / 60);
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
    var porcentajeT = ((paginaTiempo / 60000 / totalEnM) * 100).toFixed(2);
    textoTiempo = `${porcentajeT}%`;
  }
  return textoTiempo;
}
//Calcular tiempo total con filtro
function tiempoTFiltro(){
  if (filtro == 1){
    console.log("este es el lagro = "+n)
    for (
      let i = 0;
      i < tiempoAtras.length;
      i++
    ) {
      console.log("este es el i = "+i)
      console.log("este es el tiempo = "+tiempoAtras[i].fecha)
      if(tiempoAtras[i].fecha >= fechaN-dia){
        if(i !=0){
          paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i-1].tiempo;
        console.log("Pagina tiempooooooooooooooooooooooooooooooooooooooooooooooooo = "+paginaTiempo);
        break;
        }else{
          paginaTiempo = tiempoAtras[n-1].tiempo;
          break;
        } 
      }
    }
  } else if (filtro == 3) {
    for (
      let i = 0;
      i < tiempoAtras.length;
      i++
    ){
      if(tiempoAtras[i].fecha >= fechaN-(dia*3)){
        paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i].tiempo;
        break;
      }
    }
  } else if (filtro == 7) {
    for (
      let i = 0;
      i < tiempoAtras.length;
      i++
    ) {
      if(tiempoAtras[i].fecha >= fechaN-(dia*7)){
        paginaTiempo = tiempoAtras[n-1].tiempo-tiempoAtras[i].tiempo;
        break;
      }
    }
  }
}
//Imprimir lista de paginas
function imprimirLista(paginas, tiempoTotal, busquedaInput) {
  const ls = parseInt(paginas.length);
  const lu = document.querySelector(".listaUl");
  for (let i = 0; i < ls; i++) {
    const listaCronometro = document.createElement("DIV");
    listaCronometro.classList.add("lista-cronometro");
    listaCronometro.classList.add(`li-cr${i}`);
    const listas = document.createElement("LI");
    listas.classList.add("pagina");
    listas.classList.add(`li-${i}`);
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
    var textoTiempo = calcularTiempo(paginas[i], tiempoTotal);
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
    const contando = document.createElement("img");
    contando.src = "./assets/Spinner-1s-200px.svg";
    contando.classList.add("contando");
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
  buscar(busquedaInput);
}
function borrarPagina(i) {
  const mensaje = {
    tipo: "Borrar",
    dato: i,
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    location.reload();
  });
}
//Barra de busqueda
const barraBusqueda = document.getElementById("buscadaDiv");
barraBusqueda.addEventListener("input", function () {
  let busquedaInput = document.querySelector("#busqueda").value;
  buscar(busquedaInput);
});
//funcion busqueda
function buscar(input) {
  const ls = parseInt(paginasPop.length);
  for (let i = 0; i < ls; i++) {
    var pagina = document.querySelector(`.li-cr${i}`);
    if (!paginasPop[i]["url"].toLowerCase().includes(input)) {
      pagina.style.display = "none";
    } else {
      pagina.style.display = "flex";
    }
  }
}
// Cambiar orden
const botonOrden = document.querySelector(".orden");
botonOrden.addEventListener("click", function () {
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
    botonPorcentaje.src = "./assets/percentage-svgrepo-com.svg";
  } else {
    porcentaje = true;
    botonPorcentaje.src = "./assets/number-sign-110-svgrepo-com.svg";
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
  } else {
    cronometroOpciones.style.height = "0px";
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
    sendResponse("hola");
  }
});

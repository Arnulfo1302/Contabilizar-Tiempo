var paginasPop = [];
var tiempoT = 0;
var porcentaje = false;
document.addEventListener("DOMContentLoaded", function () {
actualizarLista();
});
// Actualizar lista
function actualizarLista(){
  const mensaje = {
    tipo: "Cargado",
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    imprimirLista(response.array,response.tiempoT);
    paginasPop =response.array;
    tiempoT =response.tiempoT;
  });
};
//Imprimir lista de paginas
function imprimirLista(paginas,tiempoTotal) {
  console.log("tiempo total"+tiempoTotal);
  const ls = parseInt(paginas.length);
  const lu = document.querySelector(".listaUl");
  var tiempo = "Minutos";
  var cantidadTiempo = 0;
  var textoTiempo = "";
  var horas = 0;
  var restante = 0;
  var minutos = 0;
  for (let i = 0; i < ls; i++) {
    const listas = document.createElement("LI");
    listas.classList.add('pagina');
    listas.classList.add(`li-${i}`);

    if (Math.floor(paginas[i].tiempo / 60000) < 60) {
      cantidadTiempo = (paginas[i].tiempo / 60000).toFixed(2);
    } else if (Math.floor(paginas[i].tiempo / 60000) >= 60) {
      tiempo = "Hora";
      horas = Math.floor(paginas[i].tiempo / 60000);
      restante = ((paginas[i].tiempo / 60000).toFixed(2)) % horas;
      console.log(restante);
      minutos = (restante*60).toFixed(2);
      console.log(minutos);
      cantidadTiempo = Math.floor(paginas[i].tiempo / 60000 / 60);
      console.log(cantidadTiempo);
      if (cantidadTiempo > 1) {
        tiempo = "Horas";
      }
    }
    if(!porcentaje){
      if(minutos != 0){
        textoTiempo = `${cantidadTiempo} ${tiempo} & ${minutos} Minutos`;
      }else {
        textoTiempo = `${cantidadTiempo} ${tiempo}`;
      }
    }else {
      var totalEnM = (tiempoTotal/60000);
      var porcentajeT = ((paginas[i].tiempo / 60000/totalEnM)*100).toFixed(2);
      textoTiempo = `${porcentajeT}%`;
      console.log("pagina: "+paginas[i].url+" tiempo: "+paginas[i].tiempo/60000+" TiempoT: "+tiempoTotal/60000+" Porcentaje: "+porcentajeT)
    }
    var botonBorrar = document.createElement('img');
    botonBorrar.setAttribute('type', 'input');
    botonBorrar.classList.add('borrar');
    botonBorrar.src = './assets/delete-1487-svgrepo-com.svg';
    botonBorrar.addEventListener('click', function() {
        borrarPagina(i);
      });
    var icono = document.createElement('img');
    icono.classList.add('icono');
    icono.src = paginas[i].icono;
    var contenedorTiempo = document.createElement('DIV');
    contenedorTiempo.classList.add("contenedor-tiempo");
    var tiempoElemento = document.createElement('p');
    tiempoElemento.classList.add('tiempo');
    tiempoElemento.textContent = textoTiempo;
    contenedorTiempo.appendChild(tiempoElemento)
    var contenedorNombre = document.createElement('DIV');
    contenedorNombre.classList.add('contenedor-nombre');
    var nombre = document.createElement('p');
    nombre.classList.add('nombre');
    nombre.textContent = paginas[i].url;
    contenedorNombre.appendChild(nombre);
    var cronometro = document.createElement('img');
    cronometro.classList.add('cronometro');
    cronometro.src = './assets/timer-svgrepo-com.svg';
    var configCronometro = document.createElement('DIV')
    configCronometro.classList.add('config-cronometro');
    configCronometro.classList.add(`c${i}`);
    configCronometro.style.height = "0px"
    cronometro.addEventListener('click', function() {
      cronometroBoton(i);
    });
    var divConfigCronometro = document.createElement('DIV');
    var timerC = document.createElement('DIV');
    timerC.classList.add('timers');
    divConfigCronometro.classList.add('divCronometro');
    var tiempoCronomreto = document.createElement('input');
    tiempoCronomreto.classList.add('hora1');
    tiempoCronomreto.type = "number";
    tiempoCronomreto.placeholder = "H";
    tiempoCronomreto.min= 0;
    var separador = document.createElement('P');
    separador.textContent = ':';
    separador.classList.add("separador");
    var tiempoCronomreto1 = document.createElement('input');
    tiempoCronomreto.classList.add('hora2');
    tiempoCronomreto1.type = "number";
    tiempoCronomreto1.placeholder = "M";
    tiempoCronomreto1.min= 0;
    tiempoCronomreto1.max= 59;
    /*var tiempoCronomreto2 = document.createElement('input');
    tiempoCronomreto.classList.add('minuto1');
    tiempoCronomreto2.type = "number";
    tiempoCronomreto2.placeholder = "M";
    tiempoCronomreto2.min= 0;
    tiempoCronomreto2.max= 9;
    var tiempoCronomreto3 = document.createElement('input');
    tiempoCronomreto.classList.add('minuto2');
    tiempoCronomreto3.type = "number";
    tiempoCronomreto3.placeholder = "M";
    tiempoCronomreto3.min= 0;
    tiempoCronomreto3.max= 9;*/
    const comenzar = document.createElement("INPUT");
    comenzar.classList.add("comenzar");
    comenzar.classList.add("button");
    comenzar.value = "Comenzar";
    comenzar.type = "submit";
    timerC.appendChild(tiempoCronomreto);
    timerC.appendChild(separador);
    timerC.appendChild(tiempoCronomreto1);
    /*timerC.appendChild(tiempoCronomreto2);
    timerC.appendChild(tiempoCronomreto3);*/
    divConfigCronometro.appendChild(timerC);
    configCronometro.appendChild(divConfigCronometro);
    configCronometro.appendChild(comenzar);
    listas.appendChild(botonBorrar);
    listas.appendChild(icono);
    listas.appendChild(contenedorTiempo);
    listas.appendChild(contenedorNombre);
    listas.appendChild(cronometro);
    lu.appendChild(listas);
    lu.appendChild(configCronometro);
  }
  console.log(porcentaje);
}
function borrarPagina(i){
    console.log("se borro")
    const mensaje = {
        tipo: "Borrar",
        dato: i
      };
      chrome.runtime.sendMessage(mensaje, function (response) {
        console.log(response.data);
        location.reload();
      });
}
//Barra de busqueda
const barraBusqueda = document.getElementById('buscadaDiv');
barraBusqueda.addEventListener('input', function()  {
let busquedaInput = document.querySelector('#busqueda').value;
console.log(busquedaInput);
buscar(busquedaInput);
});
//funcion busqueda
function buscar(input) {
  console.log(paginasPop)
  const ls = parseInt(paginasPop.length);
  for (let i = 0; i < ls; i++){
    var pagina = document.querySelector(`.li-${i}`);
    if ((!paginasPop[i]['url'].toLowerCase().includes(input))){
      pagina.style.display="none";
      console.log("No tiene: "+paginasPop[i]['url'].toLowerCase())
    }else {
      console.log("tiene: "+paginasPop[i]['url'].toLowerCase())
      pagina.style.display="flex";
    }
  }
}
// Cambiar orden
const botonOrden = document.querySelector(".orden");
botonOrden.addEventListener('click' , function() {
  console.log('si entro');
  const mensaje = {
    tipo: "Ordenar"
  };
  chrome.runtime.sendMessage(mensaje, function (response) {
    borrarLu();
    imprimirLista(response.array,response.tiempoT);
  });
});
// Cambiar de porcentaje O a porcentaje
const botonPorcentaje = document.querySelector(".porcentaje");
botonPorcentaje.addEventListener('click' , function(){
if(porcentaje){
  porcentaje=false;
}else {
  porcentaje=true;
}
const mensaje = {
  tipo: "Porcentaje"
};
chrome.runtime.sendMessage(mensaje, function (response) {
  borrarLu();
  imprimirLista(response.array,response.tiempoT);
});
});
// borrar Paginas
function borrarLu(){
  const lu = document.querySelector(".listaUl");
  while (lu.firstChild){
    lu.removeChild(lu.firstChild);
  };
};
// Configurar cronometro
function cronometroBoton(i){
const listaLu = document.querySelector(".listaUl");
const cronometroOpciones = listaLu.querySelector(`.c${i}`);
  if(cronometroOpciones.style.height == "0px"){
    cronometroOpciones.style.height = "50px"
  }else {
    cronometroOpciones.style.height = "0px"
  }
};
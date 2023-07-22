var activeTabId = null;
var startTime = null;
var elapsedTime = 0;
var paginas = [];
var orden = true;
var tiempoTotal = 0;
// Se verifica si el url ya existe en el array
function hasExistingUrl(url) {
  return paginas.some((pagina) => pagina.url === url);
}
// Guarda el array en formato JSON en el storage de chrome
function guardarArray() {
  var paginasJSON = JSON.stringify(paginas);
  chrome.storage.local.set({ key: paginasJSON });
};
// cuando see abre chrome se convierte el JSON al array paginas
chrome.runtime.onStartup.addListener(function () {
  cargarArray();
});
//
function cargarArray() {
  chrome.storage.local.get("key", function (result) {
    var paginasJSON = result.key;
    if (paginasJSON) {
      paginas = JSON.parse(paginasJSON);
    }
  });
};
// Obtiene la informacion de la pagina
function getCurrentTab(tab) {
  return new Promise((resolve, reject) => {
    const finalUrl = tab.url.split("/")[2];
    if (!hasExistingUrl(finalUrl)) {
      const nuevaPagina = {
        url: finalUrl,
        titulo: tab.title,
        tiempo: 0,
        icono: tab.favIconUrl,
        tiempoAnterior: 0,
      }
      paginas.push(nuevaPagina);
    }else {
      const paginaActiva = paginas.find((pagina) => pagina.url === finalUrl);
      if(paginaActiva.icono == ''){
        paginaActiva.icono = "/assets/brand_google_chrome_icon_157340.svg";
      } else if(paginaActiva.icono != '' && paginaActiva.icono != "/assets/brand_google_chrome_icon_157340.svg"){
        paginaActiva.icono = tab.favIconUrl;
      }
    };
    resolve(tab);
  });
}
//sumar tiempo total
function sumarTiempoTotal(array){
  tiempoTotal = 0;
  for (let i = 0; i < array.length; i++){
    tiempoTotal += array[i].tiempo;
  }
}
// Actualiza el tiempo de visualizacion en el array
function updateElapsedTime(tab) {
  if (activeTabId !== null && startTime !== null) {
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    const paginaActiva = paginas.find((pagina) => pagina.url === activeTabId);
    if (paginaActiva) {
      if (paginaActiva.tiempo == 0) {
        paginaActiva.tiempo += elapsedTime;
        paginaActiva.tiempoAnterior = elapsedTime;
      } else {
        paginaActiva.tiempo += elapsedTime;
        if(paginaActiva.tiempo - paginaActiva.tiempoAnterior <= paginaActiva.tiempoAnterior ){
          paginaActiva.tiempo = paginaActiva.tiempo;
        }else {
          paginaActiva.tiempo = paginaActiva.tiempo - paginaActiva.tiempoAnterior;
        }
        console.log("Tiempo Pagina Activa: "+paginaActiva.tiempo);
        console.log("Tiempo Anterios: "+paginaActiva.tiempoAnterior);
        paginaActiva.tiempoAnterior = elapsedTime;
      }
    }
  }
  guardarArray();
  cargarArray();
}
// Ordenar array
function ordenarArray(){
  if(orden){
    paginas.sort((a, b) => b.tiempo - a.tiempo);
  }else {
    paginas.sort((a, b) => a.tiempo - b.tiempo);
  }
  updateElapsedTime();
}
// Se inicia el conteo de tiempo
function inicioConteo(activeInfo) {
  setTimeout(async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      console.log(await getCurrentTab(tab));
      const finalUrl = tab.url.split("/")[2];
      if (activeTabId !== finalUrl) {
        updateElapsedTime(tab);
        activeTabId = finalUrl;
        startTime = new Date();
      }
    }
  }, 1000); // Retraso de 1 segundo para que no tenga problemas al pasar pestañas rápidamente
}
chrome.tabs.onActivated.addListener(inicioConteo);
chrome.tabs.onCreated.addListener(inicioConteo);
chrome.tabs.onUpdated.addListener(inicioConteo);
// Actualizar el tiempo cada x segundos por si no se cambia de pestaña
setInterval(updateElapsedTime, 10000);
//enviar el array al scrip.js para imprimirlo en el html
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if(message.tipo === "Cargado"){
    guardarArray();
    cargarArray();
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Borrar"){
    guardarArray();
    cargarArray();
    paginas.splice(message.dato,1)
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  }else if (message.tipo === "Ordenar"){
    guardarArray();
    cargarArray();
    if(orden){
      orden=false;
    }else{
      orden=true;
    }
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  }else if (message.tipo === "Porcentaje"){
    guardarArray();
    cargarArray();
    ordenarArray();
    sumarTiempoTotal(paginas);
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  }
});

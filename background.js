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
  var tiempoTJSON = JSON.stringify(tiempoTotal);
  chrome.storage.local.set({ key: paginasJSON });
  chrome.storage.local.set({ time: tiempoTJSON });
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
  chrome.storage.local.get("time", function(resultT) {
    var tiempoTJSON = resultT.time;
    if (tiempoTJSON) {
      tiempoTotal = JSON.parse(tiempoTJSON);
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
// Actualiza el tiempo de visualizacion en el array
function updateElapsedTime(tab) {
  if (activeTabId !== null && startTime !== null) {
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    console.log("Tiempo total de pagina = "+elapsedTime);
    const paginaActiva = paginas.find((pagina) => pagina.url === activeTabId);
    if (paginaActiva) {
      console.log("tiempo anterior 0 = "+paginaActiva.tiempoAnterior);
      if (paginaActiva.tiempo == 0) {
        paginaActiva.tiempo += elapsedTime;
        tiempoTotal = paginaActiva.tiempo+tiempoTotal-paginaActiva.tiempoAnterior;
        paginaActiva.tiempoAnterior = elapsedTime;
      } else {
        paginaActiva.tiempo += elapsedTime;
        console.log('tiempo 1 = '+paginaActiva.tiempo);
        if(paginaActiva.tiempo - paginaActiva.tiempoAnterior <= paginaActiva.tiempoAnterior ){
          paginaActiva.tiempoAnterior = 0;
        }
        paginaActiva.tiempo = paginaActiva.tiempo - paginaActiva.tiempoAnterior;
        console.log('tiempo 2 = '+paginaActiva.tiempo);
        tiempoTotal = paginaActiva.tiempo+tiempoTotal-paginaActiva.tiempoAnterior;
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
        console.log("inicio" + startTime);
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
    cargarArray();
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Borrar"){
    cargarArray();
    paginas.splice(message.dato,1)
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  }else if (message.tipo === "Ordenar"){
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
    cargarArray();
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal
    };
    sendResponse(respuesta);
  }
});

var activeTabId = null;
var startTime = null;
var fechaInicio = null;
var elapsedTime = 0;
var paginas = [];
var orden = true;
var tiempoTotal = 0;
var tiempo = 0;
var multiplicador = 0;
// Se verifica si el url ya existe en el array
function hasExistingUrl(url) {
  return paginas.some((pagina) => pagina.url === url);
}
function fechaExistente(url) {
  return paginas.some((pagina) => pagina.url === url);
}
// Guarda el array en formato JSON en el storage de chrome
function guardarArray() {
  var paginasJSON = JSON.stringify(paginas);
  chrome.storage.local.set({ key: paginasJSON });
}
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
}
// Obtiene la informacion de la pagina
function getCurrentTab(tab) {
  return new Promise((resolve, reject) => {
    var finalUrl = tab.url.split("/")[2];
    if (finalUrl.startsWith("www")) {
      finalUrl = finalUrl.replace(/www./i, "");
    }
    if (!hasExistingUrl(finalUrl)) {
      const nuevaPagina = {
        url: finalUrl,
        titulo: tab.title,
        tiempo: 0,
        icono: tab.favIconUrl,
        tiempoAnterior: 0,
        inicioCronometro: 0,
        tiempoAlerta: 0,
        cronometroActivado: false,
        fechas: [],
      };
      paginas.push(nuevaPagina);
    } else {
      const paginaActiva = paginas.find((pagina) => pagina.url === finalUrl);
      if (paginaActiva.icono == "") {
        paginaActiva.icono = "/assets/brand_google_chrome_icon_157340.svg";
      } else if (
        paginaActiva.icono != "" &&
        paginaActiva.icono != "/assets/brand_google_chrome_icon_157340.svg"
      ) {
        paginaActiva.icono = tab.favIconUrl;
      }
    }
    resolve(tab);
  });
}
//sumar tiempo total
function sumarTiempoTotal(array) {
  tiempoTotal = 0;
  for (let i = 0; i < array.length; i++) {
    tiempoTotal += array[i].tiempo;
  }
}
// Calcular tiempo Cuenta atras
function cuentaAtras(paginaActiva, startTime, endTime, dia, elapsedTime) {
  const fechas = paginaActiva.fechas;
  if(fechas.length != 0){
    if(fechas[fechas.length-1].conteo != 12 && endTime > fechas[fechas.length-1].fecha+4600){
      fechas[fechas.length-1].conteo +=1;
      //fechas[fechas.length-1].tiempo = paginaActiva.tiempo;
    }else if(fechas[fechas.length-1].conteo == 12) {
      const fechaTiempo = {
        fecha: endTime,
        tiempo: paginaActiva.tiempo,
        conteo: 1,
      };
      fechas.push(fechaTiempo);
    }
  }else{
    const fechaTiempo = {
      fecha: endTime,
      tiempo: paginaActiva.tiempo,
      conteo: 1,
    };
    fechas.push(fechaTiempo);
  }
}
// Actualiza el tiempo de visualizacion en el array
function updateElapsedTime(tab) {
  if (activeTabId !== null && startTime !== null) {
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    var horas = new Date();
    //const dia = 24*60*60*1000;
    const dia = 60000;
    const paginaActiva = paginas.find((pagina) => pagina.url === activeTabId);
    if (paginaActiva) {
      if (paginaActiva.tiempo == 0) {
        paginaActiva.tiempo += elapsedTime;
        paginaActiva.tiempoAnterior = elapsedTime;
      } else {
        paginaActiva.tiempo += elapsedTime;
        if (
          paginaActiva.tiempo - paginaActiva.tiempoAnterior <=
          paginaActiva.tiempoAnterior
        ) {
          paginaActiva.tiempo = paginaActiva.tiempo;
        } else {
          paginaActiva.tiempo = paginaActiva.tiempo - paginaActiva.tiempoAnterior;
        }
        paginaActiva.tiempoAnterior = elapsedTime;
        cuentaAtras(paginaActiva,startTime.setHours(startTime.getHours()),endTime.setHours(endTime.getHours()),dia,elapsedTime);
      }
      if (paginaActiva.tiempoAlerta != 0) {
        if (
          paginaActiva.tiempo >=
          paginaActiva.inicioCronometro + paginaActiva.tiempoAlerta
        ) {
          mandarAlerta(
            paginaActiva.url,
            paginaActiva.tiempoAlerta,
            paginaActiva.icono
          );
        }
      }
    }
  }
  guardarArray();
  cargarArray();
  miarray = paginas
}
// Ordenar array
function ordenarArray() {
  if (orden) {
    paginas.sort((a, b) => b.tiempo - a.tiempo);
  } else {
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
      var finalUrl = tab.url.split("/")[2];
      if (finalUrl.startsWith("www")) {
        finalUrl = finalUrl.replace(/www./i, "");
      }
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
setInterval(updateElapsedTime, 5000);
//enviar el array al scrip.js para imprimirlo en el html
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.tipo === "Cargado") {
    guardarArray();
    cargarArray();
    ordenarArray();
    sumarTiempoTotal(paginas);
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal,
      activa: activeTabId,
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Borrar") {
    guardarArray();
    cargarArray();
    paginas.splice(message.dato, 1);
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal,
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Ordenar") {
    guardarArray();
    cargarArray();
    if (orden) {
      orden = false;
    } else {
      orden = true;
    }
    ordenarArray();
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal,
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Porcentaje") {
    guardarArray();
    cargarArray();
    ordenarArray();
    sumarTiempoTotal(paginas);
    const respuesta = {
      array: paginas,
      tiempoT: tiempoTotal,
    };
    sendResponse(respuesta);
  } else if (message.tipo === "Cronometro") {
    paginas[message.dato].tiempoAlerta = message.tiempo;
    paginas[message.dato].inicioCronometro = paginas[message.dato].tiempo;
    paginas[message.dato].cronometroActivado = true;
  } else if (message.tipo === "Cancelar") {
    paginas[message.dato].tiempoAlerta = 0;
    paginas[message.dato].inicioCronometro = 0;
    paginas[message.dato].cronometroActivado = false;
  }
});
//Mandar alerta
function mandarAlerta(paginaU, tiempo, icono) {
  const tiempoT = tiempo / 60000;
  const tiempoH = 0;
  const tiempoM = 0;

  if (tiempoT > 60) {
    tiempoH = Math.floor(tiempoT / 60);
    tiempoM = Math.floor(tiempoT % 60);
  }
  const paginaActiva = paginas.find((pagina) => pagina.url === paginaU);
  var alert = "";
  if (tiempoT < 60 && tiempoT > 1) {
    alert = "Se completo " + tiempoT + " Minutos en " + paginaU;
  } else if (tiempoT <= 1) {
    alert = "Se completo " + tiempoT + " Minuto en " + paginaU;
  } else if (tiempoT == 60) {
    alert = "Se completo " + tiempoT + " hora en " + paginaU;
  } else {
    if ((tiempoH = 1)) {
      alert =
        "Se completo " +
        tiempoH +
        " Hora y" +
        tiempoM +
        " Minutos en " +
        paginaU;
    } else if (tiempoH > 1) {
      alert =
        "Se completo " +
        tiempoH +
        " Horas y" +
        tiempoM +
        " Minutos en " +
        paginaU;
    }
  }
  chrome.notifications.create("Alerta", {
    type: "basic",
    iconUrl: `${icono}`,
    title: "Alerta",
    message: `${alert}`,
  });
  paginaActiva.tiempoAlerta = 0;
  paginaActiva.inicioCronometro = 0;
  paginaActiva.cronometroActivado = false;
}
function getArraySizeInBytes(array) {
  const serializedArray = JSON.stringify(array);
  const sizeInBytes = new TextEncoder().encode(serializedArray).length;
  return sizeInBytes;
}
var miarray = paginas;
console.log("Tamaño del array en bytes:", getArraySizeInBytes(miarray));

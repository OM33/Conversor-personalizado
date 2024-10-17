var spinner = $("#sp");

spinner.hide();

var urlBtc = "https://api.coindesk.com/v1/bpi/currentprice.json";
var urlDt = "https://ve.dolarapi.com/v1/dolares/oficial";
var urlArs = "https://dolarapi.com/v1/dolares/blue";

function moneda(nombre, tipoDeCambio, url) {
  this.nombre = nombre;
  this.tipoDeCambio = tipoDeCambio;
  this.url = url;

  this.obtenerTipoDeMoneda = function (datos) {
    if (this.nombre == "ARS") {
      this.tipoDeCambio = datos.venta;
    } else if (this.nombre == "BTC") {
      this.tipoDeCambio = 1 / parseFloat(datos.bpi.USD.rate_float);
    } else if (this.nombre == "BSS") {
      this.tipoDeCambio = datos.promedio;
    } else if (this.nombre == "USD") {
      this.tipoDeCambio = 1;
    }
  };

  this.convertir = function (otramoneda, monto, c) {
    fetch(otramoneda.url)
      .then((data1) => data1.json())
      .then((data1) => {
        otramoneda.obtenerTipoDeMoneda(data1);
        return fetch(this.url)
          .then((data2) => data2.json())
          .then((data2) => {
            this.obtenerTipoDeMoneda(data2);
            var result = (monto / otramoneda.tipoDeCambio) * this.tipoDeCambio;
            result = parseFloat(result).toFixed(6);
            c.innerHTML =
              monto + " " + otramoneda.nombre + " = " + result + this.nombre;
          });
      })
      .catch((error) => {
        alert("Error en peticiones");
      });
  };
}

var ARS = new moneda("ARS", 86.77, urlArs);

var BTC = new moneda("BTC", 1 / 8321.77, urlBtc);

var BSS = new moneda("BSS", 37.77, urlDt);

var USD = new moneda("USD", 1, urlDt);

var monedas = [ARS, BTC, BSS, USD];

function convertirMoneda() {
  var _de = document.getElementById("de").value;
  var _a = document.getElementById("a").value;
  var _monto = document.getElementById("monto").value;
  var _conversion = document.getElementById("conversion");
  var moneda1 = new moneda();
  var moneda2 = new moneda();
  if (_monto == "") {
    _conversion.innerHTML = "Debe colocar un monto para hacer una conversion";
  } else if (_de == _a) {
    _conversion.innerHTML =
      "Debe colocar dos tipos diferentes de moneda en las opciones";
  } else {
    //mapeando la moneda de ' + moneda1.nombre + ' a ' + moneda2.nombre
    monedas.forEach((m) => {
      if (_de == m.nombre) {
        moneda1 = m;
      }
      if (_a == m.nombre) {
        moneda2 = m;
      }
    });
    //CONVIRTIENDO MONEDA
    moneda2.convertir(moneda1, _monto, _conversion);
  }
}

function obtenerDatosBTC() {
  resultado.innerHTML = "";
  spinner.show();

  fetch(urlBtc)
    .then((data) => data.json())
    .then((datos) => {
      spinner.hide();
      resultado.innerHTML = `
        </br>
            <h2>Precio BTC- USD</h2>
            <h1>${datos.bpi.USD.rate_float} ${datos.bpi.USD.code} ${datos.bpi.USD.symbol}</h1>
            <h2>Datos tomados en: ${datos.time.updated}</h2>
            <p>${datos.disclaimer}</p>
            `;
    })
    .catch((error) => {
      resultado.innerHTML = "Opps Algo salio mal";
    });
}

function obtenerDatosDT() {
  resultado.innerHTML = "";
  spinner.show();
  fetch("https://ve.dolarapi.com/v1/dolares/oficial")
    .then((data) => data.json())
    .then((datos) => {
      spinner.hide();
      resultado.innerHTML = `
        </br>
            <h2>Precio USD - BS (Transferencia)</h2>
            <h1>${datos.promedio} Bs </h1>
            <p>datos tomados de Dolarapi.ve</p>
            `;
    })
    .catch((error) => {
      alert("Error en peticiones");
    });
}

function obtenerDatosARS() {
  resultado.innerHTML = "";
  spinner.show();

  fetch("https://dolarapi.com/v1/dolares/blue")
    .then((data1) => data1.json())
    .then((datos1) => {
      let ARSblue = parseFloat(datos1.venta);

      // Now fetch the official rate
      return fetch("https://dolarapi.com/v1/dolares/oficial")
        .then((data2) => data2.json())
        .then((datos2) => {
          let ARSoficial = parseFloat(datos2.venta);
          // Hide spinner and show the results after both fetches are complete
          spinner.hide();
          resultado.innerHTML = `
                    </br>
                        <h2>Precio USD - ARS (Oficial)</h2>
                        <h1>${ARSoficial} ARS$</h1>
                        <h2>Precio USD - ARS (Blue)</h2>
                        <h1>${ARSblue} ARS$</h1>
                        <p>datos tomados de Dolarapi.ar</p>
                    `;
        });
    })
    .catch((error) => {
      spinner.hide();
      alert("Error en peticiones");
    });
}

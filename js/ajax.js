
var spinner = $('#sp');

spinner.hide();


var urlBtc = 'https://api.coindesk.com/v1/bpi/currentprice.json';
var urlDt = "https://s3.amazonaws.com/dolartoday/data.json";
var urlArs = "http://ws.geeklab.com.ar/dolar/get-dolar-json.php";

function getFetch(url) {
    return fetch(url);
}

function getArs(data) {
    console.log("Chee Somos Argentinos yeeey", data);
    let ARS = parseFloat(data.libre);
    ARS = ARS + ((ARS * 30) / 100);
    return ARS;
}
function getBtc(data) {
    console.log('Viva satoshi nakamotooo woohooo ', data);
    console.log('Bitcoins');
    let BTC = 1 / parseFloat(data.bpi.USD.rate_float);
    return BTC;
}
function getBss(data) {
    console.log('Viva chaveee.... no mentira ', data);
    console.log('Bolivares Soberanos');
    return data.USD.transferencia;
}



function moneda(nombre, tipoDeCambio, url) {
    this.nombre = nombre;
    this.tipoDeCambio = tipoDeCambio;
    this.url = url;

    this.obtenerTipoDeMoneda = function (datos) {
        if (this.nombre == 'ARS') {
            this.tipoDeCambio = getArs(datos);
        } else if (this.nombre == 'BTC') {
            this.tipoDeCambio = getBtc(datos);
        } else if (this.nombre == 'BSS') {
            this.tipoDeCambio = getBss(datos);
        }
        else if (this.nombre == 'USD'){
            console.log('dolares americanos');
            this.tipoDeCambio = 1;
        }
    }


    this.convertir = function (otramoneda, monto, c) {


            getFetch(otramoneda.url)
                .then(data => data.json())
                // .then(data => {
                //     console.log("Datos desde el fetch ", data);
                // })
                .then(data => {
                    otramoneda.obtenerTipoDeMoneda(data);
                    console.log(otramoneda.tipoDeCambio);
                    return getFetch(this.url);
                })
                .then(data => data.json())
                .then(data =>{
                    this.obtenerTipoDeMoneda(data);
                    console.log(this.tipoDeCambio);                 
                })
                .catch(error => {
                    alert('Error en peticiones');
                });


        // console.log(this.tipoDeCambio);

        // otramoneda.tipoDeCambio = otramoneda.obtenerTipoDeCambio();
        // console.log(otramoneda.tipoDeCambio);

        var result = (monto / otramoneda.tipoDeCambio) * this.tipoDeCambio;

        result = parseFloat(result).toFixed(6);
        c.innerHTML = (monto + ' ' + otramoneda.nombre + ' = ' + result + this.nombre);

    }
}

var ARS = new moneda("ARS", 86.77, urlArs);

var BTC = new moneda("BTC", (1 / 8321.77), urlBtc);

var BSS = new moneda("BSS", 199996.77, urlDt);

var USD = new moneda("USD", 1, urlDt);

var monedas = [ARS, BTC, BSS, USD];

function convertirMoneda() {

    var _de = document.getElementById("de").value;
    var _a = document.getElementById("a").value;
    var _monto = document.getElementById('monto').value;
    var n1, n2;
    var _conversion = document.getElementById("conversion");
    var moneda1 = new moneda();
    var moneda2 = new moneda();

    if (_de == _a) {
        _conversion.innerHTML = ('Debe colocar dos tipos diferentes de moneda en las opciones');
    } else {

        monedas.forEach(m => {
            if (_de == m.nombre) {
                moneda1 = m;
            }
            if (_a == m.nombre) {
                moneda2 = m;
            }
        });
        console.log('mapeando la moneda de ' + moneda1.nombre + ' a ' + moneda2.nombre);

        moneda2.convertir(moneda1, _monto, _conversion);
    }
}


function obtenerDatosBTC() {

    resultado.innerHTML=''
    spinner.show();

    getFetch(urlBtc).
    then( data => data.json())
    .then(datos =>{
        console.log(datos);
        let resultado = document.querySelector('#resultado');  
        spinner.hide();    
        resultado.innerHTML = `
            <h2>Precio BTC- USD</h2>
            <h1>${datos.bpi.USD.rate_float} ${datos.bpi.USD.code} ${datos.bpi.USD.symbol}</h1>
            <h2>Datos tomados en: ${datos.time.updated}</h2>
            <p>${datos.disclaimer}</p>
            `;                   
    })
    .catch(error => {
        resultado.innerHTML='Opps Algo salio mal';
    });    

}

function obtenerDatosDT() {
    resultado.innerHTML = '';
    spinner.show();
    getFetch(urlDt).
    then(data => data.json())
    .then(datos =>{
        console.log(datos);
        let resultado = document.querySelector('#resultado');

        spinner.hide();
        resultado.innerHTML = `
            <h2>Precio USD - BSS (Transferencia)</h2>
            <h1>${datos.USD.transferencia} BsS </h1>
            <h2>Precio USD - BSS (Referencia Bitcoin)</h2>
            <h1>${datos.USD.localbitcoin_ref} BsS </h1>
            <h2>Datos tomados en: ${datos._timestamp.fecha}</h2>
            <p>datos tomados de Dolar Today</p>
            `;
    })
    .catch(error => {
        alert('Error en peticiones');
    });   
}

function obtenerDatosARS() {
    resultado.innerHTML = '';
    spinner.show();
    getFetch(urlArs).
    then( data => data.json())
    .then(datos =>{
        console.log(datos);
            let ARS = parseFloat(datos.libre);
            ARS = ARS + ((ARS * 30) / 100);
            console.log(ARS);
            let resultado = document.querySelector('#resultado');
            spinner.hide();
            resultado.innerHTML = `
                 <h2>Precio USD - ARS (Oficial)</h2>
                 <h1>${datos.libre} ARS$ </h1>
                 <h2>Precio USD - ARS (Blue)</h2>
                 <h1>${datos.blue} ARS$ </h1>
                 <h2>Precio USD - ARS (Impuesto Pais)</h2>
                 <h1>${ARS} ARS$ </h1>
                 
                 <p>datos tomados de GeekLab</p>
                `;
    })
    .catch(error => {
        alert('Error en peticiones');
    }); 
}
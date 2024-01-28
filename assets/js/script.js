const btnSend = document.getElementById('btnSend');
const searchCoin = document.getElementById('txtAmount');
const resultConvertion = document.getElementById('result');
const chartDiv = document.getElementById('chart');
const selectOption = document.getElementById('selectCoin');
let labelsGraph = [];
let dataGraph = [];
let myChart;

async function getConvertCoin(coin) {
  try {
    labelsGraph.length = 0;
    dataGraph.length = 0;
    const res = await fetch("https://mindicador.cl/api/" + coin);
    const data = await res.json();
    const arrayResult = [];
    let symbolCoin;

    for (let i = 0; i < 10; i++) {
      // Formatear la fecha en dd/mm/yyyy
      const dia = data.serie[i].fecha.slice(8, 10);
      const mes = data.serie[i].fecha.slice(5, 7);
      const anio = data.serie[i].fecha.slice(0, 4);
      const fechaFormateada = dia + '-' + mes + '-' + anio;
      const newVal = { "date": fechaFormateada, "value": data.serie[i].valor };
      arrayResult.unshift(newVal);
    }
    labelsGraph = arrayResult.map(serie => serie.date);
    dataGraph = arrayResult.map(serie => serie.value);

    switch(coin){
      case 'dolar':
        symbolCoin = 'USD';
        break;
      case 'euro':
        symbolCoin = 'EUR';
        break;
      case 'bitcoin':
        symbolCoin = 'BTC';
        break;    
    }
    resultConvertion.innerHTML = 'Resultado: ' + symbolCoin + ' ' + formatearNumero(parseFloat(searchCoin.value.replaceAll('.', '') / arrayResult[9].value).toFixed(2));

    // GENERAR GRÁFICO
    getChart(labelsGraph, dataGraph);
  } catch (error) {
    resultConvertion.innerHTML = 'Error al obtener datos: ' + error;
  }
}

// VALIDAR USUARIO INGRESE VALOR MAYOR A 0 Y SELECCIONE TIPO DE CAMBIO A CONVERTIR
const validateInfo = () => {
  const validVal = Number(searchCoin.value.replaceAll('.', ''));
  const validConvert = selectCoin.value;
  if (validVal <= 0) {
    alert('Ingrese Monto en CLP mayor a cero');
    txtAmount.focus();
    return;
  } else if (validConvert === '0') {
    alert('Seleccione Moneda a Convertir');
    selectCoin.focus();
    return;
  }
  getConvertCoin(validConvert);
}

// FUNCIÓN PARA GRAFICAR
const getChart = (myLabels, myData) => {
  var canvas = document.getElementById('myChart');
  const context = canvas.getContext('2d');
  if (myChart) {
    myChart.destroy();
  }
  chartDiv.style.display = 'flex';
  myChart = new Chart("myChart", {
    type: "line",
    responsive: true,
    maintainAspectRatio: true,
    data: {
      labels: myLabels,
      datasets: [{
        fill: false,
        label: "Variación Últimos 10 días",
        lineTension: 0,
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: myData
      }]
    },
    options: {
      legend: { display: true },
      scales: {
        //yAxes: [{ticks: {min: 10, max:10}}],
      }
    }
  });
}

// FUNCIÓN PARA INGRESAR SOLO NÚMEROS
function valideNumeric(evt) {
  const code = (evt.which) ? evt.which : evt.keyCode;
  if (code == 8) { // backspace.
    return true;
  } else if (code >= 48 && code <= 57) { // is a number.
    return true;
  } else { // other keys.
    return false;
  }
}

// SEPARAR EN MILES
let formatearNumero = (numero) => {
  return new Intl.NumberFormat("es-CL").format(numero);
}

// FORMATEAR EN MILES AL ESCRIBIR EN INPUT
function numberFormat(e) {
  if (this.value.trim() === "" || this.value.trim() === "-") {
    return;
  }
  let contenido = this.value.replaceAll('.', '');
  this.value = formatearNumero(contenido);
}

// FUNCIÓN PARA CARGAR OPTION DE SELECT
const renderSelect = async () => {
  try {
    const res = await fetch("https://mindicador.cl/api/");
    const data = await res.json();
    let renderSelect = `<option value="0">Seleccione Moneda</option>`;
    Object.keys(data).forEach((element) => {
      if (element === 'euro' || element === 'dolar' || element === 'bitcoin') {
        renderSelect += `<option value="${element}">${element}</option>`
      }
    });
    selectOption.innerHTML = renderSelect;
  } catch (error) {
    resultConvertion.innerHTML = 'Error al obtener datos: ' + error;
  }
}

document.getElementById('txtAmount').addEventListener('keypress', function (event) {
  valideNumeric(event);
});
document.querySelectorAll(".number").forEach(el => el.addEventListener("keyup", numberFormat));
document.querySelectorAll(".number").forEach(el => el.addEventListener("change", numberFormat));
btnSend.addEventListener('click', validateInfo);

renderSelect();
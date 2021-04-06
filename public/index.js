const sio = io();

var chart = new SmoothieChart();

sio.on('connect', () => {
  console.log('connected');

  canvas = document.getElementById('smoothie-chart');
  series = new TimeSeries();
  chart.addTimeSeries(series, {lineWidth:2,strokeStyle:'#00ff00'});
  chart.streamTo(canvas, 500);

  sio.emit('sum', {numbers: [1, 2]}, (result) => {
    console.log(result);
  });
});

sio.on('disconnect', () => {
  console.log('disconnected');
});

sio.on('mult', (data, cb) => {
  console.log("server called mult!")
  const result = data.numbers[0] * data.numbers[1];
  cb(result);
});

const ECHARTS_TIME_SPAN = 20;
const ECHARTS_UPDATE_EVERY = 0.1;
var echarts_series = [];
echarts_chart = echarts.init(document.getElementById('echarts_chart'));
let echarts_chart_opts = {
  xAxis: {
    animation: false,
    boundaryGap: false,
    type: 'value',
    min: 'dataMin',
    max: 'dataMax',
    scale: true,
    axisLabel: {
      show: true,
      minInterval: 5,
      maxInterval: 10,
      rotate: 45,
      formatter: ((value) => {
        dt = new Date(1000 * value);
        var minutes = dt.getMinutes();
        var seconds = dt.getSeconds();
        var label = String(minutes) + ':';
        // console.log(dt);
        if(seconds < 10) {
          label += '0';
        }
        label += String(seconds);
        // console.log(label);
        return label;
      })
    }
  },
  yAxis: {
    type: 'value',
    scale: 'true'
  },
  series: {
    data: echarts_series,
    type: 'line',
    lineStyle: {
      color: 'blue'
    },
    symbol: 'none',
    animation: false,
    hoverAnimation: false
  }
};


echarts_chart.setOption(echarts_chart_opts)


var last_update = new Date();
sio.on('rawdata', (rawdata) => {
  console.log(rawdata);
  let now = new Date();
  let evec = echarts_series;

  // update smoothie chart, it automatically removes points from view,
  // but we have less control
  series.append(now.getTime(), rawdata['value']);

  // update echarts chart, we manually remove points from view,
  // but we have total control
  evec.push([now.getTime()/1000.0, rawdata['value']]);

  // TODO - find a more efficient way to trim old values from data
  while(evec.length >= 2) {
    let time_span = Math.abs(evec[evec.length - 1][0] - evec[0][0])
    console.log(time_span);
    if(time_span <= ECHARTS_TIME_SPAN) {
      break;
    }
    evec.shift();
  }

  console.log(evec);
  console.log({time: Math.abs(now - last_update), thresh: ECHARTS_UPDATE_EVERY});
  
  if(Math.abs(now - last_update) >= ECHARTS_UPDATE_EVERY) {
    last_update = now;
    echarts_chart.setOption(
      {
        series : {
          data: echarts_series
        }
      }
    );
  }
}); /* end sio.on('rawdata', (rawdata) => */


function btn1_click() {
  console.log("yolo!");
  sio.emit('btn1_click', {test: ['a', 'b', 'c']}, (result) => {
      console.log(result);
  });
}

function btn2_click() {
  console.log("bling-blang!");
  sio.emit('btn2_click', {test: ['a', 'b', 'c']}, (result) => {
    console.log(result);
  });
}


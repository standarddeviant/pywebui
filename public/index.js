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

sio.on('rawdata', (rawdata) => {
  console.log(rawdata);
  series.append(new Date().getTime(), rawdata['value']);
  // line2.append(new Date().getTime(), Math.random());
});

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


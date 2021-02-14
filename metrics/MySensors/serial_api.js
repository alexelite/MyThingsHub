
exports.metrics = {
  /* V_TEMP         -   0 */
  TEMP: { name: 'C', regexp: /\b(?:0|V_TEMP)\:([-\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: '°', pin: 1, graph: 1, graphValSuffix: 'C', graphOptions: { legendLbl: 'Temperature' } },
  /* V_HUM          -   1 */
  HUM: { name: 'H', regexp: /\b(?:1|V_HUM)\:([\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: '%', pin: 1, graph: 1, graphOptions: { legendLbl: 'Humidity', lines: { lineWidth: 1 } } },
  /* V_STATUS       -   2 */
  STATUS: { name: 'STATUS', regexp: /\b(?:2|V_STATUS)\:(0|1)/i, value: '', duplicateInterval: 3600, valuation: function (value, numeric) { if (numeric) return value; else return (value ? "ON" : "OFF"); }, pin: 1, graph: 1, graphOptions: { legendLbl: 'Status', lines: { steps: true }, yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0'] } },
  /* V_PERCENTAGE   -   3 */
  PERCENTAGE: { name: 'PERCENTAGE', regexp: /\b(?:3|V_PERCENTAGE)\:(\d\d?(\.\d\d?)?|100(\.00?)?)$/i, value: '', unit: '%', pin: 1, graph: 1, graphOptions: { legendLbl: '%', yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0'] } },
  /* V_PRESSURE     -   4 */
  PRESSURE: { name: 'P', regexp: /\b(?:3|V_PRESSURE)\:([\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: 'atm', pin: 1, },
  /* V_ARMED        -   2 */
  ARMED: { name: 'ARMED', regexp: /\b(?:2|V_ARMED)\:(0|1)/i, value: '', pin: 1, graph: 1, graphOptions: { yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0'] } },
  /* V_TRIPPED      -   2 */
  TRIPPED: { name: 'TRIPPED', regexp: /\b(?:2|V_TRIPPED)\:(0|1)/i, value: '', pin: 1, graph: 1, graphOptions: { yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0'] } },
  /* V_WATT         -  17 */
  WATT: { name: 'WATT', regexp: /\b(?:17|V_WATT)\:([-\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: 'W', pin: 1, graph: 1, graphValSuffix: 'W', graphOptions: { legendLbl: 'Power' } },
  /* V_KWH          -  18 */
  KWH: { name: 'KWH', regexp: /\b(?:18|V_KWH)\:([-\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: 'kWh', pin: 1, graph: 1, graphValSuffix: 'kWh', graphOptions: { legendLbl: 'Energy' }, statistic: ["DAILY_USAGE"] },
  /* V_POWER_FACTOR -  56 */
  POWER_FACTOR: { name: 'POWER_FACTOR', regexp: /\b(?:56|V_POWER_FACTOR)\:([-\d\.]+)\b/i, value: '', duplicateInterval: 3600, unit: 'kWh', pin: 1, graph: 1, graphValSuffix: 'C', graphOptions: { legendLbl: 'Energy' } },

  /***   INTERNAL   ***/
  /* I_BATTERY_LEVEL -  1 */
  BATTERY: { name: 'BATTERY', regexp: /\b(?:_0|I_BATTERY_LEVEL)\:(\d\d?(\.\d\d?)?|100(\.00?)?)$/i, value: '', duplicateInterval: 3600, unit: '%', graph: 1, graphOptions: { legendLbl: 'Battery level', lines: { lineWidth: 1 }, grid: { backgroundColor: { colors: ['#000', '#03c', '#08c'] } }, yaxis: { min: 0, autoscaleMargin: 0.25, autoscaleBottom: false } } },
  /* I_SKETCH_NAME   - 11 */
  LABEL: { name: 'LABEL', regexp: /(?:_11|I_SKETCH_NAME)\:([\w\-]*)[^\s]*/i, value: '' },
  HEARTBEAT: { name: 'HEARTBEAT', regexp: /(?:_22|I_HEARTBEAT_RESPONSE)\:([-\d]+)$/i, value: '' },
  RSSI: { name: 'RSSI', regexp: /\[?(?:37|SS)\:(-?\d+)[^\s]*\]?/i, value: '', duplicateInterval: 3600, unit: 'db', graph: 1, graphOptions: { legendLbl: 'Signal strength', lines: { lineWidth: 1 }, grid: { backgroundColor: { colors: ['#000', '#03c', '#08c'] } }, yaxis: { min: -99, max: -20 }, colors: ['#0f0'] } },

}

exports.statistics = {
  DAILY_USAGE: {
    name: 'DAILY_USAGE', graph: 1, graphOptions: {
      series: {
        bars: {
          show: true
        }
      },
      bars: {
        align: "center",
        barWidth: 0.5
      },
      yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0']
    }
  },
  DAILY_AVERAGE: { name: 'DAILY_AVERAGE', graph: 1, graphOptions: { yaxis: { ticks: 0, min: 0, autoscaleMargin: 0.5 }, colors: ['#4a0'] } },
}

exports.sensors = {

}
exports.motes = {
  STATUS: {
    label: 'Light Switch',
    icon: 'icon_switchmote.png',
    controls: {
      B: {
        states: [{ label: 'Off', action: 'BTN1:1', css: 'background-color:#FF9B9B;', icon: 'power', condition: '' + function (node) { return node.metrics['B1'] ? node.metrics['B1'].value == 'OFF' : false; } },
        { label: 'On', action: 'BTN1:0', css: 'background-color:#9BFFBE;color:#000000', icon: 'power', condition: '' + function (node) { return node.metrics['B1'] ? node.metrics['B1'].value == 'ON' : false; } }]
      },
    },
  },
}

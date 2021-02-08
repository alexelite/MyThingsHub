//GAS Meter
exports.metrics = {
  MCH : { name:'MCH', regexp:/MCH\:([\d\.]+)/i, value:'', unit:'MC/h', graph:1, mqtt:1,  graphOptions : { legendLbl:'MC/h', lines: { lineWidth:1 ,steps:true }, colors:['#09c'],  /*yaxis: { ticks: [1,5,20], transform:  function(v) {return v==0?v:Math.log(v); //log scale },*/ tickDecimals: 2} },
  MC : { name:'MC', regexp:/MC\:([\d\.]+)/i, value:'', unit:'mc', pin:1, mqtt:1, },
}

exports.events = {
}

exports.motes = {
}

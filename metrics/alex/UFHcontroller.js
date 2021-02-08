//UFH controller
exports.metrics = {
  //UFH Controller
  UFH1_OFF : { name:'Z1', regexp:/Z1\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH1_ON  : { name:'Z1', regexp:/Z1\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH2_OFF : { name:'Z2', regexp:/Z2\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH2_ON  : { name:'Z2', regexp:/Z2\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH3_OFF : { name:'Z3', regexp:/Z3\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH3_ON  : { name:'Z3', regexp:/Z3\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH4_OFF : { name:'Z4', regexp:/Z4\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH4_ON  : { name:'Z4', regexp:/Z4\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH5_OFF : { name:'Z5', regexp:/Z5\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH5_ON  : { name:'Z5', regexp:/Z5\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH6_OFF : { name:'Z6', regexp:/Z6\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH6_ON  : { name:'Z6', regexp:/Z6\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH7_OFF : { name:'Z7', regexp:/Z7\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH7_ON  : { name:'Z7', regexp:/Z7\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
  UFH8_OFF : { name:'Z8', regexp:/Z8\:0/i, value:'OFF', pin:1, graph:1, logValue:0, graphOptions:{ yaxis: {ticks:0, min:0, autoscaleMargin:0.5 }, colors:['#4a0']}},
  UFH8_ON  : { name:'Z8', regexp:/Z8\:1/i, value:'ON', pin:1, graph:1, logValue:1, graphOptions: { /* already defined above for 'B1', no need to repeat */ }},
}

exports.events = {
}

exports.motes = {
  UFHMote: {
    label  : 'UFH Controller',
    icon : 'icon_switchmote.png',
    controls : {Z1 : { states: [{ label:'Z1 (off)', action:'Z1:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z1'] ? node.metrics['Z1'].value == 'OFF' : false; }},  //http://api.jquerymobile.com/icons/
                                { label:'Z1 (on)',  action:'Z1:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z1'] ? node.metrics['Z1'].value == 'ON' : false; }}]},
                Z2 : { states: [{ label:'Z2 (off)', action:'Z2:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z2'] ? node.metrics['Z2'].value == 'OFF' : false; }},
                                { label:'Z2 (on)',  action:'Z2:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z2'] ? node.metrics['Z2'].value == 'ON' : false; }}]},
                Z3 : { states: [{ label:'Z3 (off)', action:'Z3:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z3'] ? node.metrics['Z3'].value == 'OFF' : false; }},
                                { label:'Z3 (on)',  action:'Z3:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z3'] ? node.metrics['Z3'].value == 'ON' : false; }}]},
                Z4 : { states: [{ label:'Z4 (off)', action:'Z4:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z4'] ? node.metrics['Z4'].value == 'OFF' : false; }},
                                { label:'Z4 (on)',  action:'Z4:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z4'] ? node.metrics['Z4'].value == 'ON' : false; }}]},
				Z5 : { states: [{ label:'Z5 (off)', action:'Z5:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z5'] ? node.metrics['Z5'].value == 'OFF' : false; }},
                                { label:'Z5 (on)',  action:'Z5:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z5'] ? node.metrics['Z5'].value == 'ON' : false; }}]},
				Z6 : { states: [{ label:'Z6 (off)', action:'Z6:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z6'] ? node.metrics['Z6'].value == 'OFF' : false; }},
                                { label:'Z6 (on)',  action:'Z6:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z6'] ? node.metrics['Z6'].value == 'ON' : false; }}]},
				Z7 : { states: [{ label:'Z7 (off)', action:'Z7:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z7'] ? node.metrics['Z7'].value == 'OFF' : false; }},
                                { label:'Z7 (on)',  action:'Z7:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z7'] ? node.metrics['Z7'].value == 'ON' : false; }}]},
				Z8 : { states: [{ label:'Z8 (off)', action:'Z8:1', css:'background-color:#FF9B9B;', icon:'power', condition:''+function(node) { return node.metrics['Z8'] ? node.metrics['Z8'].value == 'OFF' : false; }},
                                { label:'Z8 (on)',  action:'Z8:0', css:'background-color:#9BFFBE;color:#000000', icon:'power', condition:''+function(node) { return node.metrics['Z8'] ? node.metrics['Z8'].value == 'ON' : false; }}]},
					   
               },
  },
}

// TODO
// 1. remove old data (only not used anymore)
// 1.1. change function that first draw to have it handle everything
// 1.2. use an active function and a css :not() selector along with remove()

// 2. switch i to catch 1st, 2nd, 3rd time and change opacity

var radians = 0.0174532925, 
	clockRadius = 150,
	margin = 50,
	width = (clockRadius+margin)*2,
    height = (clockRadius+margin)*2,
    hourHandLength = 2*clockRadius/3,
    minuteHandLength = clockRadius-4,
    secondHandLength = clockRadius-12,
    secondHandBalance = 30,
    secondTickStart = clockRadius;
    secondTickLength = -10,
    hourTickStart = clockRadius,
    hourTickLength = -18
    secondLabelRadius = clockRadius + 16;
    secondLabelYOffset = 5
    hourLabelRadius = clockRadius - 35
    hourLabelYOffset = 7;

var face;

var minuteScale = d3.scale.linear()
	.range([0,354])
	.domain([0,59+999/1000]);

var handArrivalData, colorLine, opacity, line, stop;

var display = [];
// var oldDisplay = [];
var toRm = [];

var linesData = [];
var color = ["#C0392B", "#3498DB", "#2ECC71", "#8E44AD","#E74C3C", "#F11FAA", "#F1C40F"];
var url = 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictionsForMultiStops&a=sf-muni';
var stops = '';


// <prediction epochTime=​"1402841624321" seconds=​"365" minutes=​"6" isDeparture=​"false" dirTag=​"N__OB3" vehicle=​"1417" block=​"9701" tripTag=​"6212099">​</prediction>​
// <predictions agencyTitle=​"San Francisco Muni" routeTitle=​"N-Judah" routeTag=​"N" stopTitle=​"Judah St & 34th Ave" stopTag=​"5209">​
///////////////////////////// Data fetching /////////////////////////////

function getFirstArrivals (stops) {
	var arrivalSecs, vehicleId;
	var i=0;
	// console.log("OK get");
	d3.xml(url + stops, function(xml) {
    	var predictions = d3.select(xml).selectAll('predictions').each(function() {
 		// console.log(this.getAttribute('routeTitle'));
 		// console.log(this);
    	colorLine = color[i];
    	var j = 1;
    		d3.select(this).selectAll('prediction').each(function() {
    			// console.log(this);
    			arrivalSecs = this.getAttribute("seconds");
		      	if (arrivalSecs > 1801) { return}
    			if (j< 0.3) return;
    			opacity = j;
		      	vehicleId = this.getAttribute('vehicle');
		      	// console.log('train #' + i + ' arrives in ' + this.getAttribute("seconds"));
		      	var currentT = new Date();
				handArrivalValue = currentT.getMinutes() + arrivalSecs/60;
				arrivalTime = currentT.getMinutes() + arrivalSecs/60;
				display.push({'arrivalTime': arrivalTime, 'vehicleId': vehicleId, 'colorLine': colorLine, 'opacity': opacity})
				drawNextArrivals(handArrivalValue, vehicleId, colorLine, opacity);	
				j = j - 0.35;
    		});
    		i++;
    	});
  });
}

function getNextArrivals (stops) {
	var arrivalSecs, vehicleId;
	var i=0;
	// console.log("OK get");
	d3.xml(url + stops, function(xml) {
    	var predictions = d3.select(xml).selectAll('predictions').each(function() {
 		// console.log(this.getAttribute('routeTitle'));
 		// console.log(this);
    	colorLine = color[i];
    	var j = 1;
    		d3.select(this).selectAll('prediction').each(function() {
    			// console.log(this);
    			arrivalSecs = this.getAttribute("seconds");
    			// console.log(this.getAttribute("minutes"));
		      	if (arrivalSecs > 1801) { return}
    			if (j< 0.3) return;
    			opacity = j;
		      	vehicleId = this.getAttribute('vehicle');
		      	// console.log('train #' + i + ' arrives in ' + this.getAttribute("seconds"));
		      	var currentT = new Date();
				handArrivalValue = currentT.getMinutes() + arrivalSecs/60;
				arrivalTime = currentT.getMinutes() + currentT.getSeconds()/60 + arrivalSecs/60;
				display.push({'arrivalTime': arrivalTime, 'vehicleId': vehicleId, 'colorLine': colorLine, 'opacity': opacity})
				// drawNextArrivals(handArrivalValue, vehicleId, colorLine, opacity);	
				j = j - 0.35;
    		});
    		i++;
    	});
  });
}


function createDraws () {
	getFirstArrivals(stops);
	display = [];
}

function updateLines () {
	getNextArrivals(stops);
	for (var i = 0; i < display.length; i++) {
		drawNextArrivals(display[i]["arrivalTime"], display[i]["vehicleId"], display[i]['colorLine'], display[i]['opacity']);
	};
	display = [];
}

function removeDraw (vId) {
	// face.select("g#v5639 line")
	// fade
	// exit data
	face.selectAll('.clock-hands-arrivals').data([]).exit().remove();

}

function updateDraw (vId, arrivalTime) {
	// rotate
}

// lines displayed below

function displayLines () {
	 for (var i = 0; i < linesData.length; i++) {
 		var linesDisplayed = d3.selectAll("#lines").append("p").attr('class', 'linesNames').style('color', color[i]).text('- Line ' +linesData[i]['lineNumber'] + ' (at ' + linesData[i]['stopName'] +')');
		// stops += "&stops="+linesData[i]["lineNumber"] + '|' + linesData[i]["stopNumber"];
	};
}

///////////////////////////// Data drawing /////////////////////////////


function drawNextArrivals (arrivalTime, vehicleId, color, opacity) {
	var handArrival = face.append('g').attr('id','v'+vehicleId).attr('class','clock-hands-arrivals');

	var handArrivalData = [
		{
		type:"stop",
		value:arrivalTime,
		length:-minuteHandLength,
		scale:minuteScale,
		balance:-clockRadius/20-2
		}
	];


	handArrival.selectAll('line')
		.data(handArrivalData)
			.enter()
			.append('line')
			.style('stroke', color)
			.style('stroke-opacity', opacity)
			.attr('class', function(d){
				return d.type + '-hand';
			})
			.attr('x1',0)
			.attr('y1',function(d){
				return d.balance ? d.balance : 0;
			})
			.attr('x2',0)
			.attr('y2',function(d){
				return d.length;
			})
			.attr('transform',function(d){
				return 'rotate('+ d.scale(d.value) +')';
			});

	// d3.select('#lines').append('p').text('Line number: ' + stop.substring(0,1) );
}

function getStorage() {
	chrome.storage.sync.get(function(obj) {
          // console.log(obj.nextArrival);
          if (obj.nextArrival)
          {
            for(var i=0; i < obj.nextArrival.length; i++)
            {
              linesData.push(obj.nextArrival[i]);  
            }
            return launchDisplay();
          }
        });
}

function launchDisplay() {
	console.log("ok in");
	for (var i = 0; i < linesData.length; i++) {
		stops += "&stops="+linesData[i]["lineNumber"] + '|' + linesData[i]["stopNumber"];
		// getNextArrivals(linesData[i]["lineNumber"] + '|' + linesData[i]["stopNumber"], color[i]);
	};
	console.log("OK launch");
	setTimeout(function() {createDraws();}, 500);
	setTimeout(function() {displayLines();}, 500);

}
	
getStorage();	

setInterval(function(){
	removeDraw();
	updateLines();
	// getNextArrivals('N%20OWL|5696', 'blue');
	// getNextArrivals('N|6997', 'blue');
	// getNextArrivals('L|6997', 'red');	

	// updateNextArrivals('N%20OWL|5696');
	// updateNextArrivals('N|6997');
	// updateNextArrivals('L|6997');


	// moveHandsArrival();
}, 5000)

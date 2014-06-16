var jsonObj = [];
var userInfo = [];
var color = ["#C0392B", "#3498DB", "#2ECC71", "#8E44AD","#E74C3C", "#F11FAA", "#F1C40F"];


  function ReInit ()   {
    d3.select('#stops').selectAll('option').data([]).exit().remove();
    d3.select('#stops').append('option').text('Stops');
    d3.select('#stops').style('visibility', "hidden");
    d3.select('#submit').style('visibility', 'hidden');
    getLines();

  }

  function getLines() {
    d3.select('#lines').selectAll('option').data([]).exit().remove();
    d3.select('#lines').append('option').text('Lines');

    d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni', function(xml) {
      d3.select(xml).selectAll('route').each(function(){
        // console.log(this);
        var tag = this.getAttribute('tag');
        var title = this.getAttribute('title');
        d3.select('#lines').append('option').attr('value', tag).text(title);
      })
      
    })

  }

  function getRoutes() {
    d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r='+lineValue, function(xml) {
            d3.select('#stops').selectAll('option').data([]).exit().remove();
            d3.select('#stops').append('option').text('Stops');
            d3.select('#stops').style('visibility', "visible")
          d3.select(xml).selectAll('stop').each(function(){
            var title = this.getAttribute('title');
            if (title){
              var tag = this.getAttribute('tag');
            d3.select('#stops').append('option').attr('value', tag).text(title);
            }
            
          })
      
        })
  }

  function initStorage() {
      // jsonObj.push({'lineName': lineTxt, 'lineNumber':lineValue, 'stopName': stopTxt, 'stopNumber': stopValue});
        chrome.storage.sync.get(function(obj) {
          console.log("init");
          console.log(obj);
          console.log(obj.nextArrival);
          if (obj.nextArrival)
          {
            for(var i=0; i < obj.nextArrival.length; i++)
            {
              jsonObj.push(obj.nextArrival[i]);  
              console.log(obj.nextArrival[i]);
            }
            return displayTable();
          }
        });

  }

  function saveToStorage(arrival)
  {
    console.log("OK");
    console.log(arrival);
    if (!arrival) {
          message('Error: No value specified');
          return;
    }

    chrome.storage.sync.set({'nextArrival': arrival}, 
      function() {
          console.log('Settings saved');
          displayTable();
        });
    console.log("OK2");
  } 

  function displayTable () {
    $('#userInfo tbody').html('');
    for (var i = 0; i < jsonObj.length; i++) {
      $('#userInfo tbody').append('<tr style="color:'+color[i]+'"><td>'+ jsonObj[i]['lineNumber'] + '</td><td>' + jsonObj[i]['stopName'] + '</td><td><a class="toRm" id="toRm_'+ i +'" href="#">Remove</a></td></tr>');
    };
  }

  function removeRow (index) {
    if (index > -1) {
      jsonObj.splice(index, 1);
      saveToStorage(jsonObj);
    }
  }


var selLine, selStop, jsonObj;

    initStorage();
    getLines();

    d3.select('#lines')
      .on('change', function(){

        var sel = document.getElementById('lines');
        lineValue = sel.options[sel.selectedIndex].value;
        lineTxt = sel.options[sel.selectedIndex].text;
        d3.select('#submit').style('visibility', 'hidden');

        getRoutes();

    })

      d3.select('#stops')
      .on('change', function(){
        var sel = document.getElementById('stops');
        stopValue = sel.options[sel.selectedIndex].value;
        stopTxt = sel.options[sel.selectedIndex].text;

      // jsonObj.push(lineTxt);
      // jsonObj.push(lineValue);
      // jsonObj.push(stopTxt);
      // jsonObj.push(stopValue);

      jsonObj.push({'lineName': lineTxt, 'lineNumber':lineValue, 'stopName': stopTxt, 'stopNumber': stopValue});

      // jsonObj['lineName'] = lineTxt;
      // jsonObj['lineNumber'] = lineValue;
      // jsonObj['stopName'] = stopTxt;
      // jsonObj['stopNumber'] = stopValue;

      d3.select('#submit').style('visibility', 'visible');
      console.log(jsonObj);

  })

      d3.select('#submit').on('click', function(){
        saveToStorage(jsonObj);
        // console.log(jsonObj["lineNumber"],jsonObj["lineName"],jsonObj["stopNumber"],jsonObj["stopName"]);
        // saveToStorage("1", "2", "3", "4");
        setTimeout(ReInit(), 1500);
      })

        $(document).on('click', 'a.toRm' ,function (e) {
          e.preventDefault();
          var $toRmId = $(this).attr("id");
          var $ToRmArray = $toRmId.split('_');
          var $ToRmIndex = $ToRmArray[1].toString();
          removeRow($ToRmIndex);
        });
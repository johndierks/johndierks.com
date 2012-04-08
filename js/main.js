$(document).ready(function(){
  var work = [{'name':'chart-section','developer':40,'ux':28,'strategy':22,'other':10},
		              {'name':'about-section','developer':40,'ux':28,'strategy':22,'other':10},
		              {'name':'flash-rebrand','developer':0,'ux':10,'strategy':90,'other':0},
		              {'name':'tmg','developer':60,'ux':15,'strategy':25,'other':0},
                  {'name':'bus-box','developer':50,'ux':30,'strategy':0,'other':20},
                  {'name':'infographic','developer':10,'ux':0,'strategy':0,'other':90}];
	var currentSidebarInfoId = '';
	var previousArray = [0,0,0,0];
  var duration = 2.5; //time in seconds
  var timeCounter = 1;
  var fps = 30;
  var numberOfSteps = fps * duration;
  var msPerStep = Math.round ( (1 / fps) * 1000 );
  var percentageArray = previousArray;
  var lastScrollUpdate = 0;
  var sidebarInterval = 0;
  var $articleTitles = $('.wrapper h3');  
  var wh;
  var ww;
  var chart;
  var chartInterval;
  var isChartIntervalRunning = false;
  var updateTime = 3500;
  var $window = $(window);
  var workItemOffsetArray = [];
  
  var init = function(){
    $('#typekit-badge-vmn5pgu').remove();

    $('#nav-about').click(function(e){
      $window.scrollTo( '#about-section', 800 );
    });

    $('#nav-work').click(function(e){
      $window.scrollTo( '.work-item:first', 800 );
    });

    

    //updateWorkArray(0); //initializes and the animation on index 0;
    sizeSections();
    checkScrollPosition();
    findHeaderLocations();
    updateWorkArray('chart-section')
    
    $window.scroll(function(){
      scrollThrolling();
    });

    $window.resize(function(){
      sizeSections();
      checkScrollPosition();
      findHeaderLocations();
    });
    
    
  }

	/*---------------------
		Animating numbers
	---------------------*/    			
	var easeIn = function(t, b, c, d){
		var ts = (t/=d)*t;
		var tc = ts*t;
		return b+c*(tc + -3*ts + 3*t);
	}
	
  /*---------------------
    Resizing Content sections to fit page height
  ---------------------*/   
  var sizeSections = function (){
    wh = $window.height();
    ww = $window.width();
    $( "section" ).css('min-height', wh-80);
    $( "#chart-section" ).css('min-height', wh);
    console.log('resizing to ',wh);
    if(chart) {
      chart.redraw();
      console.log("redrawing chart")
    }
  }

  var findHeaderLocations = function(){
    
    $('.sidebar-data').each(function(){
      workItemOffsetArray.push(
      {
        'id' : $(this).attr('id'),
        'topOffset' : $(this).offset().top
      })
    });
    
  }

	var updateWorkArray = function(idString){
	  
    var item;
    var itemIndex = -1;
    var itemWasFound = false;

    for (item in work){
      if(work[item].name == idString){
        itemWasFound = true;
        itemIndex = item;
      }
    }

    if(itemWasFound && itemIndex != -1 && idString != currentSidebarInfoId){

      currentSidebarInfoId = idString;

  	  window.clearInterval(sidebarInterval);
  	  console.log('updateWorkArray');
  	  previousArray = percentageArray;
  	 
  	  console.log('current section: ',idString);

      percentageArray = [work[itemIndex].strategy, work[itemIndex].ux, work[itemIndex].developer, work[itemIndex].other];
      	  
  	  timeCounter = 0;
  	  sidebarInterval = setInterval(function(){ updatePercentages(); },msPerStep);

    }else if (idString == currentSidebarInfoId){
      //do nothing
    }else{
      console.log('item',idString,'was not found');
    }
	}
	
	var updatePercentages = function(){
		var percentage = [];
		  		
		for(var i=0; i<percentageArray.length; i++){
		
			percentage[i] = Math.round(easeIn(timeCounter,previousArray[i],percentageArray[i]-previousArray[i],numberOfSteps)).toString();
			
			if(percentage < 10){
				percentage[i] = '0' + percentage[i];
			}
			
			percentage[i] = percentage[i] + '%';
		}
				
		$( "#strategy-percentage" ).html( percentage[0]);
		$( "#ux-percentage" ).html( percentage[1]);
		$( "#developer-percentage" ).html( percentage[2]);
		$( "#other-percentage" ).html( percentage[3]);
				
		timeCounter = timeCounter + 1;
		
		if(timeCounter > numberOfSteps){
		  console.log('Sidebar updater: clearing sidebarInterval');
			window.clearInterval(sidebarInterval);
		}
	}
	
  var scrollThrolling = function (){
    var pos = $window.scrollTop();

    if(Math.abs(lastScrollUpdate - pos) > (.3 * wh)){
      lastScrollUpdate = pos;
      checkScrollPosition();
      console.log("checking scroll");
    }

  }

  var checkScrollPosition = function () { 
    
    var pos = $window.scrollTop();

    //check to see if the chart is in view. if not, turn off
    if (pos < wh && !isChartIntervalRunning){
      chartInterval = window.setInterval(function(){addPoint();}, updateTime);
      addPoint();
      isChartIntervalRunning = true;
    }else if (pos > wh && isChartIntervalRunning){
      clearInterval(chartInterval);
      isChartIntervalRunning = false;
    }

    var s;
    for(s in workItemOffsetArray){
      if(workItemOffsetArray[s].topOffset > pos - (0.4 * wh) && workItemOffsetArray[s].topOffset < pos + (0.5 * wh)){
        updateWorkArray(workItemOffsetArray[s].id);
      } 
    }


  };  
  
  var addPoint = function() {
    $('#highcharts-0').css({'overflow':'visible'})
    console.log('adding point');
  
    var point1 = Math.floor(Math.random()*100);
    var point2 = Math.floor(Math.random()*10);
    var point3 = Math.floor(Math.random()*60);
    var point4 = Math.floor(Math.random()*10);

    if (point4 > 5){
      point4 = 5;
    }else{
      point4 = 0;
    }



    var series = chart.series
    
    // add the points
    
    chart.series[0].addPoint(point1, false, true, false);
    chart.series[1].addPoint(point2, false, true, false);
    chart.series[2].addPoint(point3, false, true, false);
    chart.series[3].addPoint(point4, false, true, false);
    chart.redraw()
  }        
    
  
    
  Highcharts.setOptions({
    colors: ['#2098d0','#f39f1a','#d12b75','#51b247', '#f15a24'] //
  });
    
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart',
            type: 'areaspline',
            animation: false,
            spacingTop: 0,
            spacingRight: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            plotBorderWidth: 0,
            margin: [0,0,0,0],
            marginBottom: 0,
            shadow: false,
            backgroundColor: '#51b247',
            animation: {
                        duration: 2000,   // As close to interval as possible.
                        easing: 'swing'  // Important: this makes it smooth
                    }
        },  
        credits: {
            enabled:false            
        },
        title: {
            text: ''
        },
        subtitle: {   
            text: ''
        },
        legend:{
            enabled:false
        },
        xAxis: {
            enabled: false,
            type : 'datetime',
            tickmarkPlacement: 'false',
            minPadding : 0,
            maxPadding : 0,
            lineColor : '#51b247',
            tickColor : '#51b247',
            title: {
                enabled: false
            }
        },
        yAxis: {
            gridLineWidth: 10,
            gridLineColor: '#51b247',
            categories: [],
            max: 100,
            min: 0,
            minPadding: 0,
            maxPadding: 0,
            title: {
                text: 'Percent',
            }
        },
        tooltip: {
            enabled: false,
            formatter: function() {
                    return '' + this.series.name + '<br/>';
            }
        },
        plotOptions: {
            areaspline: {
                stacking: 'percent',
                fillOpacity: 1,
                lineColor: '#ffffff',
                lineWidth: 0,
                animation: false,
                shadow: false,
                series: {
                            enableMouseTracking: false
                        },
                marker: {
                    enabled:false,
                    radius:10,
                    lineWidth: 4,
                    
                    lineColor: '#ffffff'
                }
            }
        },
        series: [{
            name: 'Strategy',
            data: [502, 635, 0, 947, 0, 3634]
        }, {
            name: 'User Experience',
            data: [106, 107, 111, 133, 221, 767]
        }, {
            name: 'Development',
            data: [163, 203, 276, 408, 547, 729]
        }, {
            name: 'Other',
            data: [0, 0, 200, 0, 339, 0]
        }]
    });
  

init(); //start
  
}); // document ready function



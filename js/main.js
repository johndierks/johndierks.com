$(document).ready(function(){
  var work = [{'name':'chart-section','developer':40,'ux':28,'strategy':22,'other':10},
                  {'name':'about-section','developer':40,'ux':28,'strategy':22,'other':10},
		              {'name':'flash-rebrand','developer':0,'ux':10,'strategy':90,'other':0},
		              {'name':'tmg','developer':50,'ux':25,'strategy':15,'other':10},
                  {'name':'bus-box','developer':50,'ux':30,'strategy':0,'other':20},
                  {'name':'shrek','developer':60,'ux':30,'strategy':0,'other':10},
                  {'name':'infographic','developer':10,'ux':0,'strategy':0,'other':90}];
	
	var $window = $(window);
  
  var currentSidebarInfoId = '';
  var mouseMovingTimeout, chart, chartUpdateInterval, wh, ww;

  var isChartIntervalRunning = false;
  var updateTime = 3500;
  
  var workItemOffsetArray = [];
  var lastScrollUpdate = sidebarUpdateInterval = 0;
  var $articleTitles = $('.wrapper h3'); 
  var percentageArray = previousArray = [0,0,0,0];

  //Control chart updating with these vars
  var duration = 2.5; //time in seconds
  var timeCounter = 1;
  var fps = 30;
  var numberOfSteps = fps * duration;
  var msPerStep = Math.round ( (1 / fps) * 1000 );

  var init = function(){
    $('.typekit-badge').remove();

    // setup 
    $('#nav-about').click(function(e){
      $window.scrollTo( '#about-section', 800 );
    });

    $('#nav-work').click(function(e){
      $window.scrollTo( '.work-item:first', 800 );
    });

    sizeSections();
    findHeaderLocations(); 
    updateSidebarPercentages('about-section'); //initialize sidebar percentages with about me data.
    checkScrollPosition(); //override previous line if in a different section
    
    $window.scroll( scrollThrolling );

    $window.resize(function(){
      sizeSections();
      checkScrollPosition();
      findHeaderLocations();
    });
    $downarrow = $('#down-arrow');
    $(window).bind('mousemove', mouseMoved);
  }

  var mouseMoved = function(){
    $(window).unbind('mousemove');

    var pos = $window.scrollTop();
      
    if(pos< 1.3 * wh){
      $downarrow.fadeIn(400,function(){ //fade in over 400ms
        $downarrow.animate({"bottom":"10px"},200,function(){ 
          $downarrow.animate({"bottom":"25px"},200,function(){ 
            $downarrow.animate({"bottom":"10px"},200);
            mouseMovingTimeout = setTimeout(resetArrowAnimation, 500);
          });
        });
      });
    }    
  }

  var resetArrowAnimation = function(){
    $downarrow.fadeOut(700,function(){
      $downarrow.css({"bottom":"40px"})
      $(window).bind('mousemove',mouseMoved); //restart mousemove event listener
    });
    
  }

	/*---------------------
		Easing function for Animating numbers the sidebar numbers
	---------------------*/    			
	var easeIn = function(t, b, c, d){
		var ts = (t/=d)*t;
		var tc = ts*t;
		return b+c*(tc + -3*ts + 3*t);
	}
	
  /*---------------------
    Resizing Content sections to fit page height. Fired when browser is resized.
  ---------------------*/   
  var sizeSections = function (){
    wh = $window.height();
    ww = $window.width();
    
    $( "section" ).css('min-height', wh-80);
    $( "#chart-section" ).css('min-height', wh);

    if(chart) {
      chart.redraw();
    }
  }

  /*---------------------
    Find and store the vertical location of each item that had sidebar data. 
    Used for knowing when to updated sidebar percentages based on scroll height
  ---------------------*/  
  var findHeaderLocations = function(){
    
    $('.sidebar-data').each(function(){
      workItemOffsetArray.push(
      {
        'id' : $(this).attr('id'),
        'topOffset' : $(this).offset().top
      })
    });
    
  }

  /*---------------------
    Pass this function an idstring for the section that 
    
  ---------------------*/  
	var updateSidebarPercentages = function(idString){
	  
    var item;
    var itemIndex = -1;
    var itemWasFound = false;

    for (item in work){
      if(work[item].name == idString){
        itemWasFound = true;
        itemIndex = item;
        break;
      }
    }

    if(itemWasFound && idString != currentSidebarInfoId){

      console.log('updateSidebarPercentages new current section is:',idString);

      currentSidebarInfoId = idString;
  	  window.clearInterval(sidebarUpdateInterval);
  	  previousArray = percentageArray;
  	 
      percentageArray = [work[itemIndex].strategy, work[itemIndex].ux, work[itemIndex].developer, work[itemIndex].other];

  	  timeCounter = 0;
  	  sidebarUpdateInterval = setInterval(function(){ incrementSidebarPercentages(); },msPerStep);

    }else if (idString == currentSidebarInfoId){
      //do nothing, already displaying current data
    }else{
      console.log('item',idString,'was not found');
    }
	}
	
	var incrementSidebarPercentages = function(){
		var percentage = [];
		  		
		for(var i=0; i<percentageArray.length; i++){
		
			percentage[i] = Math.round(easeIn(timeCounter,previousArray[i],percentageArray[i]-previousArray[i],numberOfSteps)).toString();
			
      if(percentage[i] < 10) percentage[i] = '0' + percentage[i].toString();

			percentage[i] = percentage[i].toString() + '%';
		}
		
    $( "#strategy-percentage" ).html(percentage[0]);
    $( "#ux-percentage" ).html( percentage[1]);
    $( "#developer-percentage" ).html( percentage[2]);		
		$( "#other-percentage" ).html( percentage[3]);
				
		timeCounter = timeCounter + 1;
		
		if(timeCounter > numberOfSteps){
			window.clearInterval(sidebarUpdateInterval); //Sidebar updater: clearing sidebarUpdateInterval
		}
	}
	
  var scrollThrolling = function (){
    var pos = $window.scrollTop();

    if(Math.abs(lastScrollUpdate - pos) > (.3 * wh)){
      lastScrollUpdate = pos;
      checkScrollPosition();
    }
  }

  var checkScrollPosition = function () { 
    
    var pos = $window.scrollTop();

    //check to see if the chart is in view. if not, turn off
    if (pos < wh && !isChartIntervalRunning){
      chartUpdateInterval = window.setInterval(function(){addPointToChart();}, updateTime);
      addPointToChart();
      isChartIntervalRunning = true;
    }else if (pos > wh && isChartIntervalRunning){
      clearInterval(chartUpdateInterval);
      isChartIntervalRunning = false;
    }


    // Check each item in the workItemOffset array.
    // If that item's topOffeset is between 40% above the window height above the top of the window and
    // 50% down of the window height, change the sidebar percentages to that item's id.
    var s;
    for(s in workItemOffsetArray){
      if(workItemOffsetArray[s].topOffset > pos - (0.4 * wh) && workItemOffsetArray[s].topOffset < pos + (0.5 * wh)){
        updateSidebarPercentages(workItemOffsetArray[s].id);
      } 
    }

  };  
  
  var addPointToChart = function() {
    $('#highcharts-0').css({'overflow':'visible'})
  
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
                        easing: 'swing'   // Important: this makes it smooth
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
            data: [502, 635, 0, 237, 0, 1340]
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



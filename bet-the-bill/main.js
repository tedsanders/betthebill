var app = angular.module('bet-the-bill', []);

function DinerCtrl($scope) {

	 // d3 colors
	 //var getcolor = d3.scale.category10()
	 var getcolor = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

   // Initialize
   $scope.showResult = false;
   $scope.diners = [{
      'name': 'Diner 1',
      'amount': 1,
	  'id': 1
   }, {
      'name': 'Diner 2',
      'amount': 2,
	  'id': 2
   }];
   $scope.nextDiner = 3;
   $scope.total = 0;
   $scope.showForm = true;
   $scope.disableBackButton = true;
   $scope.disableRemoveDiner = false;
   wheelposition = 0; //Initial wheel position for animation

   $scope.addDiner = function() {
      $scope.diners.push({
         'name': 'Diner ' + $scope.nextDiner,
         'amount': 0,
		 'id': $scope.nextDiner
      });
      $scope.nextDiner++;
			$scope.updateChart()

	  if(1 < $scope.diners.length) $scope.disableRemoveDiner = false;
   }

   // compute the total amount
   $scope.total = function() {
      var t = 0;
      angular.forEach($scope.diners, function(d) {
         t += d.amount;
      });
      return Math.ceil(parseFloat(t) * 100) / 100
   }

	$scope.removeDiner = function(idx) {

		//If there are two diners left, disable the remove diner button so we can't go down to zero diners. Also, disabling the button should come before the removal to avoid race conditions, I think
		//Also, I'm fine with have users playing BetTheBill solitaire. There's no reason to do it, but no real reason to forbid it either. "That government is best which governs least."
		if(2 == $scope.diners.length) $scope.disableRemoveDiner = true;

		//Remove the diner and update the chart
     	$scope.diners.splice(idx, 1);
			//$scope.redraw()
			$scope.updateChart()
   }


   $scope.betBill = function() {

      // hide the form
      $scope.showForm = false;

      // disable back button for duration of spin - WARNING: THIS DOESN'T WORK!
      $scope.disableBackButton = true;

      // compute result
      var total = $scope.total(); // get total

      // only bother computing a loser if the total exists. Also avoids divide-by-zero error in the pie chart drawing function.
      if(0 != total) {

	      var die = Math.random() * total; // roll a die. By the way, Math.random includes 0 but excludes 1.
	      var cumTotal = 0;
	      for (var i = 0; i < $scope.diners.length; i++) {

	         // add this guy to cumulative total
	         cumTotal += Math.ceil(100 * parseFloat($scope.diners[i].amount)) / 100; //Why ceil instead of round? Hmm.

	         // check if this guy has to pay
	         // Note that the 'less than' comparison is essential for maximum fairness, given that Math.random includes 0 but not 1.
	         if (die < cumTotal) {
	            $scope.setLoser(i);
	            break;
	         }
	      }

	      //This section animates the spinning wheel. P.S. If the total is 0, there will be a divide by zero error.

	      //First, it finds the svg element and calls it wheel. This is the thing that will spin.
		  var wheel = document.querySelector('svg');

		  //Second, it clears the wheel's the current style information
	      wheel.removeAttribute('style');

	      //Third, it computes a new position for the wheel
	      wheelposition = wheelposition - wheelposition%360 + 1440 - 360*die/total; //The -wheelposition%360 is for when people use the Go Back button and spin again. This effectively resets the wheelposition to 0 so that a rotation by 360*die/total lands on the correct section.
	      var css = '-webkit-transform: rotate(' + wheelposition + 'deg);'
	            + 'transform: rotate(' + wheelposition + 'deg);';

	      //Fourth, it sets the newly computed style so that the wheel spins to the new position
	      wheel.setAttribute(
	        'style', css
	      );




      }

      //otherwise, if the total is 0:
      if(0 == total) $scope.showNullResult = true;

      $scope.disableBackButton = false;

   }

   $scope.setLoser = function(idx) {
      $scope.loser = $scope.diners[idx];
      $scope.showResult = true;
   }

   $scope.goBack = function() {
      $scope.showForm = true;
      $scope.showResult = false;
      $scope.showNullResult = false;
   }
   $scope.startOver = function() {
      window.location.reload() //I changed this to refresh the page. There is likely a better way to do things. Previously, this was a copy of the goBack function. -Ted
   }

   // helpers
   $scope.parseAmt = function(amt) {
      return Math.ceil(parseFloat(amt) * 100) / 100;
   };

		// get array of diner amounts
		var amounts = function() {
				var temp = new Array;

				for(var idx in $scope.diners) {
						temp.push($scope.diners[idx].amount);
				}
				return temp
		}


	 // Initialize d3 plot
	var width = document.getElementById('pie-chart').offsetWidth,
			r = width/2,
			dur = 1000,           // duration, in milliseconds
			donut = d3.layout.pie().sort(null),
			arc = d3.svg.arc().innerRadius(0).outerRadius(r - width/20);

		// ---------------------------------------------------------------------
		var svg = d3.select("#pie-chart").append("svg:svg")
				//.attr("width", width)
				//.attr("height", width)
				//.attr('viewBox','0 0 '+width+' '+width)			// <--- This should work, but still doesn't
    		//.attr('preserveAspectRatio','xMinYMin');		// By the way, here is StackOverflow on how to make d3 responsive: http://stackoverflow.com/questions/17626555/responsive-d3-chart
		var arc_grp = svg.append("svg:g").attr("class", "arcGrp")
		var label_group = svg.append("svg:g").attr("class", "lblGroup")


		// Store the currently-displayed angles in this._current.
		// Then, interpolate from this._current to the new angles.
		function arcTween(a) {
				var i = d3.interpolate(this._current, a);
				this._current = i(0);
				return function(t) {
						return arc(i(t));
				};
		}



		// update chart
		$scope.updateChart = function() {
			///////////////////////////////////////////////////
			width = document.getElementById('pie-chart').offsetWidth
			r = width/2
			arc = d3.svg.arc().innerRadius(0).outerRadius(r - width/20);
			svg.attr("width", width).attr("height", width)
			arc_grp.attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");
			label_group.attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");
			///////////////////////////////////////////////////


				myAmounts = amounts();
				//If total is zero, draw slices as if they were equal (to 1)
				if(0 == $scope.total()) {
					for( var i = 0; i < myAmounts.length; i++ ) {
						myAmounts[i] = 1;
					}
				}

				var arcs = arc_grp.selectAll("path")
						.data(donut(myAmounts));
				arcs.enter().append("svg:path")
						.attr("stroke", "white")
						.attr("stroke-width", 0.5)
						.attr("fill", function(d, i) {return getcolor[($scope.diners[i].id-1) % getcolor.length];})
						.attr("d", arc)
						.each(function(d) {this._current = d});

				// remove old paths
				arcs.exit().remove()

				// DRAW SLICE LABELS
				// Warning: some numbers are hardcoded in below. FYI.
				var sliceLabel = label_group.selectAll("text")
						.data(donut(myAmounts));
				sliceLabel.enter().append("svg:text")
						.attr("class", "arcLabel")
						.attr("x", r-width/4)
						.attr("y", 0)
						.attr("transform", function(d) {
										var coordinates = arc.centroid(d);
										var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
										if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
										return "rotate(" + rotationangle + ")"; })
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "middle")
						.text(function(d, i) {return $scope.diners[i].name; })
						.attr("style", function(d) {
														if(d.data > 0 ) { return "font-size: " + width/12 + "px;"}
														else { return "font-size: 0;"};});


				sliceLabel.exit().remove()

				arcs.data(donut(myAmounts)); // recompute angles, rebind data
				arcs.attr("fill", function(d, i) {return getcolor[($scope.diners[i].id-1) % getcolor.length];});
				arcs.transition().ease("elastic").duration(dur).attrTween("d", arcTween);


				//why do we have all this happening twice? I guess this second one has the elastic animation, and the first one declares the variable. --Update: I tried removing the first pass through and the Diner labels animated into position. I think we need both halves - the first half to make the labels appear and the second half to make them move. Also, fun fact: changing the first half will let us easily animate the labels as they enter.
				sliceLabel.data(donut(myAmounts));
				sliceLabel.transition().ease("elastic").duration(dur)
				.attr("x", r-width/4)
				.attr("y", 0)
				.attr("transform", function(d) {
								var coordinates = arc.centroid(d)
								var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
								if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
								return "rotate(" + rotationangle + ")"; })
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.text(function(d, i) {return $scope.diners[i].name; })
				.attr("style", function(d) {
												if(d.data > 0 ) { return "font-size: " + width/12 + "px;"}
												else { return "font-size: 0;"};});

				//pieLabel.text(data.label);
			}

		// initialize d3 plot
		$scope.updateChart()

	window.onresize = function(event) {
		$scope.updateChart();
	}

}
/*
		//Disable horizontal scroll
		var offset = window.pageXOffset;
   		$(window).scroll(function () {
        	if(offset != window.pageXOffset)
            	window.scrollTo(0, window.pageYOffset);
    	});
*/

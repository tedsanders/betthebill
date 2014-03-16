var app = angular.module('bet-the-bill', []);

function DinerCtrl($scope) {

	 // d3 colors
	 var getcolor = d3.scale.category20()

   // Initialize
   $scope.showResult = false;
   $scope.diners = [{
      'name': 'Diner 1',
      'amount': 1,
			'color': getcolor(0)
   }, {
      'name': 'Diner 2',
      'amount': 1,
			'color': getcolor(1)
   }];
   $scope.nextDiner = 3;
   $scope.total = 0
   $scope.showForm = true;

   $scope.addDiner = function() {
      $scope.diners.push({
         'name': 'Diner ' + $scope.nextDiner,
         'amount': 0,
				 'color': getcolor($scope.nextDiner)
      });
      $scope.nextDiner++;
			//$scope.redraw()
			$scope.updateChart()
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
      $scope.diners.splice(idx, 1);
			//$scope.redraw()
			$scope.updateChart()
   }

   $scope.betBill = function() {

      // hide the form
      $scope.showForm = false;

      // show the animation
      // compute result
      var total = $scope.total(); // get total
      var die = Math.random() * total; // roll a die
      var cumTotal = 0;
      for (var i = 0; i < $scope.diners.length; i++) {

         // add this guy to cumulative total
         cumTotal += Math.ceil(100 * parseFloat($scope.diners[i].amount)) / 100;

         // check if this guy has to pay
         if (die < cumTotal) {
            $scope.setLoser(i);
            break;
         }
      }
   }

   $scope.setLoser = function(idx) {
      $scope.loser = $scope.diners[idx];
      $scope.showResult = true;
   }

   $scope.goBack = function() {
      $scope.showForm = true;
      $scope.showResult = false;
   }
   $scope.startOver = function() {
      $scope.showForm = true;
      $scope.showResult = false;
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
		var w = 400,                       // width and height, natch
				h = 400,
				r = Math.min(w, h) / 2,        // arc radius
				dur = 1000,                     // duration, in milliseconds
				donut = d3.layout.pie().sort(null),
				arc = d3.svg.arc().innerRadius(0).outerRadius(r - 20);

		// ---------------------------------------------------------------------
		var svg = d3.select("#pie-chart").append("svg:svg")
				.attr("width", w).attr("height", h);

		var arc_grp = svg.append("svg:g")
				.attr("class", "arcGrp")
				.attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

		var label_group = svg.append("svg:g")
				.attr("class", "lblGroup")
				.attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

		// GROUP FOR CENTER TEXT
		//var center_group = svg.append("svg:g")
				//.attr("class", "ctrGroup")
				//.attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
				//

		// DRAW ARC PATHS
		//$scope.redraw = function() {
		//}

		// --------- "PAY NO ATTENTION TO THE MAN BEHIND THE CURTAIN" ---------

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

				myAmounts = amounts()

				var arcs = arc_grp.selectAll("path")
						.data(donut(amounts()));
				arcs.enter().append("svg:path")
						.attr("stroke", "white")
						.attr("stroke-width", 0.5)
						.attr("fill", function(d, i) {return $scope.diners[i].color})
						.attr("d", arc)
						.each(function(d) {this._current = d});

				// remove old paths
				arcs.exit().remove()

				// DRAW SLICE LABELS
				var sliceLabel = label_group.selectAll("text")
						.data(donut(amounts()));
				sliceLabel.enter().append("svg:text")
						.attr("class", "arcLabel")
						.attr("x", r-100)
						.attr("y", 0)
						.attr("transform", function(d) {
										var coordinates = arc.centroid(d);
										var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
										if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
										return "rotate(" + rotationangle + ")"; })
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "middle")
						.attr("style", function(d) {
														if(d.data == 0) { return "font-size: 0;"}
														else { return "font-size: 32px;"};})
						.text(function(d, i) {return $scope.diners[i].name; });

				sliceLabel.exit().remove()

				arcs.data(donut(myAmounts)); // recompute angles, rebind data
				arcs.transition().ease("elastic").duration(dur).attrTween("d", arcTween);

				sliceLabel.data(donut(myAmounts));
				sliceLabel.transition().ease("elastic").duration(dur)
				.attr("x", r-100)
				.attr("y", 0)
				.attr("transform", function(d) {
								var coordinates = arc.centroid(d);
								var rotationangle = Math.atan(coordinates[1]/coordinates[0])*180/3.1415926;
								if(coordinates[0] < 0) { rotationangle = rotationangle-180; }
								return "rotate(" + rotationangle + ")"; })
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.attr("style", function(d) {
												if(d.data == 0) { return "font-size: 0;"}
												else { return "font-size: 32px;"};})
				.text(function(d, i) {return $scope.diners[i].name; });
						
				//pieLabel.text(data.label);
		}

		// initialize d3 plot
		$scope.updateChart()
}

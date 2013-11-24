var app = angular.module('bet-the-bill', []);

function DinerCtrl($scope) {

   $scope.showResult = false;
   $scope.diners = [{
      'name': 'Diner 1',
      'amount': 0,
   }, {
      'name': 'Diner 2',
      'amount': 0,
   }];
	 $scope.nextDiner = 3;

	 $scope.showForm = true;
	 $scope.getTotal = function() {
			 var total = 0;
			 for (var i = 0; i < $scope.diners.length; i++) {
					 if ($scope.diners[i].amount.length > 0) {
								total += Math.ceil(100*parseFloat($scope.diners[i].amount));
					 }
			 }
			 return total/100;
	 }

   $scope.addDiner = function() {
      $scope.diners.push({
         'name': 'Diner ' + $scope.nextDiner,
         'amount': 0
      });
			$scope.nextDiner++;
   }

   $scope.removeDiner = function(idx) {
      $scope.diners.splice(idx,1);
   }

	 $scope.betBill = function() {

			 // hide the form
			 $scope.showForm = false;

			 // show the animation

			 // compute result
			 var total = $scope.getTotal(); 						// get total
			 var die = Math.random()*total; 						// roll a die
			 var cumTotal = 0;
			 for (var i = 0; i < $scope.diners.length; i++) {

					 // add this guy to cumulative total
					 cumTotal += Math.ceil(100*parseFloat($scope.diners[i].amount))/100;

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

	 $scope.goBack = function() { $scope.showForm = true; $scope.showResult = false; }
	 $scope.startOver = function() { $scope.showForm = true; $scope.showResult = false; }

	 // helper
	 $scope.parseAmt = function(amt) {
			 return Math.ceil(parseFloat(amt)*100)/100;
	 };

}

var app = angular.module('bet-the-bill', []);

function DinerCtrl($scope) {

   // Initialize
   $scope.showResult = false;
   $scope.diners = [{
      'name': 'Diner 1',
      'amount': 0,
   }, {
      'name': 'Diner 2',
      'amount': 0,
   }];
   $scope.nextDiner = 3;
   $scope.total = 0
   $scope.mydiner = {
      'name': 'Eliza Orlins'
   }
   $scope.showForm = true;

   $scope.addDiner = function() {
      $scope.diners.push({
         'name': 'Diner ' + $scope.nextDiner,
         'amount': 0
      });
      $scope.nextDiner++;
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

   // helper
   $scope.parseAmt = function(amt) {
      return Math.ceil(parseFloat(amt) * 100) / 100;
   };

}

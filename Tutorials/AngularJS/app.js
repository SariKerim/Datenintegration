var app = angular.module('gemStore', []);

app.controller('StoreController', function($scope) {
  $scope.products = [
    {
      name: 'Banana',
      price: 2.95,
      description: 'A juicy, tasty banana.',
      canPurchase: true;
    },
    {
      name: 'Apple',
      price: 1.99,
      description: "Fresh red apples from you friendly farmer Joe!",
      canPurchase: true;
    }
  ];
});

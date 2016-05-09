(function() {
  var app = angular.module('store', []);

  app.controller('StoreController', function() {
    this.products = gems;
  });

  var gems = [
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
})();

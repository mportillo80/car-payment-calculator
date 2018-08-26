var grid = (function() {

  var message = 'This is a test of grid';

  function printMessage() {
    console.log(message);
  }

  return {
    printMessage: printMessage
  }

})();

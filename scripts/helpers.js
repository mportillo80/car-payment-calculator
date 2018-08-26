window.helpers = (function() {

  return {
    formatCurrency
  };

  // adjust number to be rounded by two, include dollar sign at beginning and commas where appropriate
  function formatCurrency(val) {
    // check position of decimal (if there is less than 3 numbers, return false)

    // for (const char of val.toString()) {
    //   console.log('char', char);
    // }

    return val.toFixed(2);
  }

})();

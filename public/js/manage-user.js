$(document).ready(function() {
  $.post(window.location.pathname, function(res) {
    console.log(res);
  });
});

$(function(){
  saveResponse();
});

function saveResponse(){
  var token = getParameterByName('token');
  $.ajax({
    type: "POST",
    url: "mobileresponse",
    data: {token: token, Body: '1'},
  }).done(function( response ) {
    $('#response').html('Thanks! Your response has been saved. You are in tomorrow.');
  });
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

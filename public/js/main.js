$(function(){
  findWhosIn();
});

function findWhosIn(){
  $.ajax({
    type: "GET",
    url: "api/whosinthisweek"
  }).done(function( response ) {
    fillWeekView(response);
  });
}

function fillWeekView(week){
  for(day in week){
    for(who in week[day].whosin){
      var user = week[day].whosin[who];
      $('#weekday_'+day).append('<p>'+user+'</p>');
      console.log(user);
    };
  };
}
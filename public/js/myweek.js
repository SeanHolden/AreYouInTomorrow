$(document).ready(function(){
  initializeSwitches();
});

function initializeSwitches(){
  $("input[type=checkbox].switch").each(function() {
    $(this).before(
      '<span class="switch">' +
      '<span class="mask" /><span class="background" />' +
      '</span>'
    );
    $(this).hide();
    
    // Set inital state
    if(!$(this)[0].checked) {
      $(this).prev().find(".background").css({left: "-54px"});
    };
  });

  // Toggle switch when clicked
  $("span.switch").click(function() {
    // If on, slide switch off
    if ($(this).next()[0].checked) {
      $(this).find(".background").animate({left: "-54px"}, 200);
    // Otherwise, slide switch on
    } else {
      $(this).find(".background").animate({left: "0px"}, 200);
    }
    // Toggle state of checkbox
    $(this).next()[0].checked = !$(this).next()[0].checked;
  });
}

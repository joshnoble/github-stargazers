//var socket = io.connect('http://localhost:'+port);
var socket = io.connect('http://'+env);
var repoURL = 'GoodBoyDigital/pixi.js';
socket.on
(
  'connect', 
  function () 
  {
    console.log('connected init');
    $("#repoName").on
    (
      "change paste keyup", 
      function() 
      {
        repoURL = $(this).val(); 
      }
    );
  }
);

socket.on
(
  'addUser', 
  function (user) 
  {
    var blank = '_blank';
    $('#myTable > tbody:last').append('<tr><td>'+user.name+'</td><td><a href='+user.html_page+' target='+blank+'>'+user.html_page+'</a></td><td><a href='+user.blog+' target='+blank+'>'+user.blog+'</a></td><td>'+user.location+'</td><td>'+user.contributor+'</td></tr>');
  }
);

socket.on
(
  'onComplete',
  function()
  {
    var btn = $('#submitBtn');
    btn.button('reset');
    document.getElementById("repoName").disabled = false;
  }
);

socket.on
(
  'onStatusUpdate',
  function(status)
  {
    document.getElementById("boldLabel").innerHTML = status;
  }
);

socket.on
(
  'logInBrowser',
  function(message, pingBack)
  {
    console.log(message+' '+pingBack);
    if(pingBack != undefined) socket.emit(pingBack, "Ping Back for "+message);
  }
);

function loadingButton(id) 
{
  var opts = 
  {
    lines: 15,
    // The number of lines to draw
    length: 5,
    // The length of each line
    width: 2,
    // The line thickness
    radius: 4,
    // The radius of the inner circle
    corners: 1,
    // Corner roundness (0..1)
    rotate: 0,
    // The rotation offset
    color: '#111111',
    // #rgb or #rrggbb
    speed: 1,
    // Rounds per second
    trail: 60,
    // Afterglow percentage
    shadow: false,
    // Whether to render a shadow
    hwaccel: false,
    // Whether to use hardware acceleration
    className: 'spinner',
    // The CSS class to assign to the spinner
    zIndex: 2e9,
    // The z-index (defaults to 2000000000)
    top: 'auto',
    // Top position relative to parent in px
    left: '-10px' // Left position relative to parent in px
  }   
    
  var target = document.getElementById(id);

  var btn = $("#" + id);
  btn.button('loading');
  btn.html('');

  var spinner = new Spinner(opts).spin();
  target.appendChild(spinner.el);

  document.getElementById("repoName").disabled = true;
}

function buttonClick()
{
  var table = document.getElementById("myTable");
  //or use :  var table = document.all.tableid;
  for(var i = table.rows.length - 1; i > 0; i--)
  {
      table.deleteRow(i);
  }

  loadingButton('submitBtn');
  console.log('repoURL: '+repoURL);
  socket.emit('setRepoName', repoURL);
}
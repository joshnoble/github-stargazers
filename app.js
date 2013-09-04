
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var github = require('octonode');
var util = require('util');
var keys = require('./public/javascripts/keys');

var app;
var client;
var ghrepo;
var contribs;
var server;
var io;
var stargazers = [];
var ukStargazers = [];
var names = {};
var indx = 0;
var repo;


setup();

function setup()
{
	app = express();


	var githubKeys = new keys();
	server = http.createServer(app);
	io = require('socket.io').listen(server);

	client = github.client
	(
		{
 	 		id: githubKeys.id,
  			secret: githubKeys.secret
		}
	);

	// all environments

	var port = process.env.PORT || 3000;

	app.set('port', port);
	app.set
	(
		'url',
		{
    		'development' : 'localhost:'+port,
    		'production' : 'github_stargazers.jit.su'
		}
	);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	// development only
	if ('development' == app.get('env')) 
	{
	  app.use(express.errorHandler());
	}

	//app.get('/', routes.index);

	var url = app.get('url')[app.get('env')];
	console.log("url: "+url);

	app.get
	(
		'/', 
		function(req, res) 
		{
    		res.render
    		(
    			'index', 
    			{ env : url }
    		);
    	}
    );

	server.listen
	(
		app.get('port'), 
		function()
		{
  			console.log('Express server listening on port ' + app.get('port'));
		}
	);

	io.sockets.on
	(
		'connection', 
		function (socket) 
		{
			console.log('A socket connected!');
			socket.on
			(
				'disconnect', 
				function () 
				{
					console.log('user disconnected');
				}
			);
			socket.on('setRepoName', setRepoName);
			socket.on('pingBack', pingBack);
			//logInBrowser("Emitting is working!!!", "pingBack");
		}
	);
}

function setRepoName(repoName)
{
	io.sockets.emit('onStatusUpdate', "Searching for contributors & Stargazers on "+repoName);
	stargazers = [];
	ukStargazers = [];
	names = {};
	indx = 0;
	repo = repoName;
	ghrepo = client.repo(repo);
	getContributors();
}

function getContributors()
{
	ghrepo.contributors
	(
		addContributors
	);
}

function addContributors(err, data)
{
	logInBrowser('Error: '+err);

	if(data != null)
	{
		for(var i=0; i<data.length; i++)
		{
			data[i].isContrib = true;
		}

		stargazers = stargazers.concat(data);
	}

	getPage();
}

function getPage()
{
	indx++;

	ghrepo.stargazers
	(
		indx, 
		100,
		addStargazers
	);
}

function addStargazers(err, data) 
{
	//logInBrowser('Error: '+err);

	if(data != null && data.length == 0) 
	{
		indx = 0;
		getUser();
	}
	else if(data != null)
	{
		for(var i=0; i<data.length; i++)
		{
			data[i].isContrib = false;
		}

		stargazers = stargazers.concat(data);
		io.sockets.emit('onStatusUpdate', 'Number of stargazers: '+stargazers.length);
		getPage();
	}
}

function getUser()
{
	if(indx < stargazers.length) client.get('/users/'+stargazers[indx].login, checkUserLocation);
	else showUsers();
}

function checkUserLocation(err, status, data)
{
	if(data != undefined)
	{
		if(data.location != null)
	  	{
	  		var location = data.location.toLowerCase();
	  		var keep = location.indexOf("london");

	  		if(keep == -1) keep = location.indexOf("belfast");

	  		if(keep > -1 && !names.hasOwnProperty(data.name)) 
	  		{
	  			var user = {};

	  			user.location = data.location;
	  			user.name = data.name;
	  			user.email = data.email;
	  			user.hireable = data.hireable;
	  			user.html_page = data.html_url;
	  			user.contributor = stargazers[indx].isContrib;

	  			if(data.blog != null && data.blog.length > 0 && data.blog.indexOf("http") == -1) data.blog = "http://"+data.blog;
	  			user.blog = data.blog;

	  			names[user.name] = true;
	  			ukStargazers.push(user);
	  			io.sockets.emit('addUser', user);
	  		}
	  	}

	  	indx++;
	  	io.sockets.emit('onStatusUpdate', 'Scanned '+indx+' of '+stargazers.length+' users');
	  	getUser();
	}
	else showUsers();
}

function showUsers()
{
	io.sockets.emit('onComplete');
	//io.sockets.emit('onStatusUpdate', 'Search Complete');
}

function logInBrowser(message, pingBack)
{
	io.sockets.emit('logInBrowser', message, pingBack);
}

function pingBack(message)
{
	console.log(message);
}

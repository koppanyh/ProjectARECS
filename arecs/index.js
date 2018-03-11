const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');

var app = express();
app.use(express.static("public"));
var server;
var urlencodedParser = bodyParser.urlencoded({extended: false});

process.on("SIGINT", function(){
	//add all cleanup code here
	process.exit();
});

app.use(session({
	cookieName: "session",
	secret: "magicKeyFromFile",
	duration: 7*24*60*60*1000, //7 days
	activeDuration: 5*24*60*60*1000, //5 days
	httpOnly: true
}));

app.get('/', function(req, res){
	console.log(req.session);
	res.send(Math.random() + ' Have you been <a href="/account">logged in</a> today?<br>\n');
});

//account, post only
function loggedInRedir(req, res){
	if(req.session && req.session.user) res.redirect("/account/user.html"); //if logged in then redir to user
	else res.redirect("/account/login.html"); //else redir to login
}
app.post('/account', urlencodedParser, function(req, res){
	console.log(req.body);
	if(req.body.action == "login"){
		req.session.user = {email: req.body.email};
		res.redirect('/account/user.html');
	} else if(req.body.action == "logout"){
		req.session.reset();
	} else{
		res.redirect("/account/login.html");
	}
});
app.get('/account', function(req, res){ loggedInRedir(req, res); });
app.get('/account/logout', function(req, res){
	req.session.reset();
	res.redirect("/");
});
//make login redirect to user if logged in
//make user redirects to login if not logged in

function apiFunc(req, res){
	var body = "";
	
	body += "<b>Post</b><br>\n";
	Object.keys(req.body).forEach(function(r){
		body += r + ": " + req.body[r] + "<br>\n";
	});
	
	body += "\n<br><b>Get</b><br>\n";
	Object.keys(req.query).forEach(function(r){
		body += r + ": " + req.query[r] + "<br>\n";
	});
	
	body += '<br><a href="/">Home</a>';
	res.send(body);
}
app.post('/api', urlencodedParser, function(req, res){ apiFunc(req, res); });
app.get('/api', function(req, res){ apiFunc(Object.assign(req,{body:{}}), res); });

server = app.listen(8080, function () {
	var port = server.address().port;
	console.log("ARECS server listening on port %s", port);
})

const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const fs = require('fs');
const mysql = require('mysql');
const crypto = require('crypto');

var app = express();
app.use(express.static("public"));
var server;
var urlencodedParser = bodyParser.urlencoded({extended: false});

///////////////////////////////// mysql stuff ////////////////////////////////////
var mysqlhost = "31.220.105.80";
var mysqluser = "khlabsor_arecsUser";
var mysqldatb = "khlabsor_arecs";
var conn = null;
fs.readFile("db.key", function(err, dat){
	conn = mysql.createConnection({
		host: mysqlhost,
		database: mysqldatb,
		user: mysqluser,
		password: dat.toString()
	});
	conn.connect(function(err){
		if(err) console.error(err);
		else console.log("Connected to MySQL");
	});
});

process.on("SIGINT", function(){
	//add all cleanup code here
	console.log("");
	conn.end(function(err){
		if(err) console.error(err);
		console.log("MySQL connection closed");
		process.exit();
	});
	setTimeout(function(){ process.exit(); }, 3000);
});

app.use(session({
	cookieName: "session",
	secret: "magicKeyFromFile",
	duration: 7*24*60*60*1000, //7 days
	activeDuration: 5*24*60*60*1000, //5 days
	httpOnly: true
}));

app.get('/', function(req, res){
	if(isLoggedIn(req)) res.redirect("/clockin.html");
	else res.redirect("/account");
});

///////////////////////////////// account stuff /////////////////////////////
function isLoggedIn(req){ return req.session && req.session.user; }
app.post('/account', urlencodedParser, function(req, res){
	if(req.body.action == "login"){
		conn.query("SELECT * from userdb WHERE email=?", [req.body.email], function(err, result){
			if(result.length == 0) res.redirect("/account/login.html?err1");
			else{
				result = result[0];
				var hash = crypto.createHmac('sha512', result.salt);
				hash.update(req.body.passw);
				if(hash.digest("hex") == result.hashpw){
					delete result.salt;
					delete result.hashpw;
					delete result.uid;
					result.days = JSON.parse(result.days);
					req.session.user = result;
					res.redirect('/clockin.html');
				} else res.redirect("/account/login.html?err2");
			}
		});
	} else if(req.body.action == "getuser"){
		res.send(JSON.stringify(req.session.user));
	} else if(req.body.action == "logout"){
		req.redirect("account/logout");
	} else{
		res.redirect("/account/login.html");
	}
});
app.get('/account', function(req, res){
	if(isLoggedIn(req)) res.redirect("/account/user.html"); //if logged in then redir to user
	else res.redirect("/account/login.html"); //else redir to login
});
app.get('/account/logout', function(req, res){
	req.session.reset();
	res.redirect("/account/login.html");
});
app.get('/account/login.html', function(req, res){
	if(isLoggedIn(req)) res.redirect("/account/user.html");
	else res.sendFile(__dirname+"/account/login.html");
});
app.get('/account/user.html', function(req, res){
	if(isLoggedIn(req)) res.sendFile(__dirname+"/account/user.html");
	else res.redirect("/account/login.html");
});

///////////////////////////////////// api stuff //////////////////////////////////
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

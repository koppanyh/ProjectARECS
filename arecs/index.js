const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const fs = require('fs');
const mysql = require('mysql');
const crypto = require('crypto');
const Ractive = require('ractive');

Ractive.DEBUG = false;
var app = express();
app.use(express.static("public"));
var server;
var urlencodedParser = bodyParser.urlencoded({extended: false});

///////////////////////////////// mysql stuff ////////////////////////////////////
var pool = null;
fs.readFile("db.key", function(err, dat){
	var dbkey = JSON.parse(dat.toString());
	pool = mysql.createPool({
		host: dbkey.hostsite,
		database: dbkey.database,
		user: dbkey.username,
		password: dbkey.password
	});
	console.log("MySQL pool started");
});

process.on("SIGINT", function(){
	//add all cleanup code here
	console.log("");
	pool.end(function(err){
		if(err) console.error(err);
		console.log("MySQL pool closed");
		process.exit();
	});
	setTimeout(function(){ process.exit(); }, 3000);
});

//fs.readFile("session.key", function(err, data){
	app.use(session({
		cookieName: "session",
		secret: "magicTestKey",
		duration: 7*24*60*60*1000, //7 days
		activeDuration: 5*24*60*60*1000, //5 days
		httpOnly: true
	}));
//});

app.get('/', function(req, res){
	if(isLoggedIn(req)) res.redirect("/clockin.html");
	else res.redirect("/account");
});

///////////////////////////////// account stuff /////////////////////////////
function isLoggedIn(req){ return req.session && req.session.user; }
app.post('/account', urlencodedParser, function(req, res){
	if(req.body.action == "login"){
		pool.getConnection(function(err, conn){
			if(err) console.error(err);
			else{
				conn.query("SELECT * from userdb WHERE email=?", [req.body.email], function(err, result){
					conn.release();
					if(err) console.error(err);
					else if(result.length == 0) res.redirect("/account/login.html?err1");
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
			}
		});
	} else if(req.body.action == "getuser"){
		if(req.session) res.send(req.session.user);
		else res.send("");
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
/*app.get('/test2.html', function(req, res){
	fs.readFile('test2.html', function(err, dat){
		var ractive = new Ractive({
			template: dat.toString(),
			data: {
				asdf: "this is from the server"
			}
		});
		res.send(ractive.toHTML());
	});
});*/

function apiFunc(req, res){
	if(!isLoggedIn(req)) res.end("Must be logged in to use API");
	else{
		var dat = Object.assign(req.query, req.body);
		
		if(dat.action == "getprojs"){
			var query = "SELECT ";
			if("nodesc" in dat) query += "pid,title,active";
			else query += "*";
			query += " from projdb";
			if("active" in dat) query += " WHERE active=1";
			pool.getConnection(function(err, conn){
				if(err) console.error(err);
				else{
					conn.query(query,[],function(err, result){
						conn.release();
						if(err) console.error(err);
						else res.send(JSON.stringify(result));
					});
				}
			});
		}
		else res.end("Unknown API Action");
	}
}
app.post('/api', urlencodedParser, function(req, res){ apiFunc(req, res); });
app.get('/api', function(req, res){ apiFunc(Object.assign(req,{body:{}}), res); });

server = app.listen(8080, function () {
	var port = server.address().port;
	console.log("ARECS server listening on port %s", port);
})

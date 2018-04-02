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
var pool = null;
fs.readFile("db.key", function(err, dat){
	if(err){
		console.error(err);
		console.error("Cannot access db.key file");
		console.error("Cannot initialize MySQL pool");
	} else{
		var dbkey = JSON.parse(dat.toString());
		pool = mysql.createPool({
			host: dbkey.hostsite,
			database: dbkey.database,
			user: dbkey.username,
			password: dbkey.password
		});
		console.log("MySQL pool started");
	}
});

process.on("SIGINT", function(){
	//add all cleanup code here
	console.log();
	if(pool) pool.end(function(err){
		if(err) console.error(err);
		console.log("MySQL pool closed");
		process.exit();
	});
	else console.log("MySQL pool wasn't initialized");
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
		if(pool) pool.getConnection(function(err, conn){
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
		else{
			console.log("login: MySQL pool not initialized");
			res.redirect("/account/login.html?err3");
		}
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

function apiFunc(req, res){
	var dat = Object.assign(req.query, req.body);
	if(dat.action == "rfidevent"){
		var rf = req.body; //{node:"", time:"", id:""}
		console.log(rf);
		var tm = new Date();
		tm.setTime(rf.time * 1000);
		//if datetime is not from past week, use current time
		console.log(tm, (new Date()));
		res.end("success");
	}
	else if(dat.action == "gettime"){
		console.log("Got time at", (new Date()));
		res.end(Math.floor(Date.now() / 1000) + "");
	}
	else if(!isLoggedIn(req)) res.end("Must be logged in to use API");
	else{
		if(dat.action == "getprojs"){
			var query = "SELECT ";
			if("nodesc" in dat) query += "pid,title,active";
			else query += "*";
			query += " FROM projdb";
			if("active" in dat) query += " WHERE active=1";
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					conn.query(query,[],function(err, result){
						conn.release();
						if(err){
							console.error(err);
							res.send('{"error":"Database query error"}');
						} else res.send(JSON.stringify(result));
					});
				}
			});
			else{
				console.log("getprojs: MySQL pool not initialized");
				res.send('{"error":"Could not access database"}');
			}
		}
		else if(dat.action == "getemployees"){
			//implement queries
			if(req.session.user.admin){
				if(pool) pool.getConnection(function(err, conn){
					if(err){
						console.error(err);
						res.send('{"error":"Database connection error"}');
					} else{
						conn.query("SELECT uid,email,fname,lname,wage,days,picture FROM userdb",[],function(err, result){
							conn.release();
							if(err){
								console.error(err);
								res.send('{"error":"Database query error"}');
							} else res.send(JSON.stringify(result));
						});
					}
				});
				else{
					console.log("getemployees: MySQL pool not be initialized");
					res.send('{"error":"Could not access database"}');
				}
			} else{
				console.log("getemployees: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
				res.end("Unauthorized access to API call 'getusers'");
			}
		}
		//getrfidevents (only for admins)
		else res.end("Unknown API Action");
	}
}
app.post('/api', urlencodedParser, function(req, res){ apiFunc(req, res); });
app.get('/api', function(req, res){ apiFunc(Object.assign(req,{body:{}}), res); });

server = app.listen(8080, function () {
	var port = server.address().port;
	console.log("ARECS server listening on port %s", port);
})

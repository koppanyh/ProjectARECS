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

app.use(session({
	cookieName: "session",
	secret: "magicTestKey",
	duration: 7*24*60*60*1000, //7 days
	activeDuration: 5*24*60*60*1000, //5 days
	httpOnly: true
}));

app.get('/', function(req, res){
	if(isLoggedIn(req)) res.redirect("/clockin.html");
	else res.redirect("/account");
});

///////////////////////////////// helper funcs //////////////////////////////
function isLoggedIn(req){ return req.session && req.session.user; }
function mysqlquery(query,params,func,name,err1,err2,err3){
	if(pool) pool.getConnection(function(err, conn){
		if(err){
			console.error((name?name+": ":"")+err);
			if(err1) err1({"error":(name?name+": ":"")+"Database connection error"});
		} else{
			conn.query(query,params,function(err, result){
				conn.release();
				if(err){
					console.error((name?name+": ":"")+err);
					if(err2) err2({"error":(name?name+": ":"")+"Database query error"});
				} else func(result);
			});
		}
	});
	else{
		console.log((name?name+": ":"")+"MySQL pool not initialized");
		if(err3) err3({"error":(name?name+": ":"")+"MySQL pool not initialized"});
	}
}

///////////////////////////////// account stuff /////////////////////////////
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
		if(dat.action == "getclocks"){
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					var query = "SELECT * FROM daydb WHERE uid=? AND day=?";
					query += " AND tend IS NULL"; //make this conditional
					conn.query(query,[req.session.user.uid,"2018-04-07"],function(err, result){
						conn.release();
						if(err){
							console.error(err);
							res.send('{"error":"Database query error"}');
						} else res.send(JSON.stringify(result));
					});
				}
			});
			else{
				console.log("getclocks: MySQL pool not initialized");
				res.send('{"error":"Could not access database"}');
			}
		}
		else if(dat.action == "addclocks"){
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					var query = "INSERT INTO daydb (uid, day, tstart) VALUES (?,?,?)";
					var entry = JSON.parse(dat.entry)
					conn.query(query,[req.session.user.uid,entry.date,entry.time],function(err, result){
						conn.release();
						if(err){
							console.error(err);
							res.send('{"error":"Database query error"}');
						} else{
							pool.getConnection(function(err, conn){
								if(err){
									console.error(err);
									res.send('{"error":"Database connection error"}');
								} else{
									conn.query("SELECT * FROM daydb WHERE did=?",[result.insertId],function(err, result){
										conn.release();
										if(err){
											console.error(err);
											res.send('{"error":"Database query error"}');
										} else res.send(JSON.stringify(result));
									});
								}
							});
						}
					});
				}
			});
			else{
				console.log("addclocks: MySQL pool not initialized");
				res.send('{"error":"Could not access database"}');
			}
		}
		else if(dat.action == "editclocks"){
			var entry = JSON.parse(dat.entry);
			if(["day","tstart","tend"].indexOf(entry.tag) >= 0){
				var query = "UPDATE daydb SET "+entry.tag+"=? WHERE did=? AND uid=?";
				var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
				mysqlquery(query,[entry.value,entry.did,req.session.user.uid],function(result){
					res.send(JSON.stringify(result));
				},"editclocks",errfunc,errfunc,errfunc);
				//update hours automatically on tstart or tend
			} else res.send("Incorrect column value: " + entry.tag);
		}
		else if(dat.action == "getworks"){
			var entry = JSON.parse(dat.entry);
			var query = "SELECT * FROM workdb WHERE uid=? AND did=?";
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			mysqlquery(query,[req.session.user.uid, entry.did],function(result){
				res.send(JSON.stringify(result));
			},"getworks",errfunc,errfunc,errfunc);
		}
		else if(dat.action == "addworks"){
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					var query = "INSERT INTO workdb (uid, did, pid, description, tstart, tend) VALUES (?,?,?,?,?,?)";
					var entry = JSON.parse(dat.entry);
					conn.query(query,[req.session.user.uid, entry.did, entry.pid,
						entry.description, entry.tstart, entry.tend],function(err, result){
						conn.release();
						if(err){
							console.error(err);
							res.send('{"error":"Database query error"}');
						} else res.send(JSON.stringify(result));
					});
				}
			});
			else{
				console.log("addworks: MySQL pool not initialized");
				res.send('{"error":"Could not access database"}');
			}
		}
		else if(dat.action == "editworks"){
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					var entry = JSON.parse(dat.entry);
					if(["tstart","tend","pid","description"].indexOf(entry.tag) >= 0){
						var query = "UPDATE workdb SET "+entry.tag+"=? WHERE wid=? AND uid=?";
						conn.query(query,[entry.value,entry.wid,req.session.user.uid],function(err, result){
							conn.release();
							if(err){
								console.error(err);
								res.send('{"error":"Database query error"}');
							} else res.send(JSON.stringify(result));
						});
					} else res.send("Incorrect column value: " + entry.tag);
				}
			});
			else{
				console.log("editworks: MySQL pool not initialized");
				res.send('{"error":"Could not access database"}');
			}
		}
		else if(dat.action == "getprojs"){
			if(pool) pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					res.send('{"error":"Database connection error"}');
				} else{
					var query = "SELECT ";
					if("nodesc" in dat) query += "pid,title,active";
					else query += "*";
					query += " FROM projdb";
					if("active" in dat) query += " WHERE active=1";
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

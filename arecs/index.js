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
		var query = "SELECT * from userdb WHERE email=?";
		var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
		mysqlquery(query,[req.body.email],function(result){
			if(result.length == 0) res.redirect("/account/login.html?err1");
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
		},"login",errfunc,errfunc,function(result){
			//errfunc(result);
			res.redirect("/account/login.html?err3");
		});
	} else if(req.body.action == "getuser"){
		if(req.session){
			var dat = req.body;
			if("uid" in dat){
				if(req.session.user.admin){
					var query = "SELECT * from userdb WHERE uid=?";
					var errfunc = function(inp){ res.send(JSON.stringify(inp)); }
					mysqlquery(query,[dat.uid],function(result){
						if(result.length == 0) res.send('{"error":"Unknown user: '+dat.uid+'"}');
						else{
							result = result[0];
							delete result.salt;
							delete result.hashpw;
							result.days = JSON.parse(result.days);
							res.send(JSON.stringify(result));
						}
					},"getuser",errfunc,errfunc,errfunc);
				} else{
					console.log("getuser: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
					res.send('{"error":"Unauthorized access to API call getuser, event will be logged"}');
				}
			} else res.send(req.session.user);
		} else res.send("");
	} else if(req.body.action == "updateestim"){
		if(req.session){
			var dat = req.body;
			if(["start","hours"].indexOf(dat.tag) >= 0){
				if(dat.tag == "hours" && isNaN(parseFloat(dat.value))){
					res.send('{"error":"updateestim: Hours is not a valid number: '+dat.value+'"}');
					return;
				}
				if(dat.tag == "hours") req.session.user.days[dat.day][0] = parseFloat(dat.value);
				else req.session.user.days[dat.day][1] = dat.value;
				var query = "UPDATE userdb SET days=? WHERE uid=?";
				var queryparms = [JSON.stringify(req.session.user.days), req.session.user.uid];
				var errfunc = function(inp){ res.send(JSON.stringify(inp)); }
				mysqlquery(query,queryparms,function(result){
					res.send(JSON.stringify(result));
				},"updateestim",errfunc,errfunc,errfunc);
			} else res.send('{"error":"updateestim: Incorrect column value: '+ dat.tag +'"}');
		} else res.send("");
	} else if(req.body.action == "edituser"){
		//////////////////////////// finish this/ /j////////////////
		/*if(req.session){
			var dat = req.body; //action, uid, tag, value
			if(["email","fname","lname","admin","wage","picture","rfid","passwd"].indexOf(dat.tag) >= 0){
				var query = "UPDATE userdb SET "+dat.tag+"=? WHERE uid=?";
				var queryparms = [dat.value];
				if(dat.tag == "passwd"){
					var salt = crypto.randomBytes(16).toString("hex");
					var hash = crypto.createHmac('sha512', salt);
					hash.update(dat.value);
					queryparms[0] = hash.digest("hex");
					queryparms.push(salt);
					query = "UPDATE userdb SET hashpw=?, salt=? WHERE uid=?";
				}
				if("uid" in dat){
					//check if admin
					if(!req.session.user.uid.admin){
						console.log("getuser: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
						res.send('{"error":"Unauthorized access to API call getuser, event will be logged"}');
						return;
					}
					queryparms.push(dat.uid);
				} else queryparms.push(req.session.user.uid);
			} else res.send('{"error":"edituser: Incorrect column value: '+dat.tag+'"}');
			// uid, email, salt, hash, fname, lname, admin, wage, days, picture, rfid
		} else res.send("");*/
		res.send('{"error":"Feature not implemented"}');
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
app.get('/account/logout*', function(req, res){
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
		console.log(tm, (new Date()));
		res.end("success");
	}
	else if(dat.action == "gettime"){
		console.log("Got time at", (new Date()));
		res.end(Math.floor(Date.now() / 1000) + "");
	}
	else if(!isLoggedIn(req)) res.send('{"error":"Must be logged in to use API"}');
	else{
		if(dat.action == "getclocks"){
			var query = "SELECT * FROM daydb WHERE uid=?";
			var queryparms = [];
			if("uid" in dat){
				if(req.session.user.admin) queryparms.push(dat.uid);
				else{
					console.log("getclocks: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
					res.send('{"error":"Unauthorized access to API call getclocks, event will be logged"}');
					return;
				}
			} else queryparms.push(req.session.user.uid);
			if("date" in dat){
				query +=  " AND day=?";
				queryparms.push(dat.date);
			} else if("week" in dat){
				query += " AND WEEK(day)=WEEK(?)";
				queryparms.push(dat.week);
			} else{
				if("fromday" in dat){
					query += " AND day>=?";
					queryparms.push(dat.fromday);
				}
				if("today" in dat){
					query += " AND day<=?";
					queryparms.push(dat.today);
				}
			}
			if(!("notjustnull" in dat)) query += " AND tend IS NULL";
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			mysqlquery(query,queryparms,function(result){
				res.send(JSON.stringify(result));
			},"getclocks",errfunc,errfunc,errfunc);
		}
		else if(dat.action == "addclocks"){
			var query = "INSERT INTO daydb (uid, day, tstart) VALUES (?,?,?)";
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			mysqlquery(query,[req.session.user.uid,dat.date,dat.time],function(result){
				res.send(JSON.stringify(result));
			},"addclocks",errfunc,errfunc,errfunc);
		}
		else if(dat.action == "editclocks"){
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			if(["day","tstart","tend"].indexOf(dat.tag) >= 0){
				var query = "UPDATE daydb SET "+dat.tag+"=?, hours=TIME_TO_SEC(TIMEDIFF(tend,tstart))/3600 WHERE did=? AND uid=?";
				mysqlquery(query,[dat.value,dat.did,req.session.user.uid],function(result){
					res.send(JSON.stringify(result));
				},"editclocks",errfunc,errfunc,errfunc);
			} else if(dat.tag == "hours"){
				var query = "UPDATE daydb SET hours=? WHERE did=? AND uid=?";
				mysqlquery(query,[dat.value,dat.did,req.session.user.uid],function(result){
					res.send(JSON.stringify(result));
				},"editclocks",errfunc,errfunc,errfunc);
			} else res.send('{"error":"editclocks: Incorrect column value: '+ dat.tag +'"}');
		}
		else if(dat.action == "getworks"){
			var query = "SELECT * FROM workdb WHERE uid=?";
			var queryparms = [req.session.user.uid];
			if("did" in dat){
				query += " AND did=?";
				queryparms.push(dat.did);
			} else {
				if("fromdid" in dat){
					query += " AND did>=?";
					queryparms.push(dat.fromdid);
				}
				if("todid" in dat){
					query += " AND did<=?";
					queryparms.push(dat.todid);
				}
			}
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			mysqlquery(query,queryparms,function(result){
				res.send(JSON.stringify(result));
			},"getworks",errfunc,errfunc,errfunc);
		}
		else if(dat.action == "addworks"){
			var query = "INSERT INTO workdb (uid, did, pid, description, tstart, tend) VALUES (?,?,?,?,?,?)";
			var errfunc = function(inp){ res.send(JSON.parse(inp)); };
			mysqlquery(query,[req.session.user.uid, dat.did, dat.pid, dat.desc, dat.tstart, dat.tend],function(result){
				res.send(JSON.stringify(result));
			},"addworks",errfunc,errfunc,errfunc,);
		}
		else if(dat.action == "editworks"){
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			if(["tstart","tend","pid","description"].indexOf(dat.tag) >= 0){
				var query = "UPDATE workdb SET "+dat.tag+"=? WHERE wid=? AND uid=?";
				mysqlquery(query,[dat.value,dat.wid,req.session.user.uid],function(result){
					res.send(JSON.stringify(result));
				},"editworks",);
			} else res.send('{"error":"editworks: Incorrect column value: '+ dat.tag +'"}');
		}
		else if(dat.action == "getprojs"){
			var query = "SELECT ";
			if("nodesc" in dat) query += "pid,title,active"
			else query += "*";
			query += " FROM projdb";
			if("active" in dat) query += " WHERE active=1";
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
			mysqlquery(query,[],function(result){
				res.send(JSON.stringify(result));
			},"getprojs",errfunc,errfunc,errfunc);
		}
		else if(dat.action == "gethours"){
			var errfunc = function(inp){ res.send(JSON.stringify(inp)); }
			var query = "day,hours,tend FROM daydb";
			var queryparms = [];
			if("allemployees" in dat){
				if(req.session.user.admin){
					query = "SELECT uid," + query;
					if("fromday" in dat || "today" in dat || "uid" in dat){
						query += " WHERE";
						var query2 = "";
						if("fromday" in dat){
							query2 += " AND day>=?";
							queryparms.push(dat.fromday);
						}
						if("today" in dat){
							query2 += " AND day<=?";
							queryparms.push(dat.today);
						}
						if("uid" in dat){
							query2 += " AND uid=?";
							queryparms.push(dat.uid);
						}
						query += query2.substring(4);
					}
					mysqlquery(query,queryparms,function(result){
						res.send(JSON.stringify(result));
					},"gethours",errfunc,errfunc,errfunc);
				} else{
					console.log("gethours: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
					res.send('{"error":"Unauthorized access to API call gethours, event will be logged"}');
				}
			} else{
				query = "SELECT " + query + " WHERE uid=?";
				queryparms.push(req.session.user.uid);
				if("fromday" in dat){
					query += " AND day>=?";
					queryparms.push(dat.fromday);
				}
				if("today" in dat){
					query += " AND day<=?";
					queryparms.push(dat.today);
				}
				mysqlquery(query,queryparms,function(result){
					res.send(JSON.stringify(result));
				},"gethours",errfunc,errfunc,errfunc);
			}
		}
		else if(dat.action == "getemployees"){
			//implement queries
			if(req.session.user.admin){
				var query = "SELECT uid,email,fname,lname,wage,days,picture FROM userdb";
				var errfunc = function(inp){ res.send(JSON.stringify(inp)); };
				mysqlquery(query,[],function(result){
					res.send(JSON.stringify(result));
				},"getemployees",errfunc,errfunc,errfunc);
			} else{
				console.log("getemployees: Unauthorized access by ", req.session.user.fname, req.session.user.lname);
				res.send('{"error":"Unauthorized access to API call getemployees, event will be logged"}');
			}
		}
		//getrfidevents (only for admins)
		else res.send('{"error":"Unknown API Action"}');
	}
}
app.post('/api', urlencodedParser, function(req, res){ apiFunc(req, res); });
app.get('/api', function(req, res){ apiFunc(Object.assign(req,{body:{}}), res); });

server = app.listen(8080, function () {
	var port = server.address().port;
	console.log("ARECS server listening on port %s", port);
})


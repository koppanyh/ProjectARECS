/* Core JS @copy 2018 Koppany Horvath
 * This file contains all the core js functions that are needed
 * for the UI side of the ARECS Project.
 * All code is under the MIT license and comes as is.
 */
 
function gettime(dt){
	if(dt == undefined) dt = new Date();
	var st = dt.getMinutes();
	if(st < 10) st = "0"+st;
	st = dt.getHours()+":"+st;
	if(dt.getHours() < 10) st = "0" + st;
	return st;
}
function getdate(dt){
	if(dt == undefined) dt = new Date();
	var dat = dt.getFullYear() + "-";
	dat += (dt.getMonth()<9?"0":"") + (dt.getMonth()+1) + "-";
	dat += (dt.getDate()<=9?"0":"") + dt.getDate();
	return dat;
}
	
function addhours(hours, addi){
	var tm = new Date();
	var a = hours.split(":");
	tm.setHours(a[0]);
	tm.setMinutes(a[1]);
	tm.setTime(tm.getTime() + addi*3600*1000);
	var b = [tm.getHours(), tm.getMinutes()];
	b[0] = (b[0] < 10 ? "0" : "") + b[0];
	b[1] = (b[1] < 10 ? "0" : "") + b[1];
	return b.join(":");
}

function httpRequest(prot, url, parms, func){
	var http = new XMLHttpRequest();
	http.open(prot, url, true);
	if(prot == "POST")
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function(){
		if(http.readyState == 4 && http.status == 200) func(http);
	};
	http.send(parms);
}

function checkError(inp){
	if("error" in inp){
		alert(inp.error);
		return true;
	}
	return false;
}
/* Core JS @copy 2018 Koppany Horvath
 * This file contains all the core js functions that are needed
 * for the UI side of the ARECS Project.
 * All code is under the MIT license and comes as is.
 */

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
#!/usr/bin/env node
var app=require("express")(),
    http=require("http").Server(app),
    fs=require("fs"),
	io=require('./io.js')(http);

var HTTPPORT=3456;

var COUNTDOWNTIME=3000;


var conntab={},nicklist=[];


function getTypeText(){
	var lines=String(fs.readFileSync(process.argv[1])).replace(/\n+/g,"\n").split("\n");
	var start=~~(Math.random()*(lines.length-5));
	return lines.slice(start,start+5).join(" ").replace(/[ \t]+/g," ").trim();
}


app.get("/",function(req,res){
	res.sendFile(__dirname+"/index.html");
});

});


http.listen(HTTPPORT,function(){
	console.log("Listening on http://localhost:"+HTTPPORT);
});

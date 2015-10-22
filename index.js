#!/usr/bin/env node
var app=require("express")(),
    http=require("http").Server(app),
    fs=require("fs"),
    io=require('./io.js')(http);

var HTTPPORT=3456;

var COUNTDOWNTIME=3000;

//var SOURCEFILE=process.argv[1];
var SOURCEFILE="mariolang.cpp";


var conntab={},nicklist=[];


function getTypeText(){
	var lines=String(fs.readFileSync(SOURCEFILE)).replace(/\n+/g,"\n").split("\n");
	var start=~~(Math.random()*(lines.length-10));
	var res="";
	var i;
	for(i=0;i<10&&res.length<120;i++)res+=lines[start+i]+" ";
	return res.replace(/[ \t]+/g," ").trim();
}


app.get("/",function(req,res){
	res.sendFile(__dirname+"/index.html");
});


http.listen(HTTPPORT,function(){
	console.log("Listening on http://localhost:"+HTTPPORT);
});

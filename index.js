#!/usr/bin/env node
var app=require("express")(),
    http=require("http").Server(app),
    io=require("socket.io")(http),
    fs=require("fs");


var HTTPPORT=3456;

var COUNTDOWNTIME=3000;


var conntab={},nicklist=[];


var uniqid=(function(){
	var id=0;
	return function(){return id++;}
})();

function validatenick(nick){
	return /^[a-zA-Z0-9_.-]{3,}$/.test(nick);
}


function getTypeText(){
	var lines=String(fs.readFileSync(process.argv[1])).replace(/\n+/g,"\n").split("\n");
	var start=~~(Math.random()*(lines.length-5));
	return lines.slice(start,start+5).join(" ").replace(/[ \t]+/g," ").trim();
}


app.get("/",function(req,res){
	res.sendFile(__dirname+"/index.html");
});

io.on("connection",function(conn){
	var obj={id:uniqid(),conn:conn,compwith:null,progress:0.0,compready:false};
	obj.name="__user"+obj.id;
	console.log("new connection, id = "+obj.id);
	conntab[obj.name]=obj;
	nicklist.push(obj.name);
	conn.on("disconnect",function(){
		console.log("disconnected, id = "+obj.id);
		if(obj.compwith){
			var cw=obj.compwith;
			conntab[cw].conn.emit("exit-competition");
			conntab[cw].progress=0.0;
			conntab[cw].compready=false;
			conntab[cw].compwith=null;
		}
		nicklist.splice(nicklist.indexOf(obj.name),1);
		delete conntab[obj.name];
	});
	conn.on("setnick",function(nick){
		if(!validatenick(nick)){
			conn.emit("-setnick",[false,"Invalid nick"]);
			return;
		} else if(conntab[nick]){
			conn.emit("-setnick",[false,"Nick taken"]);
			return;
		}
		nicklist[nicklist.indexOf(obj.name)]=nick;
		conntab[nick]=obj;
		delete conntab[obj.name];
		obj.name=nick;
		conn.emit("-setnick",[true,nick]);
	});
	conn.on("getnick",function(){
		conn.emit("-getnick",obj.name);
	});
	conn.on("usersearch",function(name){
		conn.emit("-usersearch",nicklist.filter(function(n){return n.indexOf(name)!=-1;}));
	});
	conn.on("invite",function(nick){
		if(!conntab.hasOwnProperty(nick)){
			conn.emit("-invite",[false,"Unknown nick"]);
			return;
		}
		conntab[nick].conn.emit("invitation",obj.name);
		conn.emit("-invite",[true,"Invitation sent"]);
	});
	conn.on("invite-accept",function(other){
		if(!conntab.hasOwnProperty(other)){
			conn.emit("-invite-accept",[false,"Unknown nick"]);
			return;
		}
		var text=getTypeText();
		conntab[other].conn.emit("competition-prepare",{other:obj.name,text:text});
		conn.emit("competition-prepare",{other:other,text:text});
		conntab[other].compwith=obj.name;
		obj.compwith=other;
		conntab[other].progress=obj.progress=0.0;
	});
	conn.on("competition-ready",function(){
		if(!obj.compwith)return; //wat
		if(conntab[obj.compwith].compready){
			conn.emit("competition-countdown",COUNTDOWNTIME);
			conntab[obj.compwith].conn.emit("competition-countdown",COUNTDOWNTIME);
			setTimeout(function(){
				if(!obj.compwith)return; //k
				conn.emit("competition-start");
				conntab[obj.compwith].conn.emit("competition-start");
			},COUNTDOWNTIME);
		} else obj.compready=true;
	});
	conn.on("progress",function(pr){
		if(!obj.compwith)return;
		conntab[obj.compwith].conn.emit("otherprogress",pr);
		if(pr>=1.0){
			conntab[obj.compwith].conn.emit("message","The opponent won!");
			conn.emit("message","You won!");
		}
	});
	conn.on("exit-competition",function(){
		obj.progress=0.0;
		obj.compready=false;
		if(!obj.compwith)return;
		var cw=obj.compwith;
		conntab[cw].conn.emit("exit-competition");
		conntab[cw].progress=0.0;
		conntab[cw].compready=false;
		conntab[cw].compwith=null;
		obj.compwith=null;
	});
});


http.listen(HTTPPORT,function(){
	console.log("Listening on http://localhost:"+HTTPPORT);
});

var utils = require('./utils.js');

module.exports = function (http) {
var io = require('socket.io')(http)

io.on("connection",function(conn){
	var obj = {
		id: utils.uniqid(),
		conn: conn,
		compwith: null,
		progress: 0.0,
		compready: false,
	};
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
		if(!utils.validatenick(nick)){
			conn.emit("-setnick",false,"Invalid nick");
			return;
		} else if(conntab[nick]){
			conn.emit("-setnick",false,"Nick taken");
			return;
		}
		nicklist[nicklist.indexOf(obj.name)]=nick;
		conntab[nick]=obj;
		delete conntab[obj.name];
		obj.name=nick;
		conn.emit("-setnick",true,nick);
	});
	conn.on("getnick",function(){
		conn.emit("-getnick",obj.name);
	});
	conn.on("usersearch",function(name){
		conn.emit("-usersearch",nicklist.filter(function(n){return n.indexOf(name)!=-1;}));
	});
	conn.on("invite",function(nick){
		if(!conntab.hasOwnProperty(nick)){
			conn.emit("-invite",false,"Unknown nick");
			return;
		}
		conntab[nick].conn.emit("invitation",obj.name);
		conn.emit("-invite",true,"Invitation sent");
	});
	conn.on("invite-accept",function(other){
		if(!conntab.hasOwnProperty(other)){
			conn.emit("-invite-accept",false,"Unknown nick");
			return;
		}
		conn.emit("-invite-accept",true);
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

return io;
};

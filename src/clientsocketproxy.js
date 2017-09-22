'use strict'
const https =require('https')
const express = require('express')
const app = express();
const io = require('socket.io-client');
const request = require("request");
const socket =  io('http://services.jowin.cn:4553')
var my ={
    mcu_id:'',
    tenant_id:''
}
socket.on('news',(message)=>{
    console.log(message);
})
socket.on('command', (message) => {
    let command = message.command;
    console.log('is my MCU command',command.mcu_id,my.mcu_id,(command.mcu_id == my.mcu_id) )
    if (command.mcu_id !== my.mcu_id) return;
    /*
    cscec2bshcms
   command {
       mcu_id
       url:
       method:
       authoriztion:
       params:
   } 
   */
  
   sendcommand(command,function(d){
       message.data = d;
       socket.emit('response',message)
       console.log(message)
   })
})

function sendcommand(data, callback) {
    // data = {url,method,username,password,params}
    var options = {
        method: data.method.toUpperCase(),
        uri: data.url,
        headers:
        {
            'cache-control': 'no-cache',
            'authorization': 'Basic ' + new Buffer(data.username + ':' + data.password).toString('base64'),
            'content-type': 'application/x-www-form-urlencoded',
        },
        rejectUnauthorized: false,
        requestCert: false,
        form: (typeof data.params=="undefined"?{}:data.params)
    };
    console.log('Command Got',options)
    request(options, function (error, response, body) {
        if (error) {
            console.log(error.message);
            if (callback) callback({statusCode:response.statusCode,statusMessage:response.statusMessage,body:body});
            throw error
        };
        console.log(response.statusCode,response.statusMessage)
        if (callback) callback(JSON.stringify({statusCode:response.statusCode,statusMessage:response.statusMessage,body:body}));
    })
    return 0;
}

app.listen(4553,function(){
    console.log('Listening on Port 4553')
})

module.exports={
    app,
    sendcommand,
    socket,
    my
}
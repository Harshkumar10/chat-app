const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port=process.env.PORT||3000;
const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));

//server(emit) ->client(recieve)- countUpdated
//client(emit) ->server(receive)- increment

//server(emit)-->client(receive)-->acknowlwdge-->server
//client(emit)-->server(receive)-->acknowlwdge-->client

//on we are listening



io.on('connection',(socket)=>{
    console.log('New Websocket connection');

    socket.on('join',({username,room},callback)=>{

        const {error,user}=addUser({ id:socket.id,username,room })

        if(error)
        {
            return callback(error);
        }

        //join room
        socket.join(user.room);


        socket.emit('message',generateMessage('Admin ','Welcome'));
          //broadcast to emit to everyone except the user
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin ',user.username+' has joined!'));
        //socket.emit,io.emit,broadcast.emit
        //io.to.emit -->to  every body ,socket.broadcasr.to.emit
        
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback();

    })    
  
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id);
        const filter=new Filter();
        if(filter.isProfane(message)){
            return callback('Profanitiy is not allowed');
        }
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback();
    })
  
   
    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,'https://google.com/maps?q='+coords.latitude+','+coords.longitude));
        callback()
    })
      //when it disconnect
    socket.on('disconnect',()=>{

        const user=removeUser(socket.id)

        if(user)
        {
            io.to(user.room).emit('message',generateMessage('Admin ',user.username+' has left'));
            io.to(user.room).emit('roomData',{

                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

        
    })
})

//app-->server
server.listen(port,()=>{
    console.log('Serve is up on port '+port);
})

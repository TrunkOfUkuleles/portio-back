'use strict';

require('dotenv').config();
const PORT = process.env.PORT || 3002;
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(PORT, {
    cors: {
        origin: "*",
    }
});




//Holds participants in each room
const gifs = io.of('/gifs');
let allWhoEnter = [];

gifs.on('connection', socket => {

    //Function to have users join rooms
    socket.on('join', payload => {
        console.log("Socket:", socket.id);
        console.log("payload: ", payload)
        //Checks for duplicates in allWhoEnter Array
        let allWhoEnterDuplicate = allWhoEnter.reduce((acc, userObj) => {
            if (userObj.socketId === payload.socketId) acc = true;
            return acc;
        }, false)
        //Checks if there are no and pushes user and socket id in array
        if (!allWhoEnterDuplicate) {
            allWhoEnter.push({ ...payload.user, socketId: socket.id });
        }
        gifs.emit('message', payload);
    });


    //listen to new messages from clients
    socket.on('message', payload => {
        console.log("HELLO THERE MESSAGE:, ", payload)
        //push the message to all other clients
        gifs.emit('message', payload);
    })

    socket.on('disconnect', payload => {
        console.log('SocketID: ', socket.id);

        let user = allWhoEnter.filter(userObj => userObj.socketId === socket.id)[0]
        if (user) {
            //Removes leaving user from all who enter
            allWhoEnter = allWhoEnter.filter(user => user.socketId !== socket.id);
            //Sends all participants to users
            gifs.emit('get all participants', allWhoEnter);
            console.log('allWhoEnter', allWhoEnter)


            //Emits user left room notification to clients in specific room
            socket.emit('user disconnected', { user });
        }

    })
})
// otherApp.listen(PORTER, () => console.log(`listening on ${PORTER}`));
server.listen(3004, () => console.log(`listening on ${3004}`));
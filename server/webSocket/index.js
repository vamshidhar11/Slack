// const webSocket = require('socket.io');
const WebSocket = require('ws');
const url = require('url');
const db = require('../models')
const jwt = require('jsonwebtoken');
const connect = require('./connect');
const message = require('./message');
const generateID = require('shortid').generate

function io(server) {
    const wss = new WebSocket.Server({ server });
    wss.getUniqueID = () => { return generateID(); }

    wss.on('connection', async (ws, req) => {
        // console.log(ws);
        // This will break for multiple cookies
        var token = req.headers.cookie.split(/=(.+)/);
        // ws authentication
        if (token[0] === "jwtID" && token[1]) {
            // console.log(token)
            await jwt.verify(token[1], process.env.jwt_SECRET, async function (err, decoded) {
                if (err) {
                    throw new Error("There was an error verifying the JWT token, while connecting to the websocket");
                }
                var user = await db.User.findOne({ username: decoded.username }, { password: 0 });
                if (user) {
                    req.user = user;
                } else {
                    throw new Error("User not found, while querying for the user in the DB");
                }
            })
        } else {
            // Nothing for now
            // Dummy placeholder for future
            console.log("No logged in user found")
        }
        // console.log(req)
        ws.send(JSON.stringify({
            type: "notification",
            author: "BOT",
            message: "You just joined the #general channel",
            dt: new Date(),
        }))

        // Assign an ID 
        ws.id = wss.getUniqueID();
        ws.userID = req.user._id

        console.log('Clients connected are:')
        wss.clients.forEach(function each(client) {
            console.log('Client.ID: ' + client.id);
        });

        // Actions to perform when the user connects
        connect(wss, ws, req)

        // Message events
        message(wss, ws, req)

        // ws.on('message', function incoming(message) {
        //     console.log('received: %s', message);
        //     ws.send(message);
        // });

    });

}

module.exports = io;
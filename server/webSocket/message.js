// Import the models
const db = require('../models');
const WebSocket = require('ws');

function message(wss, ws, req) {
    ws.on('message', async function incoming(message) {
        message = JSON.parse(message)
        // For new messages
        if (message.type == 'newMessage') {
            let room = await db.Room.findOne({ channel_id: message.channel_id });
            // console.log("room._id: " + room._id)
            let msgObj = {
                user: req.user._id,
                room: room._id,
                text: message.text,
            }
            console.log(msgObj)

            db.Message.create(msgObj)
                .then(msg => {
                    broadcast(wss, req.user.username, msg)
                })
                .catch((err) => {
                    console.log("Unable to create a new message!")
                })
        }
        // For channel history
        if (message.type == 'fetchHistory') {
            console.log('fetchHistory initiated...')
            let room = await db.Room.findOne({ channel_id: message.channel_id });
            let messages = await db.Message.find({ room: room._id })
                .populate('user', 'username')
                .sort({ createdAt: 1 });
            
            ws.send(JSON.stringify({
                type: 'fetchHistory',
                history: messages
            }))
        }
    });
}

// Broadcast to everyone.
function broadcast(wss, author, msg) {
    console.log(msg)
    console.log("Author: " + author)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "newMessage",
                author: author,
                message: msg.text,
                dt: msg.createdAt,
            }))
        }
    });
}

// Broadcast to everyone else.
// function broadcastHistory(wss, messages) {
//     wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             // messages
//             client.send(JSON.stringify({
//                 type: 'fetchHistory',
//                 history: messages
//             }))
//         }
//     });
// }

// function docsToObj(docs, key = '_id') {
//     const result = {};
//     docs.forEach((doc) => {
//         const value = doc[key];
//         result[value] = doc.toObject();
//         // exclude redundant key
//         result[value][key] = undefined;
//     });
//     return result;
// }

module.exports = message;
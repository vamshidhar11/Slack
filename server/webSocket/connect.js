// Import the models
const db = require('../models');
const WebSocket = require('ws');

function connect(wss, ws, req) {
    // Broadcast to everyone else.
    wss.clients.forEach(client => {
        if (client.id !== ws.id && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "notification",
                author: "BOT",
                message: (req.user.username || 'GUEST') + " has joined the #general channel",
                dt: new Date(),
            }))
        }
    });

    db.User.findOne(
        { username: req.user.username },
        { username: 1, firstName: 1, lastName: 1, rooms: 1 },
        (err, user) => {
            if (err) return new Error("Couldn't find the user");
            // user not found
            if (!user) return ws.send(JSON.stringify({
                type: 'error',
                message: 'User not found!'
            }))

            /**
             ** Join room.
             */
            const userRooms = user.rooms;
            const activeRoomId = userRooms.active;
            const sidebarRooms = userRooms.sidebar;

            db.Room.find(
                {
                    _id: { $in: sidebarRooms.channels.concat(sidebarRooms.directMessages) }
                },
                { users: 1, name: 1 },
                (err, rooms) => {
                    if (err || !rooms) return new Error('unable to find rooms' + err);

                    ws.send(JSON.stringify({
                        type: 'roomList',
                        rooms: docsToObj(rooms)
                    }))
                })
        }
    )
    // Fire the load history event
    ws.send(JSON.stringify({
        type: 'loadHistory'
    }))


}

function docsToObj(docs, key = '_id') {
    const result = {};
    docs.forEach((doc) => {
        const value = doc[key];
        result[value] = doc.toObject();
        // exclude redundant key
        result[value][key] = undefined;
    });
    return result;
}

module.exports = connect;
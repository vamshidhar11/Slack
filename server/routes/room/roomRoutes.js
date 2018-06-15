const express = require('express');
const router = express.Router();
const db = require('../../models')

// Helper function
// Route handler, to restrict access to logged in users
function requireLogin(req, res, next) {
    if (!req.user) {
        return res.json({
            error: true,
            message: "The user needs to log in"
        })
    } else {
        next();
    }
};

// List all the rooms for the logged in user
// Pending: List all direct messages as well
router.get('/', requireLogin, async (req, res) => {
    let userProjections = {
        password: 0,
        email: 0,
        createdAt: 0,
        updatedAt: 0,
    }
    var user = await db.User.findOne({ username: req.user.username }, userProjections)
        .populate('channels', 'channel_id name -_id')

    if (!user) {
        return res.json({
            error: true,
            message: "Couldn't find the user"
        })
    }
    return res.json({
        error: null,
        username: user.username,
        channels: user.channels
    })
})

// Create a new room
router.post('/newChannel', requireLogin, async function (req, res) {
    if (req.body.name) {
        db.Room.create({
            name: req.body.name,
            owner: req.user._id
        }, async function (err, room) {
            if (err || !room) {
                return res.json({
                    error: true,
                    message: "Error creating the room. Please try again"
                })
            }

            // Add the channel to the user's channel list
            await db.User.findOneAndUpdate({
                username: req.user.username
            }, {
                    $push: {
                        'rooms.sidebar.channels': room.channel_id
                    }
                })

            return res.json({
                error: null,
                message: 'Channel successfully created',
                channel_id: room.channel_id
            })
        })

    } else {
        return res.json({
            error: true,
            message: "A channel must have a name. Please enter a name."
        })
    }
})


// Add user to room
router.post('/:channel_id/add', function (req, res) {
    // Grab the list of users from req.body
    // Verify if the users with the specific username exist
    // If they all exist, add and send a success response
    // Discard usernames which do not have a match
    // Inform the user if there are usernames with no match
    console.log(req.body.users)
    var userList = req.body.users.substr(1, req.body.users.length - 2).replace(/ /g,'').split(',')
    console.log("userList: " + userList[0])
    return res.json({
        message: "Nothing here for now"
    })
})

module.exports = router;

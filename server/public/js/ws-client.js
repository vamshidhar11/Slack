$(function () {
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('ws://localhost:3000');

    connection.onopen = function () {
        // Connection is opened and ready to use
        input.removeAttr('disabled');
        status.text('Connection is opened and ready to use');
    }

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
        console.log('error: ' + error)
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
                + 'connection or the server is down.'
        }));
    }

    connection.onmessage = function (message) {
        // Validate if incoming message is a JSON
        // data
        try {
            var data = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ',
                message.data);
            return;
        }

        // handle the load history event
        if (data.type == 'loadHistory') {
            input.removeAttr('disabled');
            // alert("loadHistory called...")
            // Fire the fetchHistory event
            connection.send(JSON.stringify({
                type: 'fetchHistory',
                channel_id: 'general',
            }));
        }
        // handle incoming history dump
        if (data.type == 'fetchHistory') {
            for (let i = 0; i < data.history.length; i++) {
                // addMessage(author, message, dt)
                addMessage(data.history[i].user.username, 
                    data.history[i].text, 
                    new Date(data.history[i].createdAt))
            }
        }

        // handle incoming notification
        if (data.type == 'notification') {
            input.removeAttr('disabled');
            addMessage(data.author, data.message, new Date(data.dt))
            console.log(data)
        }
        // handle incoming new message
        if (data.type == 'newMessage') {
            input.removeAttr('disabled');
            addMessage(data.author, data.message, new Date(data.dt))
            console.log(data)
        }

    }

    function addMessage(author, message, dt) {
        content.append(
            "<p>><span><b>" + author + '</b></span> @ ' + (dt.getHours() < 10 ? '0'
                + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + message + '</p>'
        );
    }

    /**
     ** Send message when user presses Enter key
     */
    input.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // console.log(msg)
            // send the message as an ordinary text
            connection.send(JSON.stringify({
                type: 'newMessage',
                channel_id: 'general',
                text: msg
            }));
            $(this).val('');
        }
    })

});

const WebSocket = require('ws');
const express = require('express');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

app.use(express.static('public'));

const clients = [];

// Handle new WebSocket connections
wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('A new client connected.');

    ws.on('message', (message) => {
        // Broadcast the message to other players
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        // Remove the disconnected client
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        console.log('A client disconnected.');
    });
});

const server = app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// Upgrade HTTP to WebSocket connection
app.server = server;
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

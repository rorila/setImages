const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Mit diesem Kommando starten wir den Webserver.
var port = process.env.PORT || 5000;


http.listen(port, function () {
    // Wir geben einen Hinweis aus, dass der Webserer läuft.
    console.log('Webserver läuft und hört auf Port %d', port);
    console.log('Rufe http://localhost:%d/chat.html auf, um die Anwendung zu sehen', port)
});

// Hier teilen wir express mit, dass die öffentlichen HTML-Dateien
// im Ordner "public" zu finden sind.
app.use(express.static(__dirname + '/public'));

// === Ab hier folgt der Code für den Chat-Server

// Hier sagen wir Socket.io, dass wir informiert werden wollen,
// wenn sich etwas bei den Verbindungen ("connections") zu 
// den Browsern tut. 
io.on('connection', function (socket) {
    // Die variable "socket" repräsentiert die aktuelle Web Sockets
    // Verbindung zu jeweiligen Browser client.

    // Kennzeichen, ob der Benutzer sich angemeldet hat 
    var addedUser = false;

    // Funktion, die darauf reagiert, wenn sich der Benutzer anmeldet
    socket.on('add user', function (username) {
        // Benutzername wird in der aktuellen Socket-Verbindung gespeichert
        socket.username = username;
        addedUser = true;

        // Dem Client wird die "login"-Nachricht geschickt, damit er weiß,
        // dass er erfolgreich angemeldet wurde.
        socket.emit('login');

        // Alle Clients informieren, dass ein neuer Benutzer da ist.
        socket.broadcast.emit('user joined', socket.username);
    });

    socket.on('user spreaded cards', function (cardStack) {
        //  socket.emit('user spreaded cards', cardStack);
        socket.broadcast.emit('user spreaded cards', cardStack);
    });

    socket.on('showPlayground', function (data) {
        socket.emit('showPlayground', data);
        socket.broadcast.emit('showPlayground', data);
    });

    socket.on('showMemoryCard', function (index,username, x, y) {
       // socket.emit('showMemoryCard',index, username, x, y);
        socket.broadcast.emit('showMemoryCard',index, username, x, y);
    });


    socket.on('user clicked left mouse button', function (username, x, y) {
        console.log('user clicked left mouse button');
        // sende die Nachricht an den socket, der die Nachricht gesendet hat
        socket.emit('user clicked left mouse button', username, x, y);
        // sende die Nachricht an alle anderen sockets
        socket.broadcast.emit('user clicked left mouse button', username, x, y);
    });


    // Funktion, die darauf reagiert, wenn ein Benutzer eine Nachricht schickt
    socket.on('new message', function (data) {
        // Sende die Nachricht an alle Clients
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // Funktion, die darauf reagiert, wenn sich ein Benutzer abmeldet.
    // Benutzer müssen sich nicht explizit abmelden. "disconnect"
    // tritt auch auf wenn der Benutzer den Client einfach schließt.
    socket.on('disconnect', function () {
        if (addedUser) {
            // Alle über den Abgang des Benutzers informieren
            socket.broadcast.emit('user left', socket.username);
        }
    });
});
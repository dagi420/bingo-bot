const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');  // Ensure this route file is correctly defined

const app = express();
require('dotenv').config();
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

const server = http.createServer(app);
const io = socketIo(server);
const cardSelections = {};  // Keep track of card selections

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User joined game ${gameId}`);
    });

    socket.on('selectCard', (cardId) => {
        const previousCardId = cardSelections[socket.id];
        if (previousCardId) {
            io.emit('cardSelected', { cardId: previousCardId, isSelected: false });
        }
        cardSelections[socket.id] = cardId;
        io.emit('cardSelected', { cardId, isSelected: true });
    });

    socket.on('disconnect', () => {
        if (cardSelections[socket.id]) {
            io.emit('cardSelected', { cardId: cardSelections[socket.id], isSelected: false });
            delete cardSelections[socket.id];
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

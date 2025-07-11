export const registerSocketHandlers = (io, socket)=>{
    console.log('Player has connected :', socket.id);

    // Operation

    socket.on('disconnect', () =>{
        console.log('Player disconnected :', socket.id);
    });
};
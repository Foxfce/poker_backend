export const joinTable = (io , socket) =>{

    socket.on('join_table', roomId =>{
        socket.join(roomId)
    });

}
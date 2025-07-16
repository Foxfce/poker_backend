export const joinTable = (io , socket) =>{

    socket.on('join_table', roomId =>{
        socket.join(roomId)
    });

}

export const checkTableEmpty = (io, socket) =>{
    const tableId = socket.tableId
    if(tableData.has(tableId)){
        tableData.delete(tableId);
        console.log(`Delete table ${tableId}`);
        return ;
    }
    console.log(`Table already gone`);
}
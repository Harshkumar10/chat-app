const users=[]

//addUser,removeUser,getUsers,getUsersInRoom
const addUser=({id,username,room})=>{
    //Clean the data
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase()
    //console.log(username+" "+room);
    //Validate the data
    if(!username||!room)
    {
        return {
            error:'username and room required'
        }
    }
    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username;
    })

    //validate username
    if(existingUser)
    {
        return{
            error:'Username is in use!'
        }
    }

    const user={id,username,room}
    users.push(user);
    return {user};
}

const removeUser=(id)=>{
    const index = users.findIndex((user)=>{
        return user.id===id;
    });
    if(index!==-1)
    {
        //delete item
        return users.splice(index,1)[0];
    }
}
const getUser=(id)=>{
    return users.find((user)=>user.id==id);
}

const getUsersInRoom=(room)=>{
    room=room.trim();
    return users.filter((user)=>user.room===room);
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
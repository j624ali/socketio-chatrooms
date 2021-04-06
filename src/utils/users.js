const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) return { error: 'Username and room are required!' }

    const existingUser = users.find((user) => user.room === room && user.username === username)

    if (existingUser) return { error: 'Username is in use!' }
        
    const user = { id, username, room }

    users.push(user)

    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) return users.splice(index, 1)[0]
}

const getUser = (id) => {
    const user = users.find((u) => u.id === id )
    if (!user) return { error: 'User not found' }
    return user
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    const user = users.filter((u) => u.room === room)
    if (!user) return { error: 'No users in that room' }
    return user
}

module.exports = {
    addUser,
    getUserInRoom,
    getUser,
    removeUser
}
const socket = io()


// BOOTSTRAP
var toastElList = document.querySelector('.toast')

// Sound
const joined = new Audio('../sounds/join.mp3')
const left = new Audio('../sounds/left.mp3')
const msgSound = new Audio('../sounds/msg.mp3')
const errorSound = new Audio('../sounds/error.mp3')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })



const $form = document.querySelector('#form')
const $formTextInput = $form.querySelector('#message')
const $sendMessage = $form.querySelector('#send-message')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.getElementById('messages')
const $toastBody = document.querySelector('.toast-body')
const $usersInRoom = document.querySelector('.users-in-room')
const $messageBody = document.querySelector('.card-body')

document.querySelector('.room-name').textContent = room



const messageTemplate = document.getElementById('message-template').content

socket.on('message', (msg) => {
    const messageTemplate1 = document.importNode(messageTemplate, true)
    messageTemplate1.querySelector('.msg').textContent = msg
    console.log(msg)
    $toastBody.textContent = msg.message
    var toastList = new bootstrap.Toast(toastElList, { delay: 2500 })
    toastList.show()
    if (msg.info == 'left') {
        left.play()
    }
    if (msg.info == 'joined') {
        joined.play()
    }
    
    
 
})

socket.on('location', ({ username, message, createdAt }) => {
    console.log({ username, message, createdAt })

    const messageTemplate1 = document.importNode(messageTemplate, true)
    messageTemplate.querySelector('.time').textContent = ` - ${moment(createdAt).format('h:mm a')}`
    messageTemplate.querySelector('.username').textContent = username
    messageTemplate1.querySelector('.msg').innerHTML = message
    $messages.appendChild(messageTemplate1)
    
    $messageBody.scrollTop = $messageBody.scrollHeight
    
    msgSound.play()

})


socket.on('serverBroadcast', ({ username, message, createdAt }) => {
    console.log({ username, message, createdAt })
    const messageTemplate1 = document.importNode(messageTemplate, true)
    messageTemplate.querySelector('.time').textContent = ` - ${moment(createdAt).format('h:mm a')}`
    messageTemplate.querySelector('.username').textContent = username
    messageTemplate1.querySelector('.msg').innerHTML = message
    $messages.appendChild(messageTemplate1)
    $messageBody.scrollTop = $messageBody.scrollHeight
    
    msgSound.play()
    
})



socket.on('updateUsersList', (list) => {

    $usersInRoom.textContent = list.users.length

})

const msgBox = document.getElementById('message')

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = msgBox.value
    $sendMessage.setAttribute('disabled', 'disabled')

    socket.emit('clientMessage', msg, (error) => {
        $sendMessage.removeAttribute('disabled')
        $formTextInput.focus()
        if (error) {
        $toastBody.textContent = error.message
        var toastList = new bootstrap.Toast(toastElList, { delay: 5000 })
        toastList.show()
        errorSound.play()
        return console.log(error)

        }
        $formTextInput.value = ''

        console.log('Message sent.')
        $toastBody.textContent = 'Message sent'
        var toastList = new bootstrap.Toast(toastElList, { delay: 2500 })
        toastList.show()

    })


})



document.querySelector('#send-location').addEventListener('click', (e) => {
    $sendLocationBtn.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) return alert('Your browser does not suppoer geolocation.')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location', `https://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`, (acknowledgement) => {
   
        console.log(acknowledgement)
        $toastBody.textContent = acknowledgement.message
        var toastList = new bootstrap.Toast(toastElList, { delay: 2500 })
        toastList.show()
            $sendLocationBtn.removeAttribute('disabled')
        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = `/?error=${error}`
    }
})







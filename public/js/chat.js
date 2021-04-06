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
const $username = document.querySelector('#username')

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

socket.on('location', (location) => {
    console.log(location)

    const messageTemplate1 = document.importNode(messageTemplate, true)
    messageTemplate1.querySelector('.msg').innerHTML = `<small>${moment(location.createdAt).format('h:mm a')}</small> - ${location.message}`
    messageTemplate.querySelector('b').textContent = location.username
    $messages.appendChild(messageTemplate1)
    msgSound.play()
    console.log(location)
})


socket.on('serverBroadcast', (serverMsg) => {
    console.log(serverMsg)
    const messageTemplate1 = document.importNode(messageTemplate, true)
    messageTemplate.querySelector('b').textContent = serverMsg.username
    messageTemplate1.querySelector('.msg').innerHTML = `<small>${moment(serverMsg.createdAt).format('h:mm a')}</small> - ${serverMsg.message}`
    $messages.appendChild(messageTemplate1)

    msgSound.play()
    
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







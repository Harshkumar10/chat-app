//connect to the server
//this is client
const socket=io();

//Elemnts
const $messageForm=document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages=document.querySelector('#message');

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML;

//Optoin
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll=()=>{
    //new message elemt
    const $newMessage=$messages.lastElementChild

    //height of last message
    const newMessageStyle=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyle.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
    //console.log(newMessageMargin);
    const visibleHeight=$messages.offsetHeight

    //Height of messages container
    const containerHeight=$messages.scrollHeight;

    //how have i scolled
    const scrollOffset=$messages.scrollTop+visibleHeight;
    if(containerHeight-newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop=$messages.scrollHeight;
    }

}

socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:m:s A')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
socket.on('LocationMessage',(message)=>{
    //console.log(message);
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:m:s A')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable suggestions
    
    $messageFormButton.setAttribute('disabled','disabled');
    const message=document.querySelector('input').value;
    socket.emit('sendMessage',message,(error)=>{
        //when the event acknowleged

        //ensble
        $messageFormButton.removeAttribute('disabled','disabled');
        //clear the input 
        $messageFormInput.value='';
        //to hight the Input text field
        $messageFormInput.focus();

        if(error)
        {
            return console.log(error);
        }
        console.log('Message delivered');
    });
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    return alert('Geoloation is not suppeorted');
    //disabling the button
    $sendLocationButton.setAttribute('disabled','disabled');


    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position);
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location Shared!');
            $sendLocationButton.removeAttribute('disabled');
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error);
        location.href='/';
    }
})
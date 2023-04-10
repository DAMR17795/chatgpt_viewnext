//Hacemos las importaciones de fotos o iconos
import bot from './assets/bot.svg'
import user from './assets/user.svg'
import speaker from './assets/speaker.png'

//Creamos una constante para recoger el formulario del html y otra para recoger el contenedor del html
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

//Creamos una funcion donde nos va a escribir puntos cuando el bot este pensando la respuesta
function loader(element) {
    element.textContent = ''

    //Creamos un intervalo que se va a ejecutar cada 300 milisegundos y en el momento que llegue a 3 puntitos vuelve a 0
    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

//Esta funcion va a escribir cada 20 milisegundos la respuesta que ha dado el bot
function typeText(element, text) {
    let index = 0

    //Creamos un intervalo que cada 20 milisegundos va a escribir el texto hasta que llegue hasta el final.
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generar ID único para cada mensaje div de bot
// necesario para escribir el efecto de texto para esa respuesta específica
// sin ID único, escribir texto funcionará en todos los elementos
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

/*
La función chatStripe devuelve una cadena de texto 
HTML que representa un mensaje de chat entre un usuario y un bot (o AI). 
*/
function chatStripe(isAi, value, uniqueId, conversationID) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>

                <button class="altavoz" type="button" id=boton-${uniqueId}>
                <img src=${speaker} width=30 height=30>
                </button>

            </div>
        </div>
    `
    )
}


function imageStripe(isAi, imageUrl, uniqueId, conversationID) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}><img src="${imageUrl}" alt="Mi imagen"></img></div>
            </div>
        </div>
    `
    )
}

//ID para conversacion
var conversationID = "cID_" + generateUniqueId()

const handleSubmit = async (e) => { // función asíncrona que se ejecuta cuando se envía el formulario
    e.preventDefault() // previene que el formulario se envíe automáticamente

    const data = new FormData(form) // crea un objeto FormData con los datos del formulario
    const uniqueIdUser = generateUniqueId()
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'), uniqueIdUser, conversationID) // agrega el mensaje del usuario al contenedor de chat

    if (data.get('prompt').toLowerCase().includes("imagen")) {
        console.log("Tiene imagen");

        form.reset() // restablece el formulario para que se pueda enviar otro mensaje

        const uniqueId = generateUniqueId() // genera un ID único para el mensaje del bot
        chatContainer.innerHTML += imageStripe(true, " ", uniqueId) // agrega un mensaje vacío del bot con el ID generado

        const messageDiv = document.getElementById(uniqueId) // obtiene el div del mensaje del bot recién agregado
    
        loader(messageDiv) // muestra un icono de carga mientras se espera la respuesta del bot

        const response = await fetch('http://localhost:8000', { // realiza una solicitud POST a la URL del servidor
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // el tipo de contenido es JSON
            },
            body: JSON.stringify({
                prompt: data.get('prompt'),
                cID: conversationID // envía el prompt del usuario al servidor en formato JSON
            })
        })

        clearInterval(loadInterval) // detiene la animación de carga
        messageDiv.innerHTML = "Imagen Creada." // elimina el mensaje de carga

        if (response.ok) {
            const data = await response.json(); // pasa la respuesta en jsons
            console.log(data.data)
            chatContainer.innerHTML += imageStripe(true, data.data, uniqueId)

            //const parsedData = data.bot.trim() // quita los espacios en blanco
            content = ''
            recognition.stop();
            instructions.text("Presiona el microfono para empezar a hablar");
        } else {
            const err = await response.text()
    
            messageDiv.innerHTML = "Something went wrong"
            alert(err)
            content = ''
            recognition.stop();
            instructions.text("Presiona el microfono para empezar a hablar");
        }

        //Para cuando al pulsar el boton del altavoz
        //hable el texto que está escrito
        if(chatContainer.innerHTML.length>0){
            const btns = document.querySelectorAll('.altavoz');
            console.log(btns)
            btns.forEach(btn => {
                btn.addEventListener('click', function(event){
                    console.log(btn.id);
                    var textDiv = btn.previousElementSibling;
                    var texto =textDiv.textContent;
                    console.log(textDiv.textContent);
                    textToSpeech(texto);
                });
            });
        }


    } else {
        console.log("No tiene imagen");

        form.reset() // restablece el formulario para que se pueda enviar otro mensaje

        const uniqueId = generateUniqueId() // genera un ID único para el mensaje del bot
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId) // agrega un mensaje vacío del bot con el ID generado
    
        chatContainer.scrollTop = chatContainer.scrollHeight; // hace scroll hacia el final del contenedor de chat
    
        const messageDiv = document.getElementById(uniqueId) // obtiene el div del mensaje del bot recién agregado
    
        loader(messageDiv) // muestra un icono de carga mientras se espera la respuesta del bot
    
        const response = await fetch('http://localhost:8000', { // realiza una solicitud POST a la URL del servidor
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // el tipo de contenido es JSON
            },
            body: JSON.stringify({
                prompt: data.get('prompt'),
                cID: conversationID // envía el prompt del usuario al servidor en formato JSON
            })
        })
    
        clearInterval(loadInterval) // detiene la animación de carga
        messageDiv.innerHTML = " " // elimina el mensaje de carga
    
        if (response.ok) {
            const data = await response.json(); // pasa la respuesta en jsons
            const parsedData = data.bot.trim() // quita los espacios en blanco
    
            typeText(messageDiv, parsedData)
            content = ''
            recognition.stop();
            instructions.text("Presiona el microfono para empezar a hablar");
        } else {
            const err = await response.text()
    
            messageDiv.innerHTML = "Something went wrong"
            alert(err)
            content = ''
            recognition.stop();
            instructions.text("Presiona el microfono para empezar a hablar");
        }

        if(chatContainer.innerHTML.length>0){
            const btns = document.querySelectorAll('.altavoz');
            console.log(btns)
            btns.forEach(btn => {
                btn.addEventListener('click', function(event){
                    console.log(btn.id);
                    var textDiv = btn.previousElementSibling;
                    var texto =textDiv.textContent;
                    console.log(textDiv.textContent);
                    textToSpeech(texto);
                });
            });
        }

        
    }

   
}

//Funcion texTospeech
function textToSpeech(texto){
    let utterance = null; // Variable para guardar la instancia de SpeechSynthesisUtterance

      const textToSpeak = texto;
    
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Detener la síntesis de voz si ya está hablando
      }
    
      if (!utterance) {
        utterance = new SpeechSynthesisUtterance(textToSpeak); // Crear una nueva instancia de SpeechSynthesisUtterance si no existe
      }
      speechSynthesis.speak(utterance); // Iniciar la síntesis de voz
}

//Añade un evento al formulario que es el de enviar con el boton
form.addEventListener('submit', handleSubmit)

//Luego aqui añade la tecla enter al formulario para que se pueda enviar tambien presionandola
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
    recognition.stop();
    content = ''
    instructions.text("Presiona el microfono para empezar a hablar");
})

//Speech Recognition
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var content = '';
var textBox = $("#prompt");
var instructions = $("#instructions")
recognition.continuous = true;

recognition.onstart = function() {
    instructions.text("Ahora tienes el microfono activado");
}

recognition.onspeechend = function () {
    instructions.text("No hay actividad de Voz");
}

recognition.onspeechend = function() {
    instructions.text("Presiona el microfono para empezar a hablar");
    textBox.val("");
}

recognition.onresult = function() {
    var current = event.resultIndex;

    var transcript = event.results[current][0].transcript;
    content += transcript;
    textBox.val(content);
}

$("#micro").click(function (event){
    if (content.length) {
        content = ''
    }
    recognition.start();
});

  $("#micro").click(function (event){
    if (content.length) {
        content = ''
    }
    recognition.start();
});

/*if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Solicitar acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        // El usuario ha concedido acceso al micrófono
        // Puedes hacer cosas como grabar audio o iniciar reconocimiento de voz aquí
      })
      .catch(function(error) {
        // El usuario ha denegado el acceso al micrófono
        console.log("Error al solicitar acceso al micrófono:", error);
      });
  } else {
    console.log("getUserMedia no está soportado en este navegador.");
  }*/


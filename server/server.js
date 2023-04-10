import express from 'express'
import * as dotenv from 'dotenv'
//Para las peticiones cruzadas de origen (?)
import cors from 'cors'
//Para utilizar openai de manera cómoda
import { Configuration, OpenAIApi } from 'openai'
import mongoose from 'mongoose'
/*Comentario1*/

//Necesario para utilizar las constantes
// de .env
dotenv.config()

//Cojo la constante de la API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

//Instancia de openai con la api
const openai = new OpenAIApi(configuration);

//Inicializamos la aplicación express
const app = express()
//Permite realizar las peticiones cruzadas
//y llamar al servidor desde el frontend
app.use(cors())
//Permite pasar el json desde el frontend al backend
app.use(express.json())

//Mensaje para ver que el servidor está activo (GET)
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hola Mundo!'
  })
})
const { Schema } = mongoose;
    const promptSchema = new Schema({
      // String is shorthand for {type: String}
      author: String,
      body: String,
      time: String,
      conversationID: String,
    });
    const miModelo = mongoose.model("Prompt", promptSchema);
    mongoose.connect('mongodb+srv://dmarrom577:root@cluster0.ajztgrm.mongodb.net/BaseDatos?retryWrites=true&w=majority').then(
      () => console.log("Conexion exitosa")).catch(e => console.log(e))
//POST
app.post('/', async (req, res) => {
  try {
    //Pregunta
    const prompt = req.body.prompt;
    const cID = req.body.cID;

    //Mongoose BBDD
    ///////////////////////////////////////////////////////////////////////////////////
    var myObj = new miModelo({author: 'User' , body:`${prompt}`, time:getTimeAndDate(), conversationID:`${cID}`});
    
    myObj.save()
    .then(result => {
      console.log('Objeto insertado');
    })
    .catch(error => {
      console.error(error);
    });
    ///////////////////////////////////////////////////////////////////////////////////

    if (prompt.toLowerCase().includes("imagen")) {
      console.log("El prompt contiene la palabra imagen: " + prompt);

      const response = await openai.createImage({
        prompt: `${prompt}`,
        n: 1,
        size: "512x512"
      });

      const imageUrl = response.data.data[0].url;

      //Mondongo imagen
      ///////////////////////////////////////////////////////////////////////////
      myObj = new miModelo({author: 'AI' , body:imageUrl, time:getTimeAndDate(), conversationID:`${cID}`});
      myObj.save()
      .then(result => {
        console.log('Objeto insertado');
        //mongoose.connection.close();
      })
      .catch(error => {
        console.error(error);
      });
      ///////////////////////////////////////////////////////////////////////////


      res.status(200).json({
        succes:true,
        data: imageUrl
      });
    
    } else {
      //Mensaje respuesta
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${prompt}`,
        temperature: 0, // Higher values means the model will take more risks.
        max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        top_p: 1, // alternative to sampling with temperature, called nucleus sampling
        frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
        presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      });

      //Enviamos la respuesta al frontend
      
      //Mensaje enviado a MONGODB
      ///////////////////////////////////////////////////////////////////////////////////
      myObj = new miModelo({author: 'IA', body:response.data.choices[0].text, time: getTimeAndDate(), conversationID:`${cID}`});
      myObj.save()
      .then(result => {
        console.log('Objeto insertado');
        //mongoose.connection.close();
      })
      .catch(error => {
        console.error(error);
      });
      ///////////////////////////////////////////////////////////////////////////////////

      //Enviamos la respuesta al frontend
      res.status(200).send({
        bot: response.data.choices[0].text
      });
    }

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

function getTimeAndDate(){
  const currentDate = new Date();

  const currentDayOfMonth = currentDate.getDate();
  const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
  const currentYear = currentDate.getFullYear();

  const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear+" || "+currentDate.toLocaleTimeString();

  return dateString

}

//Establecemos el puerto 8000
app.listen(8000, () => console.log('AI server started on http://localhost:8000'))


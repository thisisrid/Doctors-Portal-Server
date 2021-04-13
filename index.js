const express = require("express");
const cors = require("cors");
const port = 5000 || process.env.PORT ;
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");


const app = express();
const uri =
 ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q83cw.mongodb.net/${process.env.DB_DbName}?retryWrites=true&w=majority`


app.use(express.json());
app.use(cors());
//file uploader midleware 
app.use(express.static('doctors'));
app.use(fileUpload());


app.get("/", (req, res) => {
    res.send("Server is Running");
  });

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  client.connect((err) => {
    const AppointmentCollection = client.db(`${process.env.DB_DbName}`).collection(`${process.env.DB_COLLECTION}`);
    const doctorCollection = client.db(`${process.env.DB_DbName}`).collection("doctors");
    
    app.post("/booking", (req, res) => {
      const booking = req.body;
      
      AppointmentCollection.insertOne(booking)
      .then((result) => {
        console.log(result.insertedCount > 0);
        res.send(result.insertedCount > 0);
      })
      .catch(err => {console.log(err)});
    });


    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;

        AppointmentCollection.find()
        .toArray((err, doc) => {
            const appointment = doc.filter(obj => obj.date === date.date)
            if (appointment.length > 0) {
                res.send(appointment)
            }
            else{
                res.send([])
            }
        })
    })
    app.post('/addDoctor', function(req, res) {
      const file = req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      const newImg = file.data;
      const encImg = newImg.toString('base64');


      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };
 //sending doctors information
      doctorCollection.insertOne({ name, email, image })
      .then(result => {
          res.send(result.insertedCount > 0);
          console.log("New Doctor Added Successfully")
      })

     //for saving img in definite directory
//      file.mv(`${__dirname}/doctors/${file.name}` , err => {
// if (err) {
//     console.log(err);
//     return res.status(500).send({message: 'File uploading failed'})
// }
// return res.send({name: file.name, path: `/${file.name}`})
//      })
      });

      //getting all doctors
      app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    console.log(" ======DATABASE CONNECTED ======");
  });





  app.listen(port, () => {
    console.log(`Node is ready`);
  });
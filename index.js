'use strict';
const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/salvador', {});

const Schema = mongoose.Schema;


const usuarioSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['admin', 'usuario']
  },
  password:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

const usuario =  mongoose.model('usuario', usuarioSchema);


app.use(compression());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/a', function (req, res) {
  res.send('hola estas en el path /a');
});


router.get('/v1', function (req, res) {
  res.status(201).json({message:'api is working!'});
});

router.get('/v1/usuarios', function (req, res) {
  let busqueda = {};
  
  if(req.query.tipo){
    busqueda.tipo = req.query.tipo;
  }
  
  if(req.query.email){
    busqueda.email = req.query.email;
  }
  
  usuario.find(busqueda, function (err, usuarios) {
    if(err) throw err;
    res.status(200).json(usuarios);
  });
});

router.post('/v1/usuarios', function (req, res) {
  let nuevoUsuario = new usuario(req.body);
  nuevoUsuario.save(function (err, usuarioCreado) {
    if(err) throw err;
    res.status(201).json(usuarioCreado);
  });
});

router.get('/v1/usuarios/:idusuario', function (req, res) {
  usuario.findOne({_id:req.params.idusuario},function (err, usuarioEncontrado) {
    if(err) throw err;
    if(usuarioEncontrado){
      return res.status(200).json(usuarioEncontrado);
    }
    
    return res.status(404).json({message: 'El usuario no ha sido encontrado'});
  });
});

router.put('/v1/usuarios/:idusuario', function (req, res) {
  usuario.findById({_id: req.params.idusuario}, function (err, usuarioModificar) {
    if(err) throw err;
    if(!usuarioModificar){
      return res.status(404).json({message: 'El usuario no existe'});
    }
    
    let missingFields = [];
    
    if(req.body){
      if(!req.body.tipo){
        missingFields.push('El campo tipo es requerido');
      }
      if(!req.body.email){
        missingFields.push('El campo email es requerido');
      }
      
      if(missingFields.length > 0) {
        return res.status(428).json({message: missingFields.join(',')});
      }
      
      if(req.body.password){
        usuarioModificar.password = req.body.password;
      }
      
      usuarioModificar.tipo = req.body.tipo;
      usuarioModificar.email= req.body.email;
      
      usuarioModificar.save(function (err, usuarioModificado) {
        if(err) throw err;
        res.status(203).json(usuarioModificado);
      });
    }
  });
});

router.delete('/v1/usuarios/:idusuario', function (req, res) {
  usuario.find({_id:req.params.idusuario}).remove().exec(function(err, data) {
    if(err) throw err;
    res.status(200).json(data);
  });
});

app.use('/api', router);




app.use('/contenidoestatico', express.static('contenidoestatico'));

app.use('/swagger', express.static('swagger'));

app.listen(3000);

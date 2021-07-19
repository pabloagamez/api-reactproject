const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.crearProyecto = async (req, res) => {
    // Revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errores: errors.array() });
    }

    try {
        // Crear un nuevo proyecto
        const proyecto = new Proyecto(req.body);

        // Guardar el creador via JWT
        proyecto.creador = req.usuario.id;

        await proyecto.save();
        res.json({proyecto});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Obtiene los proyectos del usuario actual
exports.obtenerProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.find({ creador: req.usuario.id });
        res.json(proyectos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Actualiza un proyecto
exports.actualizarProyecto = async (req, res) => {
    // Revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errores: errors.array() });
    }

    // Extraer la información del proyecto
    const { nombre } = req.body;
    const nuevoProyecto = {};

    if(nombre){
        nuevoProyecto.nombre = nombre;
    }

    try {
        // Revisar si existe el proyecto via ID
        let proyecto = await Proyecto.findById(mongoose.Types.ObjectId(req.params.id));
        if(!proyecto){
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }

        // Validar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Actualizar
        proyecto = await Proyecto.findByIdAndUpdate({ _id: req.params.id }, { $set: nuevoProyecto }, { new: true });

        res.json({ proyecto });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Elimina un proyecto por un id
exports.eliminarProyecto = async(req, res) => {
    try {
        // Revisar si existe el proyecto via ID
        let proyecto = await Proyecto.findById(mongoose.Types.ObjectId(req.params.id));
        if(!proyecto){
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }
  
        // Validar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Eliminar el proyecto
        await Proyecto.findOneAndRemove({ _id: req.params.id });
        res.json({ msg: 'Proyecto eliminado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}
const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Crea una nueva tarea
exports.crearTarea = async (req, res) => {
    // Revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errores: errors.array() });
    }

    try {
        // Extraer el proyecto y validar si existe
        const { proyecto } = req.body;

        const existeProyecto = await Proyecto.findById(mongoose.Types.ObjectId(proyecto));
        if(!existeProyecto){
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }

        // Validar el creador del proyecto
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Crear la tarea
        let tarea = new Tarea(req.body);
        await tarea.save();
        res.json({tarea});

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Obtiene las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
    try {
        // Extraer el proyecto y validar si existe
        const { proyecto } = req.query;

        const existeProyecto = await Proyecto.findById(mongoose.Types.ObjectId(proyecto));
        if(!existeProyecto){
            return res.status(404).json({ msg: 'Proyecto no encontrado' });
        }
 
        // Validar el creador del proyecto
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Obtener las tareas por proyecto
        const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
        res.json({ tareas });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Actualizar Tarea
exports.actualizarTarea = async (req, res) => {
    try {
        // Extraer el proyecto y validar si existe
        const { proyecto, nombre, estado } = req.body;

        // Validar si la tarea existe
        let tarea = await Tarea.findById(mongoose.Types.ObjectId(req.params.id));
        if(!tarea)
            return res.status(404).json({ msg: 'No existe la tarea' }); 
        
        const existeProyecto = await Proyecto.findById(mongoose.Types.ObjectId(proyecto));
        // Validar el creador del proyecto
        if(existeProyecto.creador.toString() !== req.usuario.id)
            return res.status(401).json({ msg: 'No autorizado' });
        
        // Crea un objeto con la nueva informacion
        const nuevaTarea = {};
        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;

        // Guardar la tarea
        tarea = await Tarea.findOneAndUpdate({ _id: req.params.id }, nuevaTarea, { new: true });
        res.json({tarea});

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}

// Eliminar Tarea
exports.eliminarTarea = async (req, res) => {
    try {
        // Extraer el proyecto y validar si existe
        const { proyecto } = req.query;

        // Validar si la tarea existe
        let tarea = await Tarea.findById(mongoose.Types.ObjectId(req.params.id));
        if(!tarea)
            return res.status(404).json({ msg: 'No existe la tarea' }); 
        
        const existeProyecto = await Proyecto.findById(mongoose.Types.ObjectId(proyecto));
        // Validar el creador del proyecto
        if(existeProyecto.creador.toString() !== req.usuario.id)
            return res.status(401).json({ msg: 'No autorizado' });
        
        // Eliminar Tarea
        await Tarea.findOneAndRemove({ _id: req.params.id });
        res.json({ msg: 'Tarea eliminada correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ha ocurrido un error' });
    }
}
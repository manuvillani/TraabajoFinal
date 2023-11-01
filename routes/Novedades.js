var express = require('express');
var Router = express.Router();
var Novedadesmodels = require('./../models/Novedadesmodels');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);

Router.get('/', async function (req, res, next) {
  var Novedades

  if(req.query.q === undefined){
    Novedades = await Novedadesmodels.getNovedades();
  } else {
    Novedades = await Novedadesmodels.buscarNovedades(req.query.q);
  }
  res.render("admin/Novedades",{
    layout: "admin/layout",
    usuario: req.session.nombre,
    Novedades,
    is_search: req.query.q !== undefined,
    q:req.query.q
  });

  

  Novedades = Novedades.map((novedades) => {
    if (novedades.img_id) { // Cambiado de "imgid" a "img_id"
      const imagen = cloudinary.image(novedades.img_id, {
        width: 100,
        height: 100,
        crop: 'fill'
      });
      return {
        ...novedades,
        imagen
      };
    } else {
      return {
        ...novedades,
        imagen: ''
      };
    }
  });

  res.render('admin/Novedades', {
    layout: 'admin/layout',
    usuario: req.session.nombre,
    Novedades
  });
});
Router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;


  await Novedadesmodels.deleteNovedadById(id);
  res.redirect('/admin/Novedades')

});
Router.get('/Agregar', (req, res, next) => {
  res.render('admin/Agregar', {
    layout: 'admin/layout'
  });
});

Router.post('/Agregar', async (req, res, next) => {
  try {
    var img_id = '';
    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      img_id = (await uploader(imagen.tempFilePath)).public_id;
    }
    if (req.body.Titulo != "" && req.body.Substitulo != "" && req.body.Cuerpo != "") {
      await Novedadesmodels.insertNovedad({
        ...req.body,
        img_id
      });
      res.redirect('/admin/Novedades')
    } else {
      res.render('admin/Agregar', {
        layout: 'admin/layout',
        error: true, message: 'Todos los campos son requeridos'
      })
    }
  } catch (error) {
    console.log(error)
    res.render('admin/Agregar', {
      layout: 'admin/layout',
      error: true, message: 'No se cargo la novedad'
    });
  }
});

Router.get('/Modificar/:id', async (req, res, next) => {
  var id = req.params.id;
  var novedades = await Novedadesmodels.getNovedadesById(id);
  res.render('admin/Modificar', {
    layout: 'admin/layout',
    novedades
  });
});

Router.post('/Modificar', async (req, res, next) => {
  try {
    var obj = {
      titulo: req.body.Titulo,
      subtitulo: req.body.Subtitulo,
      cuerpo: req.body.Cuerpo
    }
    console.log(obj)

    await Novedadesmodels.ModificarNovedadById(obj, req.body.id);
    res.redirect("/admin/novedades");
  } catch (error) {
    console.log(error)
    res.render('admin/modificar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se modifico la novedad'
    })
  }
});

module.exports = Router;
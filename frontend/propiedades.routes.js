// backend/routes/propiedades.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Tu configuración de PostgreSQL

// GET /api/propiedades - Listar todas las propiedades
router.get('/propiedades', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'propiedad_id', pi.propiedad_id,
              'url', pi.url,
              'nombre_archivo', pi.nombre_archivo,
              'es_principal', pi.es_principal,
              'orden', pi.orden
            ) ORDER BY pi.es_principal DESC, pi.orden ASC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as imagenes
      FROM propiedades p
      LEFT JOIN propiedades_imagenes pi ON p.id = pi.propiedad_id
      WHERE p.deleted_at IS NULL
        AND p.estado_publicacion_id = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar propiedades:', error);
    res.status(500).json({ error: 'Error al obtener propiedades' });
  }
});

// GET /api/propiedades/:id - Obtener una propiedad específica con sus imágenes
router.get('/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'propiedad_id', pi.propiedad_id,
              'url', pi.url,
              'nombre_archivo', pi.nombre_archivo,
              'es_principal', pi.es_principal,
              'orden', pi.orden
            ) ORDER BY pi.es_principal DESC, pi.orden ASC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as imagenes
      FROM propiedades p
      LEFT JOIN propiedades_imagenes pi ON p.id = pi.propiedad_id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({ error: 'Error al obtener la propiedad' });
  }
});

// GET /api/propiedades/:id/imagenes - Obtener solo las imágenes de una propiedad
router.get('/propiedades/:id/imagenes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT *
      FROM propiedades_imagenes
      WHERE propiedad_id = $1
      ORDER BY es_principal DESC, orden ASC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
});

// PATCH /api/propiedades/:id/visitas - Incrementar contador de visitas
router.patch('/propiedades/:id/visitas', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE propiedades
      SET visitas = COALESCE(visitas, 0) + 1
      WHERE id = $1
    `, [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al incrementar visitas:', error);
    res.status(500).json({ error: 'Error al actualizar visitas' });
  }
});

// GET /api/propiedades/search - Buscar propiedades con filtros
router.get('/propiedades/search', async (req, res) => {
  try {
    const {
      tipo_negocio_id,
      tipo_propiedad_id,
      precio_min,
      precio_max,
      habitaciones,
      ciudad_id,
      zona_id
    } = req.query;

    let query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'propiedad_id', pi.propiedad_id,
              'url', pi.url,
              'nombre_archivo', pi.nombre_archivo,
              'es_principal', pi.es_principal,
              'orden', pi.orden
            ) ORDER BY pi.es_principal DESC, pi.orden ASC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as imagenes
      FROM propiedades p
      LEFT JOIN propiedades_imagenes pi ON p.id = pi.propiedad_id
      WHERE p.deleted_at IS NULL
        AND p.estado_publicacion_id = 1
    `;

    const params = [];
    let paramCount = 0;

    if (tipo_negocio_id) {
      paramCount++;
      query += ` AND p.tipo_negocio_id = $${paramCount}`;
      params.push(tipo_negocio_id);
    }

    if (tipo_propiedad_id) {
      paramCount++;
      query += ` AND p.tipo_propiedad_id = $${paramCount}`;
      params.push(tipo_propiedad_id);
    }

    if (precio_min) {
      paramCount++;
      query += ` AND (p.precio >= $${paramCount} OR p.precio_alquiler >= $${paramCount})`;
      params.push(precio_min);
    }

    if (precio_max) {
      paramCount++;
      query += ` AND (p.precio <= $${paramCount} OR p.precio_alquiler <= $${paramCount})`;
      params.push(precio_max);
    }

    if (habitaciones) {
      paramCount++;
      query += ` AND p.habitaciones >= $${paramCount}`;
      params.push(habitaciones);
    }

    if (ciudad_id) {
      paramCount++;
      query += ` AND p.ciudad_id = $${paramCount}`;
      params.push(ciudad_id);
    }

    if (zona_id) {
      paramCount++;
      query += ` AND p.zona_id = $${paramCount}`;
      params.push(zona_id);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error al buscar propiedades' });
  }
});

module.exports = router;
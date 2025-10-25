// Registro de usuario con todos los campos del formulario
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, address, email, password, birthdate, sex, interests, hobbies } = req.body;

    if (!full_name || !email || !password || !birthdate || !sex) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'INSERT INTO users (full_name, address, email, password, birthdate, sex, interests, hobbies) VALUES (?,?,?,?,?,?,?,?)',
        [full_name, address, email, password, birthdate, sex, interests, hobbies]
      );
      conn.release();
      res.json({ ok: true, message: 'Usuario registrado correctamente' });
    } catch (e) {
      conn.release();
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El correo ya está registrado' });
      }
      throw e;
    }
  } catch (err) {
    console.error('Error en /api/register:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Confirmación de registro
app.get('/api/register/confirm', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email requerido' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error('Error confirmación:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

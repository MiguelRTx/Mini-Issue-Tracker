require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const projectsRoutes = require('./routes/projects.routes');
const ticketsRoutes = require('./routes/tickets.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/projects', projectsRoutes);
app.use('/projects/:pid/tickets', ticketsRoutes);

app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (token) return res.redirect('/projects');
    res.redirect('/auth/login');
});

app.use((req, res) => {
    res.status(404).render('error', { message: 'Pagina no encontrada', user: null });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Error interno del servidor', user: null });
});

sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada');
    app.listen(PORT, () => {
        console.log('Servidor corriendo en http://localhost:' + PORT);
    });
}).catch(err => {
    console.error('Error al conectar la base de datos:', err);
});

const express = require('express');
const roteador = require('./rotas/rotas');
const api = express();

api.use(express.json());
api.use(roteador);

api.listen(3000);

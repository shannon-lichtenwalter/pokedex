require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');
const {PORT} = require('./config');



const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

const validTypes = ['', 'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];


function handleGetTypes(req, res) {
  return res.json(validTypes);
}

function handleGetPokemon(req, res) {
  const { name = '', type = '' } = req.query;
  if (!validTypes.includes(type)) {
    return res.status(401).json({ error: 'must select a valid type' });
  }
  let results = POKEDEX.pokemon;
  if (name) {
    results = results.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (type) {
    results = results.filter(pokemon => pokemon.type.toString().includes(type));
  }
  return res.json(results);
}

function validateBearerToken(req, res, next) {
  const auth = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if (!auth || auth.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
}

app.get('/types', handleGetTypes);
//app.get('/pokemon', handleGetPokemon);



app.use((error, req, res, next) => {
  if(process.env.NODE_ENV === 'production'){
    return res
      .status(500)
      .json({error: {message: 'server error'}});
  }
  console.log(error);
  return res
    .status(500)
    .json({error});
});

app.listen(PORT, () => {
  console.log(`Express server listening at port: ${PORT}`);
});
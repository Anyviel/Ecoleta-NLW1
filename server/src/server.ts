import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  console.log('Ola Mundo e Listagem de Users')

  response.json([
    'Daniru',
    'Kelbiru',
    'Moricir',
    'Kappa',
    'Carlito'
  ])
});

app.listen(3333);
//Urls referentes ao front-end sem a "/" no final

const front =
  process.env.NODE_ENV == 'development'
    ? 'https://danielmarcal.compjunior.com.br'
    : 'http://localhost:8080';

const back =
  process.env.NODE_ENV == 'development'
    ? 'https://danielmarcal.compjunior.com.br/api'
    : 'http://localhost:3000';

const uploads =
  process.env.NODE_ENV == 'development'
    ? 'https://danielmarcal.compjunior.com.br'
    : 'http://localhost:3000';

export default { front, back, uploads };

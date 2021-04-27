import express from 'express';
import bodyParser from 'body-parser';
import {
  Sobre,
  Contato,
  AreasAtuacao,
  Uploads,
  Artigos,
  Autenticacao,
  Status,
  Processos,
  Usuarios,
  Membros,
} from '@/app/controllers';
import cors from 'cors';
import criarPastas from '@/utils/criarPastas';

const app = express();

const port = process.env.NODE_ENV == 'development' ? 5000 : 3000;

criarPastas();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/sobre', Sobre);
app.use('/contato', Contato);
app.use('/areas', AreasAtuacao);
app.use('/autenticacao', Autenticacao);
app.use('/usuarios', Usuarios);
app.use('/artigos', Artigos);
app.use('/status-processo', Status);
app.use('/processos', Processos);
app.use('/uploads', Uploads);
app.use('/membros', Membros);
app.listen(port, () => {
  console.log(`Servidor rodando no link http://localhost:${port}`);
});

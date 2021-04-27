import { Router } from 'express';
import Usuario from '@/app/schemas/Usuario';
import AuthMiddleware from '@/app/middlewares/Auth';
import messages from '@/utils/errors/ErrorMessages';

const router = new Router();

router.get('/', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  Usuario.find()
    .lean()
    .then((usuarios) => {
      usuarios = usuarios.filter((usuario) => {
        return usuario.documento !== 'undefined' && usuario.nivel !== 'admin';
      });
      usuarios = usuarios.sort((a, b) => {
        if (a.nome.toLowerCase() < b.nome.toLowerCase()) {
          return -1;
        }
        if (a.nome.toLowerCase() > b.nome.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      return res.status(200).send(usuarios);
    })
    .catch((err) => {
      console.error('Erro ao listar os processos cadastrados', err);

      return res.status(500).send({ mensagem: messages.INTERNAL_ERROR });
    });
});

export default router;

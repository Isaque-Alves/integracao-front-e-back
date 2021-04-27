import { Router } from 'express';
import Process from '@/app/schemas/Processo';
import Status from '@/app/schemas/Status';
import { isValidObjectId } from 'mongoose';
import AuthMiddleware from '@/app/middlewares/Auth';

import { messages } from '@/utils/errors/ErrorMessages';

const router = new Router();

router.get('/', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.get('/:processId', AuthMiddleware({ nivel: 'usuario' }), (req, res) => {
  const { processId } = req.params;

  if (!isValidObjectId(processId))
    return res.status(400).send({ erro: messages.WRONG_ID });

  Status.find({ process: processId })
    .then((status) => {
      if (status) {
        return res.status(200).send(status);
      } else {
        return res.status(200).send({ mensagem: messages.INSTANCES_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error('Erro ao deletar os dados desse status', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post('/', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.post(
  '/:processId',
  AuthMiddleware({ nivel: 'admin' }),
  async (req, res) => {
    const { processId } = req.params;
    const { text } = req.body;

    if (!isValidObjectId(processId))
      return res.status(400).send({ erro: messages.WRONG_ID });

    if (!text) {
      return res.status(400).send({ erro: 'O texto é obrigatório' });
    }

    const process = await Process.findById(processId);

    if (!process) {
      return res
        .status(400)
        .send({ erro: 'Não existe um processo com o ID especificado' });
    }

    Status.create({ process: processId, text })
      .then(() => {
        return res.status(200).send({ mensagem: messages.CREATE_SUCCESS });
      })
      .catch((err) => {
        console.error('Erro ao criar a instância desse status', err);

        return res.status(500).send({ erro: messages.CREATE_ERROR });
      });
  },
);

export default router;

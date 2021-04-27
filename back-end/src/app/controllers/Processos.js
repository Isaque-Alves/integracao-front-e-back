import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import Process from '@/app/schemas/Processo';
import AuthMiddleware from '@/app/middlewares/Auth';

import { messages } from '../../utils/errors/ErrorMessages';

const checkData = (name, number, processingLocation) => {
  if (!name) {
    return 'O nome do processo é obrigatório';
  }

  if (!number) {
    return 'O número do processo é obrigatório';
  }

  if (!processingLocation) {
    return 'O local de tramitação é obrigatório';
  }

  return null;
};

const router = new Router();

router.get('/processo-unico', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.get(
  '/processo-unico/:processId',
  AuthMiddleware({ nivel: 'usuario' }),
  (req, res) => {
    const { processId } = req.params;

    if (!isValidObjectId(processId))
      return res.status(400).send({ erro: messages.WRONG_ID });

    Process.findById(processId)
      .then((process) => {
        return res.status(200).send(process);
      })
      .catch((err) => {
        console.error('Erro ao listar esse processo', err);

        return res.status(500).send({ mensagem: messages.INTERNAL_ERROR });
      });
  },
);

router.get('/usuario', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.get(
  '/usuario/:userId',
  AuthMiddleware({ nivel: 'usuario' }),
  (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId))
      return res.status(400).send({ erro: messages.WRONG_ID });

    Process.find({ user: userId })
      .then((processes) => {
        if (processes) {
          return res.status(200).send(processes);
        } else {
          return res.status(404).send({ erro: messages.INSTANCES_NOT_FOUND });
        }
      })
      .catch((err) => {
        console.error('Erro ao listar os processos desse usuário', err);

        return res.status(500).send({ mensagem: messages.INTERNAL_ERROR });
      });
  },
);

router.post('/usuario', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.post(
  '/usuario/:userId',
  AuthMiddleware({ nivel: 'admin' }),
  async (req, res) => {
    const { userId } = req.params;
    const { name, number, processingLocation } = req.body;

    if (!isValidObjectId(userId))
      return res.status(400).send({ erro: messages.WRONG_ID });

    const error = checkData(name, number, processingLocation);

    if (error) {
      return res.status(400).send({ erro: error });
    }

    const registeredProcess = await Process.findOne({ number });

    if (registeredProcess) {
      return res
        .status(400)
        .send({ erro: 'Já existe um processo cadastrado com esse número' });
    }

    Process.create({ user: userId, name, number, processingLocation })
      .then(() => {
        return res.status(200).send({ mensagem: messages.CREATE_SUCCESS });
      })
      .catch((err) => {
        console.error('Erro ao cadastrar esse processo', err);

        return res.status(500).send({ mensagem: messages.INTERNAL_ERROR });
      });
  },
);

export default router;

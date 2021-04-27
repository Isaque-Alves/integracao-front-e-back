import { Router } from 'express';
import AreasAtuacaoSchema from '@/app/schemas/AreasAtuacao';
import { isValidObjectId } from 'mongoose';
import AuthMiddleware from '@/app/middlewares/Auth';
import { messages } from '@/utils/errors/ErrorMessages';

const router = new Router();

router.get('/', (req, res) => {
  AreasAtuacaoSchema.find()
    .then((areas) => {
      return res.send(areas);
    })
    .catch((err) => {
      console.error(err, 'Erro ao listar áreas de atuação');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post('/', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }

  AreasAtuacaoSchema.create({ titulo, descricao })
    .then((AreaAtuacao) => {
      return res.send(AreaAtuacao);
    })
    .catch((err) => {
      console.error(err, 'Erro ao adicionar área de atuação');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.put('/:id', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { titulo, descricao } = req.body;
  const { id } = req.params;

  if (!id || !titulo || !descricao) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }
  if (!isValidObjectId(id)) {
    return res.status(400).send({ erro: messages.WRONG_ID });
  }

  AreasAtuacaoSchema.findByIdAndUpdate(id, { titulo, descricao })
    .then((area) => {
      if (area) {
        return res.send(area);
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error(err, 'Erro ao editar área de atuação');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.delete('/:id', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }
  if (!isValidObjectId(id)) {
    return res.status(400).send({ erro: messages.WRONG_ID });
  }

  AreasAtuacaoSchema.findByIdAndRemove(id)
    .then((area) => {
      if (area) {
        return res.send(area);
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error(err, 'Erro ao deletar área de atuação');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

export default router;

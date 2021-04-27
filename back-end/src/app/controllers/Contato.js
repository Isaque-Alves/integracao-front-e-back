import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import AuthMiddleware from '@/app/middlewares/Auth';
import Contact from '@/app/schemas/Contato';

import { messages } from '../../utils/errors/ErrorMessages';

const checkData = (email, telephone, address, socialMedia) => {
  if (!email) return 'O email é obrigatório';

  if (!telephone) return 'O telefone é obrigatório';

  if (!address) return 'O endereço é obrigatório';

  if (!socialMedia) {
    return 'As redes sociais cadastradas na seção são obrigatórias';
  }

  return null;
};

const router = new Router();

router.get('/', (req, res) => {
  Contact.findOne()
    .then((contact) => {
      return res.status(200).send(contact);
    })
    .catch((err) => {
      console.error('Erro ao listar os dados da seção contato', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERRO,
      });
    });
});

router.post('/', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { email, telephone, address, socialMedia } = req.body;

  const error = checkData(email, telephone, address, socialMedia);

  if (error) {
    return res.status(400).send({ erro: error });
  }

  const phoneNumberIsOk = /\(\d{2}\)\s\d{4,5}\-\d{4}/g.test(telephone);

  if (!phoneNumberIsOk) {
    return res
      .status(400)
      .send({ erro: 'O telefone enviado está mal formatado' });
  }

  Contact.create({
    email,
    telephone,
    address,
    socialMedia,
  })
    .then(() => {
      return res.status(200).send({ mensagem: messages.CREATE_SUCCESS });
    })
    .catch((err) => {
      console.error('Erro ao criar a instância da seção contato', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERROR,
      });
    });
});

router.put('/', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.put('/:id', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { id } = req.params;
  const { email, telephone, address, socialMedia } = req.body;

  if (!isValidObjectId(id))
    return res.status(400).send({ erro: messages.WRONG_ID });

  const error = checkData(email, telephone, address, socialMedia);

  if (error) {
    return res.status(400).send({ erro: error });
  }

  const phoneNumberIsOk = /\(\d{2}\)\s\d{4,5}\-\d{4}/g.test(telephone);

  if (!phoneNumberIsOk) {
    return res
      .status(400)
      .send({ erro: 'O telefone enviado está mal formatado' });
  }

  Contact.findByIdAndUpdate(
    id,
    {
      email,
      telephone,
      address,
      socialMedia,
    },
    { new: true },
  )
    .then((contact) => {
      if (contact) {
        return res.status(200).send({ erro: messages.UPDATE_SUCCESS });
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error('Erro ao atualizar os dados da seção contato', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERRO,
      });
    });
});

router.delete('/', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send({ erro: messages.MISS_ID });

  if (!isValidObjectId(id))
    return res.status(400).send({ erro: messages.WRONG_ID });

  Contact.findByIdAndRemove(id)
    .then((contact) => {
      if (contact) {
        return res.status(200).send({ mensagem: messages.DELETE_SUCCESS });
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error('Erro ao deletar os dados da seção contato', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERRO,
      });
    });
});

export default router;

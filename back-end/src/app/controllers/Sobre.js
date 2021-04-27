import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import About from '@/app/schemas/Sobre';
import multer from '@/app/middlewares/Multer';
import AuthMiddleware from '@/app/middlewares/Auth';
import DeletePhoto from '@/utils/DeletePhoto';
import { AboutMiddleware } from '@/app/middlewares/Seed';
import { messages } from '../../utils/errors/ErrorMessages';
import resizeImage from '@/app/middlewares/resizeImage';
import resolveUrls from '@/utils/resolveUrls';

const router = new Router();

router.get('/', AboutMiddleware, (req, res) => {
  About.findOne()
    .then((about) => {
      if (about) {
        about.imageUrl = resolveUrls(about.imageUrl);
      }

      return res.status(200).send(about);
    })
    .catch((err) => {
      console.error('Erro ao listar os dados da seção sobre', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERROR,
      });
    });
});

router.post(
  '/',
  [AuthMiddleware({ nivel: 'admin' }), multer.single('imageUrl'), resizeImage],
  (req, res) => {
    const { text } = req.body;

    if (!text) {
      if (!req.file) {
        return res
          .status(400)
          .send({ erro: 'Nenhum dado enviado na requisição' });
      } else {
        DeletePhoto(req.file.path);
      }
      return res.status(400).send({ erro: 'O texto da seção é obrigatório' });
    }

    if (typeof req.file == 'undefined')
      return res.status(400).send({ erro: 'A imagem é obrigatória' });

    const imageUrl = req.file.path;

    About.create({ text, imageUrl })
      .then(() => {
        return res.status(200).send({ mensagem: messages.CREATE_SUCCESS });
      })
      .catch((err) => {
        console.error('Erro ao criar a instância da seção sobre', err);

        return res.status(500).send({
          erro: messages.INTERNAL_ERROR,
        });
      });
  },
);

router.put('/', (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.put(
  '/:id',
  [AuthMiddleware({ nivel: 'admin' }), multer.single('imageUrl'), resizeImage],
  async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    let imageUrl;

    if (!isValidObjectId(id)) {
      if (req.file) {
        DeletePhoto(req.file.path);
      }
      return res.status(400).send({ erro: messages.WRONG_ID });
    }

    if (!text) {
      if (!req.file) {
        return res
          .status(400)
          .send({ erro: 'Nenhum dado enviado na requisição' });
      } else {
        DeletePhoto(req.file.path);
      }
      return res.status(400).send({ erro: 'O texto da seção é obrigatório' });
    }

    try {
      let aboutData = await About.findById(id);

      if (!aboutData) {
        return res
          .status(500)
          .send({ erro: 'O ID inserido não está cadastrado' });
      }

      let oldPhoto = aboutData.imageUrl;

      if (typeof req.file != 'undefined') {
        imageUrl = req.file.path;
      } else {
        imageUrl = oldPhoto;
      }

      aboutData = await About.findByIdAndUpdate(
        id,
        { text, imageUrl },
        { useFindAndModify: false, new: true },
      ).exec();

      if (typeof req.file != 'undefined') {
        oldPhoto = `..${oldPhoto}`;
        DeletePhoto(oldPhoto);
      }

      return res.status(200).send({ mensagem: messages.UPDATE_SUCCESS });
    } catch (err) {
      if (typeof req.file != 'undefined') {
        DeletePhoto(req.file.path);
      }

      console.error('Erro ao atualizar os dados da seção', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    }
  },
);

export default router;

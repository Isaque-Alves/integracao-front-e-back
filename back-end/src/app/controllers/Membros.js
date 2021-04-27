import { Router } from 'express';
import AuthMiddleware from '@/app/middlewares/Auth';
import Multer from '@/app/middlewares/Multer';
import { isValidObjectId } from 'mongoose';
import MembroSchema from '@/app/schemas/Membro';
import { messages } from '@/utils/errors/ErrorMessages';
import DeletePhoto from '@/utils/DeletePhoto';
import resizeImage from '@/app/middlewares/resizeImage';
import resolveUrls from '@/utils/resolveUrls';

const router = new Router();

router.get('/', (req, res) => {
  MembroSchema.find()
    .then((membros) => {
      const result = membros.map((membro) => {
        membro.urlImagem = resolveUrls(membro.urlImagem);
        return membro;
      });
      return res.send(result);
    })
    .catch((erro) => {
      console.error(erro, 'Erro ao listar mensagens');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post(
  '/',
  [AuthMiddleware({ nivel: 'admin' }), Multer.single('urlImagem'), resizeImage],
  (req, res) => {
    const { nome } = req.body;
    var { urlOAB, descricao } = req.body;

    if (!req.file || !nome || !descricao || !urlOAB) {
      if (req.file) {
        DeletePhoto(req.file.path);
      }
      console.log(req.file, nome, descricao, urlOAB, req.body);
      return res.status(400).send({ erro: messages.MISS_INFO });
    }

    if (descricao !== undefined && descricao.trim() === '') {
      descricao = undefined;
    }

    if (urlOAB !== undefined && urlOAB.trim() === '') {
      urlOAB = undefined;
    }

    const urlImagem = req.file.path.replace('../', '/');

    MembroSchema.create({ nome, descricao, urlImagem, urlOAB })
      .then((membro) => {
        membro.urlImagem = resolveUrls(membro.urlImagem);
        return res.send(membro);
      })
      .catch((erro) => {
        DeletePhoto(req.file.path);
        console.error(erro, 'Erro ao criar Membro');
        return res.status(500).send({ erro: messages.INTERNAL_ERROR });
      });
  },
);

router.put(
  '/:id',
  [AuthMiddleware({ nivel: 'admin' }), Multer.single('urlImagem'), resizeImage],
  (req, res) => {
    const { nome } = req.body;
    var { urlOAB, descricao } = req.body;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (req.file) {
        DeletePhoto(req.file.path);
      }
      return res.status(400).send({ erro: messages.WRONG_ID });
    }

    if (!nome || !descricao || !urlOAB) {
      if (req.file) {
        DeletePhoto(req.file.path);
      }
      console.log(req.body);
      return res.status(400).send({ erro: messages.MISS_INFO });
    }

    MembroSchema.findById(id)
      .then((membro) => {
        if (membro) {
          var urlImagem;
          var urlAntiga;
          if (req.file) {
            urlImagem = req.file.path.replace('../', '/');
            urlAntiga = membro.urlImagem;
          } else {
            urlImagem = membro.urlImagem;
          }

          membro.nome = nome;
          membro.descricao = descricao;
          membro.urlOAB = urlOAB;
          membro.urlImagem = urlImagem;

          membro
            .save()
            .then((resultado) => {
              if (urlAntiga) {
                DeletePhoto(`..${urlAntiga}`);
              }
              resultado.urlImagem = resolveUrls(membro.urlImagem);
              return res.send(resultado);
            })
            .catch((erro) => {
              if (req.file) {
                DeletePhoto(req.file.path);
              }
              console.error(erro, 'Erro ao salvar dados do membro');
              return res.status(500).send({ erro: messages.INTERNAL_ERROR });
            });
        } else {
          return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
        }
      })
      .catch((erro) => {
        if (req.file) {
          DeletePhoto(req.file.path);
        }
        console.error(erro, 'Erro ao editar membro');
        return res.status(500).send({ erro: messages.INTERNAL_ERROR });
      });
  },
);

router.delete('/:id', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).send({ erro: messages.WRONG_ID });
  }

  MembroSchema.findByIdAndRemove(id)
    .then((membro) => {
      if (membro) {
        DeletePhoto(`..${membro.urlImagem}`);
        membro.urlImagem = resolveUrls(membro.urlImagem);
        return res.send(membro);
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((erro) => {
      console.error(erro, 'Erro ao deletar membro');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

export default router;

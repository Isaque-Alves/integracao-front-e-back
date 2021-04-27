import { Router } from 'express';
import Multer from '@/app/middlewares/Multer';
import AuthMiddleware from '@/app/middlewares/Auth';
import resizeImage from '@/app/middlewares/resizeImage';
import fs from 'fs';
import path from 'path';
import fileConfig from '@/config/files';
import resolveUrls from '@/utils/resolveUrls';

const router = new Router();

router.get('/:path/:fileName', (req, res) => {
  var filePath =
    req.params.path === 'emails'
      ? path.resolve(`./src/resources/mail/auth/images/${req.params.fileName}`)
      : path.resolve(
          `${fileConfig.uploadsPath}/${req.params.path}/${req.params.fileName}`,
        );

  fs.exists(filePath, (exists) => {
    if (exists) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).send({
        erro: 'Arquivo não encontrado',
      });
    }
  });
});

router.post(
  '/images',
  [AuthMiddleware({ nivel: 'admin' }), Multer.single('image'), resizeImage],
  (req, res) => {
    if (req.file) {
      return res.send({
        url: resolveUrls(req.file.path),
      });
    } else {
      return res.status(400).send({ erro: 'Imagem não enviada' });
    }
  },
);

export default router;

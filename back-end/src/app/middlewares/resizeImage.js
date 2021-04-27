import sharp from 'sharp';
import fs from 'fs';
import { messages } from '@/utils/errors/ErrorMessages';

export default (req, res, next) => {
  if (!req.file) {
    next(); //A imagem não será tratada. Algumas vezes esse middleware é chamado em rotas
    return; //em que não é obrigatória a imagem
  }

  const filePath = req.file.path;

  //Trecho pra verificar se a largura da imagem é maior que 500px
  sharp(filePath)
    .metadata()
    .then(({ width }) => {
      if (width > 500) {
        //Se for maior, a imagem será redimensionada para 500px
        sharp(filePath)
          .resize({ width: 500 })
          .toBuffer()
          .then((buffer) => {
            if (fs.existsSync(filePath)) {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(err, 'Não foi possível redimensionar a imagem');
                } else {
                  fs.writeFileSync(filePath, buffer);
                }
              });
            }
          })
          .catch((err) => {
            console.error(err);
            next(); //Se houver um erro aqui, a requisição deverá prosseguir normalmente
          });
      }
      next();
    })
    .catch((err) => {
      console.error(err);
      next(); //Se houver um erro aqui, a requisição deverá prosseguir normalmente
    });
};

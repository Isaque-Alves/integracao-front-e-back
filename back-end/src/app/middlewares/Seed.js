import About from '@/app/schemas/Sobre';
import { messages } from '../../utils/errors/ErrorMessages';

const AboutMiddleware = (req, res, next) => {
  About.findOne()
    .then(async (about) => {
      if (!about) {
        const text =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at erat semper, volutpat felis sed, viverra massa. Donec lectus elit, sagittis nec ex sed, varius vestibulum diam. Suspendisse potenti. Nunc commodo non enim ac tempor. Ut pulvinar tellus a dui varius tincidunt.',
          imageUrl = 'noData';

        await About.create({ text, imageUrl })
          .then((createdSection) => {
            if (createdSection) {
              next();
            }
          })
          .catch((err) => {
            console.error('Erro ao criar a instância da seção sobre', err);

            return res.status(500).send({
              erro: messages.INTERNAL_ERROR,
            });
          });
      } else {
        next();
      }
    })
    .catch((err) => {
      console.error('Erro ao listar os dados da seção sobre', err);

      return res.status(500).send({
        erro: messages.INTERNAL_ERROR,
      });
    });
};

export { AboutMiddleware };

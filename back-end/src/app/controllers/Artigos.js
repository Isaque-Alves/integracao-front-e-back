import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import Article from '@/app/schemas/Artigo';
import AuthMiddleware from '@/app/middlewares/Auth';
import Slugify from '@/utils/Slugify';
import { messages } from '@/utils/errors/ErrorMessages';
import calcReadTime from '@/utils/ReadTime';

const checkData = (title, author, text) => {
  if (!title) return 'O título é obrigatório';

  if (!author) return 'O autor é obrigatório';

  if (!text) return 'O texto é obrigatório';

  return null;
};

const router = new Router();

router.get('/', (req, res) => {
  const { perPage, page } = req.query;

  const customLabels = {
    totalDocs: 'articlesCount',
    docs: 'articles',
    limit: 'articlesPerPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    pagingCounter: false,
  };

  const options = {
    page,
    limit: perPage,
    sort: { date: -1 },
    customLabels,
  };

  Article.paginate({}, options)
    .then((articles) => {
      if (articles) {
        return res.status(200).send(articles);
      } else {
        return res.status(404).send({ erro: 'Nenhum artigo foi encontrado' });
      }
    })
    .catch((err) => {
      console.error('Erro ao listar os artigos cadastrados', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.get('/destaques', (req, res) => {
  Article.find({ spotlight: true })
    .then((articles) => {
      return res.status(200).send(articles);
    })
    .catch((err) => {
      console.error('Erro ao listar os artigos destacados', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.get('/busca', (req, res) => {
  const { text, perPage, page } = req.query;

  if (!perPage || !page) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }

  const customLabels = {
    totalDocs: 'articlesCount',
    docs: 'articles',
    limit: 'articlesPerPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    pagingCounter: false,
  };

  const options = {
    page,
    limit: perPage,
    sort: { date: -1 },
    customLabels,
  };

  Article.paginate(
    text
      ? {
          $or: [
            { title: { $regex: text, $options: 'i' } },
            { author: { $regex: text, $options: 'i' } },
            { text: { $regex: text, $options: 'i' } },
          ],
        }
      : null,
    options,
  )
    .then((articles) => {
      return res.status(200).send(articles);
    })
    .catch((err) => {
      console.error('Erro ao listar os artigos cadastrados', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  Article.findOne({ slug })
    .then((article) => {
      if (article) {
        return res.status(200).send(article);
      } else {
        return res.status(404).send({ erro: 'Esse artigo não foi encontrado' });
      }
    })
    .catch((err) => {
      console.error('Erro ao listar os artigos cadastrados', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post('/', AuthMiddleware({ nivel: 'admin' }), async (req, res) => {
  const { title, author, text } = req.body;

  const error = checkData(title, author, text);

  if (error) {
    return res.status(400).send({ erro: error });
  }

  const article = await Article.findOne({ slug: Slugify(title) });

  if (article) {
    return res
      .status(400)
      .send({ erro: 'Já existe um artigo cadastrado com esse título' });
  }

  Article.create({ title, author, text })
    .then(() => {
      return res.status(200).send({ mensagem: 'Artigo criado com sucesso' });
    })
    .catch((err) => {
      console.error('Erro ao criar um artigo', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.put('/atualizar', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.put(
  '/atualizar/:id',
  AuthMiddleware({ nivel: 'admin' }),
  async (req, res) => {
    const { id } = req.params;
    const { title, author, text } = req.body;

    if (!isValidObjectId(id))
      return res.status(400).send({ erro: messages.WRONG_ID });

    const error = checkData(title, author, text);

    if (error) {
      return res.status(400).send({ erro: error });
    }

    const slug = Slugify(title);

    const article = await Article.findOne({ slug });

    if (article) {
      if (article._id != id) {
        return res
          .status(400)
          .send({ erro: 'Já existe um artigo cadastrado com esse título' });
      }
    }

    const readTime = calcReadTime(text);

    Article.findByIdAndUpdate(
      id,
      { slug, title, author, text, readTime },
      { new: true },
    )
      .then((article) => {
        if (article) {
          return res.status(200).send({ mensagem: messages.UPDATE_SUCCESS });
        } else {
          return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
        }
      })
      .catch((err) => {
        console.error('Erro ao editar esse artigo', err);

        return res.status(500).send({ erro: messages.INTERNAL_ERROR });
      });
  },
);

router.put(
  '/destaques',
  AuthMiddleware({ nivel: 'admin' }),
  async (req, res) => {
    const { spotlightIds } = req.body;

    if (spotlightIds.length !== 3) {
      return res
        .status(400)
        .send({ erro: 'Número de artigos destacados é diferente de 3' });
    }

    const falseArticles = await Article.updateMany({ spotlight: false });

    if (!falseArticles) {
      console.error(
        'Erro ao setar como "false" todos os artigos cadastrados',
        err,
      );

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    }

    await Article.updateMany(
      { _id: { $in: spotlightIds } },
      { $set: { spotlight: true } },
    )
      .then((articles) => {
        if (articles) {
          return res
            .status(200)
            .send({ mensagem: 'Destaques atualizados com sucesso' });
        }
      })
      .catch((err) => {
        console.error('Erro interno ao atualizar os artigos destaques', err);

        return res.status(500).send({ erro: messages.INTERNAL_ERROR });
      });
  },
);

router.delete('/', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  return res.status(400).send({ erro: messages.MISS_ID });
});

router.delete('/:id', AuthMiddleware({ nivel: 'admin' }), (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).send({ erro: messages.WRONG_ID });

  Article.findByIdAndRemove(id)
    .then((article) => {
      if (article) {
        return res.status(200).send({ mensagem: messages.DELETE_SUCCESS });
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((err) => {
      console.error('Erro ao remover um artigo', err);

      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

export default router;

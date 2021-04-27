import UsuarioSchema from '@/app/schemas/Usuario';
import { Router } from 'express';
import AuthMiddleware from '@/app/middlewares/Auth';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '@/utils/sendEmail';
import { messages } from '@/utils/errors/ErrorMessages';

const router = new Router();

function gerarToken(dadosUsuario) {
  return jwt.sign(dadosUsuario, authConfig.secret, { expiresIn: '7d' });
}

function tratarNome(nome) {
  var nomes = nome.split(' ');

  var retorno = '';

  nomes.forEach((palavra) => {
    retorno +=
      palavra.length > 3
        ? palavra[0].toUpperCase() + palavra.slice(1).toLowerCase() + ' '
        : palavra.toLowerCase() + ' ';
  });

  return retorno.trim();
}

router.post('/cadastrar', async (req, res) => {
  var { nome, documento, senha, tokenRecuperacao } = req.body;

  if (!nome || !documento || !senha || !tokenRecuperacao) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }

  nome = tratarNome(nome);

  if (
    !/(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/.test(
      documento,
    )
  ) {
    return res.status(400).send({ erro: 'CPF/CNPJ inválido' });
  }

  if (await UsuarioSchema.findOne({ documento })) {
    return res.status(400).send({ erro: 'CPF/CNPJ já cadastrado' });
  }

  await UsuarioSchema.findOne({ tokenRecuperacao })
    .select('+expiracaoTokenRecuperacao +tokenRecuperacao +senha +nivel')
    .exec()
    .then(async (usuario) => {
      if (usuario) {
        if (usuario.documento !== 'undefined') {
          return res.status(400).send({ erro: 'Usuário já cadastrado' });
        }
        if (usuario.expiracaoTokenRecuperacao < Date.now()) {
          return res.status(400).send({ erro: 'Cadastro expirado' });
        }
        usuario.nome = nome;
        usuario.documento = documento;

        usuario.senha = await bcrypt.hash(senha, 10).catch((erro) => {
          console.error(erro, 'Erro ao criptografar a senha');
        });
        if (!usuario.senha) {
          return res.status(500).send({ erro: messages.INTERNAL_ERROR });
        }
        usuario.expiracaoTokenRecuperacao = undefined;
        usuario.tokenRecuperacao = undefined;
        usuario
          .save()
          .then((resultado) => {
            return res.send({
              token: gerarToken({ uid: resultado._id, nivel: resultado.nivel }),
              expiracao: '7d',
            });
          })
          .catch((erro) => {
            console.error(erro, 'Erro ao salvar usuário');
            return res.status(500).send({ erro: messages.INTERNAL_ERROR });
          });
      } else {
        return res.status(400).send({ erro: 'Token de cadastro inválido' });
      }
    });
});

router.post('/login', (req, res) => {
  var { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }

  email = email.toLowerCase();

  UsuarioSchema.findOne({ email })
    .select('+senha +nivel')
    .then((usuario) => {
      if (usuario) {
        bcrypt
          .compare(senha, usuario.senha)
          .then((resultado) => {
            if (!resultado)
              return res
                .status(400)
                .send({ erro: 'Email ou senha incorretos' });
            else
              return res.send({
                token: gerarToken({ uid: usuario._id, nivel: usuario.nivel }),
                expiracao: '7d',
              });
          })
          .catch((erro) => {
            console.error(erro, 'Erro ao comparar as senhas');
            return res.status(500).send({ erro: messages.INTERNAL_ERROR });
          });
      } else {
        return res.status(400).send({ erro: 'Email ou senha incorretos' });
      }
    })
    .catch((erro) => {
      console.error(erro, 'Erro ao buscar email no banco de dados');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post('/esqueceu-senha', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }
  const expiracaoTokenRecuperacao = new Date();
  expiracaoTokenRecuperacao.setHours(new Date().getHours() + 165);
  const tokenRecuperacao = crypto.randomBytes(20).toString('hex');

  UsuarioSchema.findOne({ email })
    .select('+tokenRecuperacao +expiracaoTokenRecuperacao')
    .exec()
    .then((usuario) => {
      if (usuario) {
        if (usuario.documento === 'undefined') {
          return res.status(400).send({ erro: 'Usuário não cadastrado' });
        }
        usuario.tokenRecuperacao = tokenRecuperacao;
        usuario.expiracaoTokenRecuperacao = expiracaoTokenRecuperacao;
        usuario.save().then(() => {
          console.log({ email, tokenRecuperacao }); //Em desenvolvimento apenas
          sendEmail(
            { tipo: 'alterar senha' },
            email,
            tokenRecuperacao,
            usuario.nome,
          );
          return res.send({
            mensagem: 'Email de recuperação de senha enviado',
          });
        });
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((erro) => {
      console.error(
        erro,
        'Erro ao editar token de recuperação no banco de dados',
      );
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

router.post('/alterar-senha', (req, res) => {
  const { tokenRecuperacao, senha } = req.body;

  if (!tokenRecuperacao || !senha) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }
  UsuarioSchema.findOne({ tokenRecuperacao })
    .select('+senha +expiracaoTokenRecuperacao')
    .exec()
    .then(async (usuario) => {
      if (usuario) {
        if (usuario.documento === 'undefined') {
          return res.status(400).send({ erro: 'Usuário não cadastrado' });
        }
        if (usuario.expiracaoTokenRecuperacao < Date.now()) {
          return res
            .status(400)
            .send({ erro: 'Período para alterar senha expirado' });
        }
        usuario.senha = await bcrypt.hash(senha, 10).catch((erro) => {
          console.error(erro, 'Erro ao criptografar a senha');
        });
        if (!usuario.senha) {
          return res.status(500).send({ erro: messages.INTERNAL_ERROR });
        }
        usuario.expiracaoTokenRecuperacao = undefined;
        usuario.tokenRecuperacao = undefined;
        usuario
          .save()
          .then(() => {
            return res.send({ mensagem: 'Senha alterada com sucesso' });
          })
          .catch((erro) => {
            console.error(erro, 'Erro ao salvar usuário');
            return res.status(500).send({ erro: messages.INTERNAL_ERROR });
          });
      } else {
        return res.status(400).send({ erro: 'Token de Recuperação inválido' });
      }
    });
});

//Para o primeiro cadastro, o Authmiddleware deve ser removido, e o nivel de autorização editado pelo Compass
router.post(
  '/convidar',
  //AuthMiddleware({ nivel: 'admin' }),
  async (req, res) => {
    var { emails } = req.body;

    var erros = 0;

    if (!emails || emails.trim() === '') {
      return res.status(400).send({ erro: messages.MISS_INFO });
    }
    emails = emails.split(';');

    for (var indice in emails) {
      emails[indice] = emails[indice].trim().toLowerCase();

      if (emails[indice] == '') {
        emails.splice(indice);
      } else if (
        emails[indice].indexOf('.') == -1 ||
        emails[indice].indexOf('@') == -1
      ) {
        return res.status(400).send({ erro: 'Email inválido' });
      }
    }

    const usuarios = await UsuarioSchema.find()
      .lean()
      .catch((erro) => {
        console.error(erro, 'Erro ao buscar usuários no BD');
      });

    if (!usuarios) {
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    }
    for (var indice in emails) {
      const expiracaoTokenRecuperacao = new Date();
      expiracaoTokenRecuperacao.setHours(new Date().getHours() + 165);
      const tokenRecuperacao = crypto.randomBytes(20).toString('hex');

      var usuario = usuarios.find(
        (usuarioAtual) => usuarioAtual.email == emails[indice],
      );
      if (usuario) {
        if (usuario.documento !== 'undefined') {
          return res.status(400).send({ erro: 'Usuário já cadastrado' });
        }
        await UsuarioSchema.findByIdAndUpdate(
          usuario._id,
          { tokenRecuperacao, expiracaoTokenRecuperacao },
          { new: true },
        )
          .select('+tokenRecuperacao +expiracaoTokenRecuperacao')
          .then(() => {
            console.log({ email: emails[indice], tokenRecuperacao }); //Em desenvolvimento apenas
            sendEmail({ tipo: 'cadastro' }, emails[indice], tokenRecuperacao);
          })
          .catch((erro) => {
            console.error(
              erro,
              `Erro ao editar usuário de email ${emails[indice]}`,
            );
            erros++;
          });
      } else {
        await UsuarioSchema.create({
          nome: 'undefined',
          documento: 'undefined',
          email: emails[indice],
          senha: 'undefined',
          tokenRecuperacao: tokenRecuperacao,
          expiracaoTokenRecuperacao: expiracaoTokenRecuperacao,
        })
          .then(() => {
            console.log({ email: emails[indice], tokenRecuperacao }); //Em desenvolvimento apenas
            sendEmail({ tipo: 'cadastro' }, emails[indice], tokenRecuperacao);
          })
          .catch((erro) => {
            console.error(
              erro,
              `Erro ao criar usuário com email ${emails[indice]}`,
            );
            erros++;
          });
      }
    }

    if (erros == emails.length) {
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    } else {
      return res.send({ mensagem: 'Emails enviados com sucesso' });
    }
  },
);

router.get('/validacao', (req, res) => {
  const tokenRecuperacao = req.query.token_recuperacao;

  if (!tokenRecuperacao) {
    return res.status(400).send({ erro: messages.MISS_INFO });
  }

  UsuarioSchema.findOne({ tokenRecuperacao })
    .select('+expiracaoTokenRecuperacao')
    .exec()
    .then((resultado) => {
      if (resultado) {
        if (resultado.expiracaoTokenRecuperacao > Date.now()) {
          return res.send({ email: resultado.email });
        } else {
          return res.status(400).send({ erro: 'O prazo expirou' });
        }
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    });
});

router.get('/dados', AuthMiddleware({ nivel: 'usuario' }), (req, res) => {
  UsuarioSchema.findOne({ _id: req.uid })
    .then((resultado) => {
      if (resultado) {
        return res.send(resultado);
      } else {
        return res.status(404).send({ erro: messages.INSTANCE_NOT_FOUND });
      }
    })
    .catch((erro) => {
      console.error(erro, 'Erro ao obter dados do usuário');
      return res.status(500).send({ erro: messages.INTERNAL_ERROR });
    });
});

export default router;

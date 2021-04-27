import jwt from 'jsonwebtoken';
import authConfig from '@/config/auth';

export default (opcoes) => {
  return (req, res, next) => {
    if (
      !opcoes ||
      !opcoes.nivel ||
      (opcoes.nivel != 'admin' && opcoes.nivel != 'usuario')
    ) {
      console.error(
        'O parâmetro opcoes não foi inserido corretamente no middleware',
      );
      return res.status(500).send({ erro: 'Erro interno do servidor' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .send({ erro: 'É obrigatório o token de autenticação' });
    }
    const token = authHeader.split(' ')[1];

    if (
      !authHeader ||
      authHeader.search('Bearer') == -1 ||
      token === undefined ||
      token.trim() == ''
    ) {
      return res
        .status(401)
        .send({ erro: 'É obrigatório o token de autenticação' });
    }
    jwt.verify(token, authConfig.secret, (erro, decodificado) => {
      if (erro) {
        return res.status(401).send({ erro: 'Token de autenticação inválido' });
      } else {
        req.uid = decodificado.uid;
        req.nivel = decodificado.nivel;
        if (opcoes.nivel == 'admin') {
          if (decodificado.nivel == 'admin') return next();
          else {
            return res
              .status(403)
              .send({ erro: 'Não autorizado a fazer essa ação' });
          }
        } else {
          return next();
        }
      }
    });
  };
};

import Api from "./Api";

const login = (dados) => {
  return Api().post("/autenticacao/login", dados);
};

export { login };

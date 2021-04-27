import Api from "./Api";

const getMembros = () => {
  return Api().get("/membros");
};

const postMembro = (dados) => {
  return Api().post("/membros/", dados, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${dados._boundary}`,
    },
  });
};

const putMembro = (id, dados) => {
  return Api().put(`/membros/${id}`, dados);
};

const deleteMembro = (id) => {
  return Api().delete(`/membros/${id}`);
};

export { getMembros, postMembro, putMembro, deleteMembro };

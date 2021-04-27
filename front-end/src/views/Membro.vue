<template>
  <b-container>
    <b-form-input class="mt-2" v-model="dados.nome"> </b-form-input>
    <b-form-input class="mt-2" v-model="dados.descricao"> </b-form-input>
    <b-form-input class="mt-2" v-model="dados.urlOAB"> </b-form-input>
    <b-form-file class="mt-2" v-model="dados.urlImagem"> </b-form-file>
    <b-button class="mt-5" @click="adicionar">ADICIONAR MEMBRO</b-button>
  </b-container>
</template>

<script>
import { postMembro } from "@/services/api/membros";

export default {
  data() {
    return {
      dados: {
        nome: "",
        descricao: "",
        urlOAB: "",
        urlImagem: null,
      },
    };
  },
  methods: {
    adicionar() {
      let membro = new FormData();
      membro.append("nome", this.dados.nome);
      membro.append("descricao", this.dados.descricao);
      membro.append("urlOAB", this.dados.urlOAB);
      membro.append("urlImagem", this.dados.urlImagem);

      postMembro(membro)
        .then((res) => {
          console.log(res.data);
          alert("Membro Criado");
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

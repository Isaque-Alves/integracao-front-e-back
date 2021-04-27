<template>
  <div class="home">
    <b-table @row-clicked="abrirModal" :items="itens"></b-table>
    <b-modal id="modal-editar">
      <b-form-input class="mt-2" v-model="dados.nome"> </b-form-input>
      <b-form-input class="mt-2" v-model="dados.descricao"> </b-form-input>
      <b-form-input class="mt-2" v-model="dados.urlOAB"> </b-form-input>
      <b-form-file class="mt-2" v-model="imagem"> </b-form-file>
      <b-button class="mt-5" @click="submit">EDITAR MEMBRO</b-button>
      <b-button class="mt-5" @click="deletar">EDITAR MEMBRO</b-button>
    </b-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import { getMembros, putMembro, deleteMembro } from "@/services/api/membros";

export default {
  name: "Home",
  components: {},
  data() {
    return {
      itens: [],
      dados: {
        id: "",
        nome: "",
        descricao: "",
        urlOAB: "",
        urlImagem: null,
      },
      imagem: null,
    };
  },
  mounted() {
    getMembros()
      .then((res) => {
        this.itens = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    abrirModal(item) {
      console.log("ENtrou");
      this.dados = item;
      this.$bvModal.show("modal-editar");
    },
    submit() {
      let data = new FormData();
      data.append("nome", this.dados.nome);
      data.append("descricao", this.dados.descricao);
      data.append("urlOAB", this.dados.urlOAB);
      if (this.imagem) {
        data.append("urlImagem", this.dados.imagem);
      }

      putMembro(this.dados._id, data)
        .then((res) => {
          alert("EDITADO");
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deletar() {
      deleteMembro(this.dados._id)
        .then(() => {
          alert("DELETADO");
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

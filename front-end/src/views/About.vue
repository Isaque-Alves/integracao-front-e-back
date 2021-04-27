<template>
  <div class="about">
    <b-container>
      <b-form-input v-model="dados.email"> </b-form-input>
      <b-form-input v-model="dados.senha"> </b-form-input>
      <b-button class="mt-5" @click="logar">LOGAR</b-button>
    </b-container>
  </div>
</template>

<script>
import { login } from "@/services/api/auth";
import { setCookie } from "@/utils/cookie";

export default {
  name: "Login",
  data() {
    return {
      dados: {
        email: "",
        senha: "",
      },
    };
  },
  methods: {
    logar() {
      login(this.dados).then((res) => {
        console.log(res.data);
        setCookie("token", res.data.token, res.data.expiracao);
        alert("Logado");
      });
    },
  },
};
</script>

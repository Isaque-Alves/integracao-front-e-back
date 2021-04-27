import Mailer from '@/modules/Mailer';
import urls from '@/config/urls';
import ContactSchema from '@/app/schemas/Contato.js';

const socialMediaTemplate = `<td
style="
  word-break: break-word;
  vertical-align: top;
  padding-bottom: 0;
  padding-right: 2.5px;
  padding-left: 2.5px;
"
valign="top"
>
<a
  href="{{link}}"
  target="_blank"
  ><img
    height="32"
    src="{{imageLink}}"
    style="
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
      height: auto;
      border: 0;
      display: block;
    "
    title="{{title}}"
    width="32"
/></a>
</td>`;

async function generateFooter() {
  const contact = await ContactSchema.findOne();

  var footer = '';
  const imageLink = `${urls.uploads}/uploads/emails`;
  if (contact && contact.socialMedia) {
    contact.socialMedia.forEach((socialMedia) => {
      footer += socialMediaTemplate
        .replace('{{link}}', socialMedia.url)
        .replace('{{title}}', socialMedia.type)
        .replace('{{imageLink}}', `${imageLink}/${socialMedia.iconName}.png`);
    });
  }

  return footer;
}

export default async (opcoes, email, tokenRecuperacao, nome) => {
  var context = {
    footer: await generateFooter(),
    logo: `${urls.uploads}/uploads/emails/img_logo.png`,
  };
  var template;
  var subject;

  if (opcoes.tipo == 'cadastro') {
    template = 'auth/cadastro';
    subject = 'Convite para participar da área do usuário';
    context.url = `${urls.front}/cadastro/${tokenRecuperacao}`;
  } else if (opcoes.tipo == 'alterar senha') {
    template = 'auth/alterar_senha';
    subject = 'Recuperação de senha';
    context.url = `${urls.front}/recuperarsenha/${tokenRecuperacao}`;
    context.nome = nome;
  }

  Mailer.sendMail(
    {
      to: email,
      from:
        'Daniel Marçal Advogados Associados <danielmarcal@compjunior.com.br>',
      template: template,
      context: context,
      subject: subject,
    },
    (erro) => {
      if (erro) {
        console.error(erro, `Erro ao enviar e-mail para ${email}`);
      }
    },
  );
};

const Discord = require("discord.js");

const sendAnswer = (message, answer) => {
  message.channel.send(answer);
  /* if (!answer.images || answer.images.length === 0) {
    message.channel.send(answer.title);
    return;
  }

  const image = answer.images[parseInt(Math.random() * answer.images.length)];
  const embed = new Discord.EmbedBuilder()
    .setTitle(answer.title)
    .setImage(image);
  message.channel.send({ embeds: [embed] }); */
};

module.exports = { sendAnswer };

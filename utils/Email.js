const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.firstname;
    this.url = url;
    this.from = `Kit Store <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'sendgrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  async send(template, subject, order) {
    const html = pug.renderFile(
      `${__dirname}/email/${template}.pug`,
      {
        firstname: this.firstname,
        subject,
        url: this.url,
        total: order ? order.amount : '',
        status: order ? order.status : '',
        id: order ? order.transactionid : '',
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Royal Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Forgot your password?');
  }
  async sendPasswordChanged() {
    console.log('password changed called');
    await this.send(
      'passwordChanged',
      'You Just Changed Your Password'
    );
  }

  async sendNewOrder(order) {
    await this.send('newOrder', 'Thank you for your order!', order);
  }
};

// const sendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: 'sendgrid',
//     auth: {
//       user: process.env.SENDGRID_USERNAME,
//       pass: process.env.SENDGRID_PASSWORD,
//     },
//   });

//   const html = pug.renderFile(
//     `${__dirname}/email/passwordReset.pug`,
//     {
//       firstname: options.user.firstname,
//       subject: options.subject,
//       url: options.url,
//     }
//   );

//   const mailOptions = {
//     from: `Kit Store <bigdre@drenathan.com>`,
//     to: options.user.email,
//     subject: options.subject,
//     html,
//     text: htmlToText.fromString(html),
//   };
//   await transporter.sendMail(mailOptions);
// };

// async function  sendOrderEmail(order, template, subject) {
//     const html = pug.renderFile(
//       `${__dirname}/email/${template}.pug`,
//       {
//         firstname: this.firstname,
//         subject,
//         url: this.url,
//         total: order.amount,
//         status: order.status,
//         id: order.transactionid,
//       }
//     );
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html),
//     };

//     await this.newTransport().sendMail(mailOptions);
//   }

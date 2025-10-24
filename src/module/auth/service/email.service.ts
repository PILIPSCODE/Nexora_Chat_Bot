import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as nodemailer from 'nodemailer';
import { EmailConfig } from 'src/module/model/user.model';
import { Logger } from 'winston';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}
  createTransporter() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    return transporter;
  }

  async sendEmail(request: EmailConfig) {
    const transporter = this.createTransporter();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      subject: request.subject,
      to: request.recipients,
      text: request.text,
      html: request.html,
    };

    try {
      await transporter.sendMail(options);
      this.logger.info('Email Sent Successfuly!!');
    } catch (error) {
      this.logger.info('Error Sending Email', error);
    }
  }

  generateOtp() {
    const otpLifetime = 5 * 60 * 1000;
    const codeOtp = String(Math.floor(100000 + Math.random() * 900000));

    return {
      codeOtp: codeOtp,
      expiredAt: new Date(Date.now() + otpLifetime),
    };
  }

  html = (VerificationCode) => {
    return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OTP Verification</title>
<style>
/* General reset */
body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
img{ -ms-interpolation-mode:bicubic; }
img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; font-size:inherit !important; }


/* Layout */
body{ margin:0; padding:0; width:100% !important; background-color:#f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
.wrapper{ width:100%; table-layout:fixed; background-color:#f4f6f8; padding-bottom:40px; }
.main{ background-color:#ffffff; margin:0 auto; width:100%; max-width:600px; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(23,43,77,0.08); }


/* Header */
.header{ background: linear-gradient(90deg,#4F46E5 0%, #06B6D4 100%); color:#fff; padding:24px 28px; display:flex; align-items:center; gap:16px; }
.logo{ height:40px; width:auto; }
.company-name{ font-weight:700; font-size:18px; letter-spacing:0.2px; }


/* Content */
.content{ padding:30px 28px 24px 28px; color:#0f172a; }
.preheader{ color:#94a3b8; font-size:13px; margin-bottom:18px; }
.title{ font-size:20px; font-weight:700; margin:0 0 12px 0; }
.lead{ font-size:15px; margin:0 0 18px 0; color:#334155; }


.otp-box{ display:flex; justify-content:center; align-items:center; gap:14px; padding:18px; background:#f8fafc; border-radius:10px; margin:18px 0; }
.otp-code{ font-size:28px; letter-spacing:6px; font-weight:800; color:#0f172a; }
.small{ font-size:13px; color:#64748b; }


.btn-wrap{ text-align:center; margin:14px 0 6px 0; }
.cta{ display:inline-block; padding:12px 22px; border-radius:10px; background:#0ea5a4; color:#fff; text-decoration:none; font-weight:700; }


.note{ font-size:13px; color:#475569; line-height:1.45; margin-top:18px; }


/* Footer */
.footer{ padding:18px 28px; font-size:13px; color:#94a3b8; text-align:center; }
.footer a{ color:#8b5cf6; text-decoration:none; }


/* Responsive */
@media screen and (max-width:480px){
.header{ padding:18px; }
.content{ padding:20px; }
.otp-code{ font-size:24px; letter-spacing:5px; }
}
</style>
</head>
<body>
<center class="wrapper">
<table class="main" role="presentation" cellpadding="0" cellspacing="0" width="100%" align="center">
<tr>
<td class="header">
<!-- Logo (replace with your logo url) -->
<img src="https://i.ibb.co.com/rfRfv88s/logos.png" alt="{{COMPANY_NAME}}" class="logo" style="display:block">
<div style="flex:1">
<div class="company-name">Pibots</div>
<div style="font-size:12px; color:rgba(255,255,255,0.9); margin-top:3px;">Keamanan & Otentikasi ChatBot</div>
</div>
</td>
</tr>


<tr>
<td class="content">
<div class="preheader">Kode OTP Anda untuk masuk ke akun — jangan berikan kepada siapapun.</div>


<h1 class="title">Kode OTP Anda</h1>
<p class="lead">Halo, gunakan kode berikut untuk menyelesaikan proses masuk atau verifikasi Anda. Kode hanya berlaku selama <strong>5 menit</strong>.</p>


<div class="otp-box" role="article" aria-label="Kode OTP">
<div class="otp-code" aria-live="polite">${VerificationCode}</div>
</div>


<div class="btn-wrap">
<!-- Optional button (link to verify) -->
<a href="{{VERIFY_LINK}}" class="cta">Verifikasi Sekarang</a>
</div>


<p class="note">Jika Anda tidak melakukan permintaan ini, Anda dapat mengabaikan email ini. Untuk keamanan tambahan, jangan bagikan kode OTP Anda kepada siapapun, termasuk orang yang mengaku dari tim Pibots.</p>
</html>`;
  };
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendTicketNotification(to: string, subject: string, text: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { ok: true, mode: 'dry-run', message: 'SMTP não configurado. E-mail simulado.' };
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'Help Desk <helpdesk@local>',
      to,
      subject,
      text,
    });

    return { ok: true };
  }
}

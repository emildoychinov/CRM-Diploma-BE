import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailDto } from './dto/mail.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendStatusUpdate(mailDto: MailDto) {
    await this.mailerService.sendMail({
      to: mailDto.receiver,
      subject: mailDto.title,
      template: './status',
      context: {
        name: mailDto.name ?? 'user',
        client: mailDto.client,
        reason: mailDto?.reason,
        duration: mailDto?.duration,
        status: mailDto.status,
      },
    });
  }

  async sendAccountDeactivationUpdate(mailDto: MailDto) {
    await this.mailerService.sendMail({
      to: mailDto.receiver,
      subject: 'Account Deletion Notification',
      template: './deactivation',
      context: {
        name: mailDto.name ?? 'user',
        client: mailDto.client,
      },
    });
  }
}

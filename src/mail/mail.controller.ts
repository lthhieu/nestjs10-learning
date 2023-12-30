import { Controller, Get } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('mail')
export class MailController {
  constructor(private readonly mailerService: MailerService) { }
  @Get()
  @Public()
  @ResponseMessage('Test mail')
  async example() {
    await this.mailerService
      .sendMail({
        to: 'vtinhoc91@gmail.com', // list of receivers
        from: 'Support hieu <hieu@gmail.com>', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        template: "job"
      })
  }
}

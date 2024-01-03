import { Controller, Get } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';

@Controller('mail')
export class MailController {
  constructor(private readonly mailerService: MailerService,
    @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }
  @Get()
  @Public()
  @ResponseMessage('Test mail')
  async example() {

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
      //todo
      if (jobWithMatchingSkills.length > 0) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " VND",
            skills: item.skills
          }
        })
        await this.mailerService
          .sendMail({
            to: 'vtinhoc91@gmail.com', // list of receivers
            from: 'Support hieu <hieu@gmail.com>', // sender address
            subject: 'Testing Nest MailerModule ✔', // Subject line
            template: "job",
            context: {
              receiver: subs.name,
              jobs
            }
          })
      }
      //build template
    }


  }
}

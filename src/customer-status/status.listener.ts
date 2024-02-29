import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Job } from "bull";
import Redis from "ioredis";
import { CustomerService } from "src/customer/customer.service";
import { UpdateCustomerDto } from "src/customer/dto/update-customer.dto";
import { Customer } from "src/customer/entities/customer.entity";
import { AccountStatus } from "src/enums/customer-account-status.enum";
import { MailDto } from "src/mail/dto/mail.dto";
import { MailService } from "src/mail/mail.service";
import { QueueService } from "src/queue/queue.service";


@Injectable()
export class StatusListener {
    constructor(
      @Inject('REDIS') 
      private readonly redis: Redis,
      private queueService: QueueService,
      private customerService: CustomerService,
      private mailService: MailService){
        this.customerService.findAll().then((customers: any) => {
          customers.forEach((customer: any) => {
            const queue = this.queueService.getQueue(`customer.${customer.id}`);
            
            this.queueService.createProcess(queue, 
              `customer.${customer.id}.changeAccountStatusProcess`,
              this.changeAccountStatusProcess.bind(this),
            );

            this.queueService.createProcess(queue, 
              `customer.${customer.id}.sendStatusUpdateMessageProcess`,
              this.sendStatusUpdateMessageProcess.bind(this),
            );

            this.queueService.createProcess(queue, 
              `customer.${customer.id}.deactivationProcess`,
              this.deactivationProcess.bind(this),
              async () => {
                await this.redis.del(`customer.${customer.client.id}.${customer.id}.deactivationJob`);
                Logger.log(`Customer ${customer.id} deleted`); 
              }
            );

          })
        })
        
      }

    async changeAccountStatusProcess(job: Job<{ 
        customer: Customer, 
        account_status: AccountStatus,
        notes?: string;
    }>){
        const {customer, account_status, notes} = job.data;
        try{

            await this.customerService.update(customer.id, {client_id: customer.client.id}, {
                account_status,
                notes: notes ?? ''
            } as UpdateCustomerDto)

            await this.mailService.sendStatusUpdate({
              receiver: customer.email,
              title: 'Account status change',
              name: `${customer?.first_name} ${customer?.last_name}`,
              client: customer.client.name,
              reason: notes ?? '',
              status: account_status 
            } as MailDto)
            Logger.log(`operation ${job.id} of changing account status finished on customer ${customer.id}`)
          
          }catch(error){
            Logger.error(error);
            throw error;
          }
    }

    async deactivationProcess(job: Job<{
      customer: Customer,
      mailDto: MailDto
    }>){
      try{
        const {customer, mailDto} = job.data;
        await this.customerService.removeById(customer.id);
        await this.mailService.sendAccountDeactivationUpdate(mailDto);
      }catch(error){
        Logger.error(error);
        throw error;
      }
    }
    

    async sendStatusUpdateMessageProcess(job: Job<{ mailDto: MailDto }>){
      const {mailDto} = job.data;
      await this.mailService.sendStatusUpdate(mailDto);
    }



    
  
  }
  
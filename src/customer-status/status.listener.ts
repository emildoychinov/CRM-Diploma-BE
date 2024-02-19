import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Job } from "bull";
import Redis from "ioredis";
import { CustomerService } from "src/customer/customer.service";
import { UpdateCustomerDto } from "src/customer/dto/update-customer.dto";
import { Customer } from "src/customer/entities/customer.entity";
import { AccountStatus } from "src/enums/customer-account-status.enum";
import { QueueService } from "src/queue/queue.service";


@Injectable()
export class StatusListener {
    constructor(
      @Inject('REDIS') 
      private readonly redis: Redis,
      private queueService: QueueService,
      private customerService: CustomerService){
        this.customerService.findAll().then((customers: any) => {
          customers.forEach((customer: any) => {
            const queue = this.queueService.getQueue(`customer.${customer.id}.${customer.client.id}`);
            this.queueService.createProcess(queue, 
            `customer.${customer.id}.${customer.client.id}.changeAccountStatusProcess`,
              this.changeAccountStatusProcess.bind(this),
            )
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
            await this.customerService.update(customer.id, customer.client.id, {
                account_status,
                notes: notes ?? ''
            } as UpdateCustomerDto)
            Logger.log(`operation ${job.id} of changing account status finished on customer ${customer.id}`)
        }catch(error){
            Logger.error(error);
            throw error;
        }
    }



    
  
  }
  
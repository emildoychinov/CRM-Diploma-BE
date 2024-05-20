import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService {
  private logger = new Logger(QueueService.name);
  queues: { [key: string]: Bull.Queue } = {};
  opts: any;

  constructor(private readonly configService: ConfigService) {
    let client: any;
    let subscriber: any;
    this.opts = {
      // redisOpts here will contain at least a property of connectionName which will identify the queue based on its name
      createClient: function (type: any, redisOpts: any) {
        switch (type) {
          case 'client':
            if (!client) {
              client = new Redis(
                configService.get<string>(
                  /*'REDIS_DEPLOYMENT_HOST'*/ 'REDIS_HOST',
                ) as string,
                {
                  ...redisOpts,
                  maxRetriesPerRequest: null,
                  enableReadyCheck: false,
                },
              );
            }
            return client;
          case 'subscriber':
            if (!subscriber) {
              subscriber = new Redis(
                configService.get<string>(
                  /*'REDIS_DEPLOYMENT_HOST'*/ 'REDIS_HOST',
                ) as string,
                {
                  ...redisOpts,
                  maxRetriesPerRequest: null,
                  enableReadyCheck: false,
                },
              );
            }
            return subscriber;
          case 'bclient':
            return new Redis(
              configService.get<string>(
                /*'REDIS_DEPLOYMENT_HOST'*/ 'REDIS_HOST',
              ) as string,
              {
                ...redisOpts,
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
              },
            );
          default:
            throw new Error('Unexpected connection type: ');
        }
      },
    };
  }

  getQueue(name: string): Bull.Queue {
    if (this.queues[name]) {
      return this.queues[name];
    }

    this.queues[name] = new Bull(name, this.opts);

    return this.queues[name];
  }

  async add(
    queue: Bull.Queue,
    name: string,
    data: any,
    opts: Bull.JobOptions = {},
  ) {
    if (!queue) {
      return;
    }
    return queue.add(name, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...opts,
    });
  }

  async remove(queue: Bull.Queue, jobID: string) {
    if (queue) {
      const job = await queue.getJob(jobID);
      if (job) {
        await job?.remove();
        return true;
      }
      return false;
    }
    return false;
  }

  createProcess(
    queue: Bull.Queue,
    name: string,
    callback: Function,
    onCompleteCallback?: Function,
  ) {
    if (queue) {
      queue.process(
        name,
        this.processJobWrapper.bind(this, {
          callback,
          name,
          onCompleteCallback,
        }),
      );
    }
  }

  async processJobWrapper(
    data: { callback: Function; onCompleteCallback?: Function; name: string },
    job: Bull.Job,
  ) {
    try {
      await data.callback(job);
      if (data.onCompleteCallback) {
        await data.onCompleteCallback(job);
      }
    } catch (err) {
      this.logger.error(
        `Error in job ${data.name} occurred with args ${JSON.stringify(
          job.data,
        )}\n Error: ${err}`,
        err.stack,
      );
      throw err;
    }
  }
}

import AWS from 'aws-sdk';
import inject from 'pseudo-module'

@Injectable()
export class SomeService {
 constructor(
    @Inject('aws.s3') private s3client: AWS.S3,
  ) {}
}

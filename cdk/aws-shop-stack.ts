import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class AwsShopStack extends cdk.Stack {
  public readonly bucketUrl: string;
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for the website
    const bucket = new s3.Bucket(this, 'AwsShopBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Create CloudFront distribution with S3BucketOrigin
    const distribution = new cloudfront.Distribution(this, 'AwsShopDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Deploy the built React application to S3
    const appBuildPath = path.join(__dirname, '../dist');
    
    new s3deploy.BucketDeployment(this, 'DeployAwsShopApp', {
      sources: [s3deploy.Source.asset(appBuildPath)],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });

    // Store output values
    this.bucketUrl = bucket.bucketWebsiteUrl;
    this.distributionDomainName = distribution.domainName;

    // Stack outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.domainName}`,
      description: 'CloudFront Distribution URL - Use this to access your app',
      exportName: 'AwsShopCloudFrontURL',
    });

    new cdk.CfnOutput(this, 'S3BucketURL', {
      value: bucket.bucketWebsiteUrl,
      description: 'S3 Bucket Website URL (Access Denied - use CloudFront URL instead)',
    });
  }
}


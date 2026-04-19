# React-shop-cloudfront

This is frontend starter project for nodejs-aws mentoring program. It uses the following technologies:

- [Vite](https://vitejs.dev/) as a project bundler
- [React](https://beta.reactjs.org/) as a frontend framework
- [React-router-dom](https://reactrouterdotcom.fly.dev/) as a routing library
- [MUI](https://mui.com/) as a UI framework
- [React-query](https://react-query-v3.tanstack.com/) as a data fetching library
- [Formik](https://formik.org/) as a form library
- [Yup](https://github.com/jquense/yup) as a validation schema
- [Vitest](https://vitest.dev/) as a test runner
- [MSW](https://mswjs.io/) as an API mocking library
- [Eslint](https://eslint.org/) as a code linting tool
- [Prettier](https://prettier.io/) as a code formatting tool
- [TypeScript](https://www.typescriptlang.org/) as a type checking tool

## Available Scripts

### `start`

Starts the project in dev mode with mocked API on local environment.

### `build`

Builds the project for production in `dist` folder.

### `preview`

Starts the project in production mode on local environment.

### `test`, `test:ui`, `test:coverage`

Runs tests in console, in browser or with coverage.

### `lint`, `prettier`

Runs linting and formatting for all files in `src` folder.

### `deploy`

Builds the project and deploys it to AWS S3 with CloudFront CDN distribution. Requires AWS credentials to be configured.

### `deploy:destroy`

Destroys all AWS resources (S3 bucket, CloudFront distribution) created by the deployment.

## Deployment to AWS

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI configured** with your credentials:
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID and Secret Access Key when prompted.

### Deploy Your Application

From the project directory, run:

```bash
npm run deploy
```

This will:

1. Build your React application
2. Create/update AWS resources:
    - Private S3 bucket
    - CloudFront distribution for CDN
    - Origin Access Control for secure S3 access
3. Upload your app to S3
4. Invalidate CloudFront cache
5. Output your deployment URL

### Access Your Application

After deployment completes, look for the output:

```
CloudFrontURL = https://d385u818c8s4y6.cloudfront.net
```

**Use this CloudFront URL to access your application.**

Currently deployed at: **[CloudFront URL will be provided after deployment]**

### Cleanup

To delete all AWS resources:

```bash
npm run deploy:destroy
```


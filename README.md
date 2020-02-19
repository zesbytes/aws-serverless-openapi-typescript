# AWS Serverless Framework Example - using separate openApi spec for Gateway definition

- uses serverless-webpack plugin to minimize deployment size per lambda, including tree shaking
- demonstrates use of AWS layers for common dependency inclusion
- uses serverless-pseudo-parameters plugin so CloudFormation variables not interpreted as serverless variables

## Technologies

- serverless framework
- AWS lambda
- typescript
- webpack
- nodejs

## Steps used to create initial project

Create empty project in github

```shell_session
npm install -g serverless
mkdir aws-serverless-openapi-typescript
cd aws-serverless-openapi-typescript
sls create -t aws-nodejs-typescript
mv vscode .vscode
sls config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
npm install lodash-es
npm install -D @types/lodash-es
git init .
git commit -m 'initial checkin'
git remote add origin YOUR_GITHUB_URL
git push -u origin master
npm install -D serverless-plugin-layer-manager serverless-pseudo-parameters
npm install -D tsconfig-paths-webpack-plugin [so typescript baseUrl is observed]
npm install -D terser-webpack-plugin [so comments are removed from dependent modules]
```

## Obstacles and Solutions

- added ts-config-paths-webpack-plugin so that typescript baseUrl is observed
- added terser-webpack-plugin in order to override webpacks default behaviour and so that comments of dependent modules are removed. After this change sourceMap files started to include actual source code. Changed webpack devtool value to "nosources-source-map", but is kind of strange how original devtool value of "source-map" didn't include sources. This maybe due to use of serverless-webpack plugin
- no code imported from node_modules was being included at all. Solution was to remove nodeExternals() from being excluded in webpacks externals meaning tree shaking could take place
- Needed to change target in tsconfig from ESNext to ES2018 in order to support elvis operator
- got compilation errors when not using relative paths for local imports. Solution was to set baseUrl in tsconfig.json, however transpiled output still had non relative imports causing javascript errors. Additionally had to add tsconfig-paths-webpack-plugin to webpack so it is aware that transpiling needs to change imports to relative in generated JS output
- javascript library files for importing "source-map-support/register" were not being found. Had to add ".js" to webpacks "resolve.extensions"
- webpack was not performing tree shaking. Module import style must be correct for webpack to process imports. Solution was for tsconfig not to transpile to older versions and set module property to "ES6" and target as "es2018" within tsconfig.
- not defining the http events in serverless yaml prevents serverless generating AWS::IAM::Policy resources for each function. Consequently permission errors occur when attempting to execute endpoints. Instead of creating manually policy resources for each function an appropriate credentials role was added to each x-amazon-apigateway-integration. Unfortunately the role solution does mean additional latency and it is suggested that in order to keep the latency down to use appropriate regional AWS STS.
- Serverless by itself can only reference layer content that pre exists and is the correct path format. The plugin serverless-plugin-layer-manager was included so that node_modules based off a layers package.json file are updated appropriately upon each package/deploy
- the reference to a named layer must start with a capital and end with "LamdbaLayer"

## Outstanding Issues

- openApi errors are not shown when deploying which is misleading and concerning
- event configuration in serverless.yaml gets ignored when defining a separate gateway resource for openApi and serverless deployment console output with regards to endpoints is incorrect
- AWS only supports JSON schema 0.4 therefore using string format "date" within OpenApi is not supported as it was only introduced into JSON schema 0.7
- schema allOf not supported by AWS lambda
- Experienced a bug in AWS UI where no request validator was shown to be selected even though set. After executing the lamdba and revisiting the screen the validator was then shown to be selected
- Cannot add sourcemap support import globally to each file. see progress on https://github.com/serverless-heaven/serverless-webpack/issues/397

## Concerns

- The mix of CloudFormation and Serverless variables adds to complexity
- Using CloudFormation and Serverless variables within the separate OpenApi specification creates undesired co-dependencies
- The lambda function reference identifier being used with the OpenApi specification document is complex and not intuitive
- Extensive CloudFormation configuration within Serverless YAML is less than ideal and starts to defeat some of the purpose for using Serverless in first place
- Use of credential roles rather than policies for lambda resources is undesirable
- Resources deleted from serverless configuration are not removed upon redeployment
- Incorrect serverless deployment console output and having successful deployments when there are OpenApi issues is unsatisfactory. (even if can use AWS to manually import the OpenApi specification to validate it separately)

## Recommendation

Although using the Serverless framework with a separately defined OpenApi specification for ApiGateway configuration is achievable it is not currently recommended.
# :tv: vidcon 

### Getting Started
Clone this repository and use `npm install` to install all dependencies.


### Usage

* From console
 ```console
 user@host:~$ npm run-script run -- --fileName <FileName with extension> --targetExtension <Extension to convert to>
 ```

* To start the Web API
 ```console
 user@host:~$ npm run start
 ```
* For development use hot loader mode with nodemon
```console
user@host:~$ npm run start:watch
```

### AWS integration
The application can be deployed a microservice and works in conjunction with an S3 location from where it pulls video and pushes them back after conversion. To allow the service to connect to the S3 instance the system running the service should be setup with aws credentials. Refer to documentation [here](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html). For ease of use, the service expects default credentials to be used from the credentials file.

### ffmpeg Tool
The service relies on [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) for conversion of the video format. This module expects ffmpeg utility to be installed before usage. 

#### Windows
The service does an ffmpeg setup for Windows OS. 

#### Linux
 users make sure that ffmpeg is installed on the system before starting the service. To install, run the following command
```console
user@host:~$ sudo apt-get install ffmpeg
```
This will install ffmpeg and all other binaries needed for the service to work. 

### Supported Formats
The application can currently convert to HLS and Dash formats.

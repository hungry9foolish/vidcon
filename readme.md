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
The application can be deployed a microservice and works in conjunction with an S3 location from where it pulls video and pushes them back after conversion.

### Supported Formats
The application can currently convert to HLS and Dash formats.

const multer = require('multer');

let myUploader;
let getUrl;

if (process.env.NODE_ENV === 'production') {
  const multerS3 = require('multer-s3');
  const aws = require('aws-sdk');

  const s3 =
    new aws.S3(
      {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    );

myUploader =
  multer(
    {
      storage:
        multerS3(
          {
            s3: s3,
            bucket: process.env.AWS_BUCKET,
            contentType: multerS3.usedmkt,
            acl: 'public-read'
          }
        )
    }
  );

  getUrl = function getUrl (request) {
    return request.file.location;
  }

} else {

  myUploader =
    multer(
      {
        dest: __dirname + '/../public/uploads'
      }
    );

    getUrl = function getUrl(request) {
      return '/uploads/' + request.file.filename;
    };

}

module.exports = {
  uploader: myUploader,
  getUrl: getUrl
}

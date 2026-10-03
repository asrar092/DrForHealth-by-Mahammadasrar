const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a file buffer to S3.
 * Objects remain private by default.
 */
async function uploadToS3(buffer, key, contentType) {
  await s3
    .putObject({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
    .promise();

  return key;
}

/**
 * Generate a short-lived signed URL for a paid eBook PDF.
 * Used only after successful purchase.
 */
function getSignedDownloadUrl(
  key,
  expiresInSeconds = 300
) {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresInSeconds,
    ResponseContentDisposition: 'attachment',
  });
}

/**
 * Generate a short-lived signed URL for viewing
 * a private cover image in the browser.
 */
function getSignedImageUrl(
  key,
  expiresInSeconds = 3600
) {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresInSeconds,
    ResponseContentDisposition: 'inline',
  });
}

/**
 * Generate a short-lived signed URL for
 * viewing the 2-page eBook preview in browser.
 */
function getSignedPreviewUrl(
  key,
  expiresInSeconds = 600
) {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresInSeconds,
    ResponseContentDisposition: 'inline',
    ResponseContentType: 'application/pdf',
  });
}

/**
 * Delete an object from S3.
 */
async function deleteFromS3(key) {
  await s3
    .deleteObject({
      Bucket: BUCKET,
      Key: key,
    })
    .promise();
}

module.exports = {
  s3,
  uploadToS3,
  getSignedDownloadUrl,
  getSignedImageUrl,
  getSignedPreviewUrl,
  deleteFromS3,
  BUCKET,
};
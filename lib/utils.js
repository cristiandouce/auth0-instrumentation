'use strict';

exports.tag = function(key, val) {
  return `${key}:${val}`;
};

exports.processTags = function(tags) {
  if (Array.isArray(tags)) {
    return tags;
  } else if (typeof tags === 'object') {
    const processedTags = [];
    for (let key in tags) {
      processedTags.push(exports.tag(key, tags[key]));
    }
    return processedTags;
  }
  return [];
};

exports.buildKinesisOptions = function (configMap, keepAliveAgent) {
  return {
    accessKeyId: configMap.AWS_ACCESS_KEY_ID,
    secretAccessKey: configMap.AWS_ACCESS_KEY_SECRET,
    streamName: configMap.LOG_TO_KINESIS,
    region: configMap.AWS_KINESIS_REGION || configMap.AWS_REGION,
    getCredentialsFromIAMRole: configMap.AWS_GET_CREDENTIALS_FROM_IAM_ROLE,
    httpOptions: {
      agent: keepAliveAgent('aws-kinesis')
    },
    objectMode: typeof configMap.KINESIS_OBJECT_MODE !== 'undefined' ? configMap.KINESIS_OBJECT_MODE : true,
    buffer: {
      timeout: configMap.KINESIS_TIMEOUT || 5,
      length: configMap.KINESIS_LENGTH || 50,
      isPrioritaryMsg: function (entry) {
        return entry.level >= 40;
      }
    }
  };
};

exports.logFormatter = function(logger) {
  return function captureLog(lvl) {
    return function formatLog() {
      const args = Array.from(arguments);
      if (typeof args[0] === 'string' && typeof args[1] === 'object') {
        const swap = args[0];
        args[0] = args[1];
        args[1] = swap;
      }
      return logger[lvl].apply(logger, args);
    };
  };
};

import pino from 'pino';
import { elasticsearchURL, isProduction } from './config';

const ecsFormat = require('@elastic/ecs-pino-format');
const pinoElastic = require('pino-elasticsearch');
const pinoms = require('pino-multi-stream');

const pinoMultiStream = pinoms.multistream;

const streamToElastic = pinoElastic({
    index: 'nettu-meet',
    consistency: 'one',
    node: elasticsearchURL,
    'es-version': 7,
    'flush-bytes': 1000
  });

let stream = [{ stream: streamToElastic }];

if(!isProduction){
  stream.push({stream: process.stdout});
}

const logger = pino(ecsFormat(), pinoMultiStream(stream));

export {logger};
import pino from 'pino';
import { elasticsearchURL } from './config';

const ecsFormat = require('@elastic/ecs-pino-format');
const pinoElastic = require('pino-elasticsearch');
const pinoms = require('pino-multi-stream');

const pinoMultiStream = pinoms.multistream;

let stream = [{stream: process.stdout}];

if(elasticsearchURL !== null){
  const streamToElastic = pinoElastic({
    index: 'nettu-meet',
    consistency: 'one',
    node: elasticsearchURL,
    'es-version': 7,
    'flush-bytes': 1000
  });

  stream.push({stream : streamToElastic});
}

const logger = pino(ecsFormat(), pinoMultiStream(stream));

export {logger};
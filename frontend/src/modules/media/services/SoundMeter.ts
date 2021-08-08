import { useEffect, useState } from "react";

import {logger} from '../../../logger'

import * as s from "./SoundMeterImpl";

let soundMeter: s.SoundMeter;

export const useSoundMeter = (stream?: MediaStream) => {
  const [meter, setMeter] = useState(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;

    const start = async () => {
      // @ts-ignore
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      // @ts-ignore
      window.audioContext = new AudioContext();
      // @ts-ignore
      soundMeter = new s.SoundMeter(window.audioContext, () => {
        setMeter(soundMeter.instant);
      });
      soundMeter.connectToSource(stream, function (e: any) {
        if (e) {
          alert(e);
          return;
        }
      });
    };
    start();

    return () => {
      logger.info("stopped sm");
      soundMeter && soundMeter.stop();
    };
  }, [stream]);

  const active = meter > 0.05;

  return {
    meter: active ? meter : 0,
    active,
  };
};

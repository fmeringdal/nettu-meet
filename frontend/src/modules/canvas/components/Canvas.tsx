import { createStyles, makeStyles } from "@material-ui/core";
import React, { useEffect } from "react";
import { meetingInteractor } from "../../meeting/interactors";
import { meetingState } from "../../meeting/state/meeting";
import { canvasManager, CANVAS_ELEMENT_ID } from "../services/CanvasManager";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundImage:
        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACfCAMAAABX0UX9AAAALVBMVEX////i4uLj4+Px8fHHx8f39/fs7Oz09PTW1tbT09Pa2tr19fXn5+fq6urd3d3se65oAAACp0lEQVR4nO3czYqDMBRA4cSMxvrT93/cYZTOOt4DTRbHVRYNfhxKvAhtOsp11bU2L2oObTqfbyrH4LxU0n3l1L4oe2DTMkfuNDgvlq9+zTc4z3yIZz7EMx/imQ/x0udWU2pflLn9s/+LJbKpDs5La76u6WdqX7y255umyKa8Ds7z24d4nn2IZz7EMx/imQ/xzId45kM8BxfEc2x2bO7H8+xDPPMhnvkQz3yIZz7EMx/iObggnmOzY3M/nmcf4pkP8cyHeOZDPPMhnvkQz8EF8RybHZv78Tz7EM98iGc+xDMf4pkP8cyHeA4uiOfY7Njcj+fZh3jmQzzzIZ75EM98iJcit/rez7Xr4LyU71/ll1dpX3z+LODRpndkUx6cl469/l3zNtfWxX6cgU15idxpcJ5/BYF4PjoQz3yIZz7EMx/imQ/xfGGFeL4u9XVpP55nH+KZD/HMh3jmQzzzIZ75EM/BBfEcmx2b+/E8+xDPfIhnPsQzH+KZD/HMh3gOLojn2OzY3I/n2Yd45kM88yGe+RDPfIhnPsRzcEE8x2bH5n48zz7EMx/imQ/xzId45kM88yGegwviOTY7NvfjefYhnvkQz3yIZz7EMx/ixZ68e/tnezx5v8dLebmv19K+eEc2bVNgUx6cl875vra5fXEsgU1TCWw6B+f5VxCI56MD8cyHeOZDPPMhnvkQzxdWiOfrUl+X9uN59iGe+RDPfIhnPsQzH+KZD/EcXBDPsdmxuR/Psw/xzId45kM88yGe+RDPfIjn4IJ4js2Ozf14nn2IZz7EMx/imQ/xzId45kM8BxfEc2x2bO7H8+xDPPMhnvkQz3yIZz7EMx/iObggnmOzY3M/nmcf4pkP8cyHeOZDPPMhnr8mR7x0lOuqa21e1BzadD7fVI7Beb9jtnsfGvaQcgAAAABJRU5ErkJggg==")',
    },
  })
);

interface Props {
  width: number;
  height: number;
}

export const Canvas = (props: Props) => {
  const classes = useStyles();
  const [width, setWidth] = React.useState(props.width);
  const [height, setHeight] = React.useState(props.height);

  const { meeting } = meetingState();

  useEffect(() => {
    if (!meeting) {
      return;
    }

    const getCanvasJSON = async () => {
      // maybe also show some loading effect or disbale canvas or something wile changing canvas?
      const res = await meetingInteractor.getCanvas(meeting.activeCanvasId);
      const canvasJSON = JSON.parse(res.data);

      if (canvasManager.isInitialized) {
        canvasManager.clearHistoryAndSetCanvas(canvasJSON);
      } else {
        canvasManager.initializeCanvas(canvasJSON);
      }
    };
    getCanvasJSON();
  }, [meeting]);

  return (
    <div
      className={classes.container}
      style={{
        width: props.width + "px",
        height: props.height + "px",
      }}
    >
      <canvas id={CANVAS_ELEMENT_ID} width={width} height={height}></canvas>
    </div>
  );
};

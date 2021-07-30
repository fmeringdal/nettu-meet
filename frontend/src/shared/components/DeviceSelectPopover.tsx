import { Box, MenuItem, Popover, Select, Typography } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";
import { useLocalStreams } from "../../modules/media/state/state";

interface Props {
  anchorEl: any;
  open: boolean;
  onClose: () => void;
}

export const DeviceSelectPopover = (props: Props) => {
  const { deviceConfig, availableDevices, setAudioDevice, setWebcamDevice } =
    useLocalStreams();

  const [audioInputDevices, setAudioInputDevices] = useState<
    {
      deviceId: string;
      label: string;
    }[]
  >([]);

  const [videoInputDevices, setVideoInputDevices] = useState<
    {
      deviceId: string;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    setAudioInputDevices(
      availableDevices.filter((device) => device.kind === "audioinput")
    );
    setVideoInputDevices(
      availableDevices.filter((device) => device.kind === "videoinput")
    );
  }, [availableDevices]);

  return (
    <Popover
      anchorEl={props.anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      open={props.open}
      onClose={props.onClose}
    >
      <Box width={300} p={1}>
        <Typography variant="h6" color="textSecondary">
          Audio Input
        </Typography>
        <Select
          value={
            audioInputDevices.length > 0
              ? deviceConfig.audio
              : "no_devices_found"
          }
          disabled={audioInputDevices.length === 0}
          fullWidth={true}
          onChange={(e) => setAudioDevice(e.target.value as string)}
        >
          {audioInputDevices.length > 0 &&
            audioInputDevices.map((device) => {
              return (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              );
            })}
          {audioInputDevices.length === 0 && (
            <MenuItem key={"no_devices_found"} value={"no_devices_found"}>
              No Devices Found
            </MenuItem>
          )}
        </Select>
        <Box mt={2} />
        <Typography variant="h6" color="textSecondary">
          Camera
        </Typography>
        <Select
          value={
            videoInputDevices.length > 0
              ? deviceConfig.webcam
              : "no_devices_found"
          }
          disabled={videoInputDevices.length === 0}
          fullWidth={true}
          onChange={(e) => setWebcamDevice(e.target.value as string)}
        >
          {videoInputDevices.length > 0 &&
            videoInputDevices.map((device) => {
              return (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              );
            })}
          {videoInputDevices.length === 0 && (
            <MenuItem key={"no_devices_found"} value={"no_devices_found"}>
              No Devices Found
            </MenuItem>
          )}
        </Select>
        <Box mt={1} />
      </Box>
    </Popover>
  );
};

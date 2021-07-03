import { useState, useCallback, Fragment } from "react";
import { useDropzone } from "react-dropzone";
import clsx from "clsx";
import {
  Dialog,
  makeStyles,
  createStyles,
  Paper,
  Button,
} from "@material-ui/core";
import { Resource } from "../../modules/meeting/domain/resource";
import { meetingInteractor } from "../../modules/meeting/interactors";
import { meetingState } from "../../modules/meeting/state/meeting";
import { FileComponent } from "./FileComponent";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: "100%",
      padding: "24px",
      boxSizing: "border-box",
    },
    dropzone: {
      width: "100%",
      height: "300px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px dashed #DFE3E8",
    },
    dropHover: {
      backgroundColor: "#f2f4f7",
    },
    files: {
      margin: "24px",
    },
    file: {
      width: "100%",
      height: "35px",
      boxShadow: theme.shadows[2],
      margin: "4px 0",
    },
  })
);

interface UploadSuccessResponse {
  uploadedResources: Resource[];
}

interface Props {
  open: boolean;
  toCanvas?: boolean;
  accept?: string;
  onDone: (data: UploadSuccessResponse) => void;
  onClose: () => void;
}

export const FileUploadModal = (props: Props) => {
  const classes = useStyles();

  const meeting = meetingState();
  const [files, setFiles] = useState<any[]>([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Do something with the files
      setFiles(
        [...files, ...acceptedFiles].map((f) => {
          f.id = Math.random() + "";
          return f;
        })
      );
    },
    [files]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: props.accept,
  });

  if (!meeting.meeting) {
    return <Fragment></Fragment>;
  }

  const meetingId = meeting.meeting.id;

  const removeFile = (fileId: string) => {
    setFiles([...files].filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    const resources = [];
    for (const file of files) {
      try {
        const res = await meetingInteractor.createResource(
          file,
          meetingId,
          props.toCanvas ? meeting.meeting!.activeCanvasId : undefined
        );
        const resource = res.getValue().resource;
        resources.push(resource);
      } catch (error) {
        alert(error?.response?.data?.message);
      }
    }
    props.onDone({
      uploadedResources: resources,
    });
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={props.open}
      onClose={() => props.onClose()}
    >
      <Paper className={classes.container}>
        <div
          {...getRootProps()}
          className={clsx(classes.dropzone, {
            [classes.dropHover]: isDragActive,
          })}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
        <div className={classes.files}>
          {files.map((f) => (
            <FileComponent
              name={f.name}
              key={f.id}
              style={{
                margin: "3px 0",
              }}
              onDelete={() => removeFile(f.id)}
            />
          ))}
        </div>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={() => uploadFiles()}
          disabled={files.length === 0}
          style={{ marginTop: "24px" }}
        >
          UPLOAD
        </Button>
      </Paper>
    </Dialog>
  );
};

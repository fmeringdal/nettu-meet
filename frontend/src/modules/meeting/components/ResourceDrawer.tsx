import {
  Button,
  createStyles,
  Drawer,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { CloudUploadOutlined } from "@material-ui/icons";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FileComponent } from "../../../shared/components/FileComponent";
import { FileUploadModal } from "../../../shared/components/FileUploadModal";
import { Resource } from "../domain/resource";
import { IMeetingInteractor } from "../interactors/meetingInteractor";
import { meetingState } from "../state/meeting";
import { useResourceDrawer } from "../state/resourceDrawer";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: "420px",
      height: "100%",
      overflow: "hidden",
      position: "relative",
    },
    header: {
      height: "60px",
      borderBottom: `1px solid ${theme.palette.divider}`,
      boxSizing: "border-box",
      padding: "16px",
      display: "flex",
      alignItems: "center",
    },
    title: {
      fontWeight: 500,
      fontSize: "1.2rem",
    },
    resources: {
      height: window.innerHeight - 140,
      position: "absolute",
      right: 0,
      bottom: 80,
      left: 0,
      top: 60,
      overflowY: "auto",
      backgroundColor: theme.palette.background.default,
    },
    resourceCreator: {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: theme.palette.background.paper,
      minHeight: "80px",
      borderTop: `1px solid ${theme.palette.divider}`,
      boxSizing: "border-box",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    file: {
      width: "95%",
      height: "35px",
      boxShadow: theme.shadows[1],
      margin: "4px auto",
    },
  })
);

interface Props {
  meetingInteractor: IMeetingInteractor;
  meetingId: string;
}

export const ResourceDrawer = (props: Props) => {
  const classes = useStyles();

  const { meeting } = meetingState();
  const { visible, toggle } = useResourceDrawer();
  const [isUploading, setIsUploading] = useState(false);

  if (!meeting) return <div></div>;

  const deleteResource = (resourceId: string) => {
    props.meetingInteractor.deleteResource(meeting!.id, resourceId);
  };

  const downloadResource = ({ name, publicURL }: Resource) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = publicURL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Drawer anchor="left" open={visible} onClose={() => toggle()}>
      <Paper square className={classes.container}>
        <div className={classes.header}>
          <Typography className={classes.title} color="textPrimary">
            Attachments
          </Typography>
        </div>
        <div className={classes.resources}>
          {meeting.resources.map((r) => (
            <FileComponent
              name={r.name}
              key={r.id}
              style={{
                margin: "3px auto",
                width: "95%",
              }}
              onDownload={() => downloadResource(r)}
              onDelete={() => deleteResource(r.id)}
            />
          ))}
          <AlwaysScrollToBottom />
        </div>
        <div className={classes.resourceCreator}>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={() => setIsUploading(true)}
            startIcon={<CloudUploadOutlined />}
            size="large"
          >
            UPLOAD
          </Button>
        </div>
      </Paper>
      {isUploading ? (
        <FileUploadModal
          open={true}
          onClose={() => setIsUploading(false)}
          onDone={() => setIsUploading(false)}
        />
      ) : null}
    </Drawer>
  );
};

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<any>();
  useEffect(() => elementRef.current.scrollIntoView({ behaviour: "smooth" }));
  return <div ref={elementRef} />;
};

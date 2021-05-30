import {
  createStyles,
  IconButton,
  makeStyles,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  AttachFileOutlined,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "0px 16px",
      borderRadius: "4px",
      boxShadow: theme.shadows[1],
      boxSizing: "border-box",
    },
    btns: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginLeft: "auto",
    },
    name: {
      fontSize: "1rem",
    },
  })
);

interface Props {
  name: string;
  style?: CSSProperties;
  onDelete: () => void;
  onDownload?: () => void;
}

export const FileComponent = (props: Props) => {
  const classes = useStyles();

  return (
    <Paper className={classes.container} style={props.style}>
      <AttachFileOutlined
        style={{
          marginRight: "8px",
          fontSize: "1.1rem",
        }}
      />
      <Typography className={classes.name}>{props.name}</Typography>
      <div className={classes.btns}>
        {typeof props.onDownload === "function" && (
          <Tooltip placement="top" title="Download">
            <IconButton onClick={() => props.onDownload!()}>
              <CloudDownloadOutlined
                style={{
                  marginRight: "8px",
                  fontSize: "1.1rem",
                }}
              />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip placement="top" title="Slett">
          <IconButton onClick={() => props.onDelete!()}>
            <DeleteOutlined
              style={{
                fontSize: "1.1rem",
              }}
            />
          </IconButton>
        </Tooltip>
      </div>
    </Paper>
  );
};

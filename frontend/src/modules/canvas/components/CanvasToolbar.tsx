import { Toolbar, Button, makeStyles, Box } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ClearIcon from "@material-ui/icons/Delete";
import PencilIcon from "@material-ui/icons/EditOutlined";
import InsertGraphIcon from "@material-ui/icons/Functions";
import InsertPictureIcon from "@material-ui/icons/InsertPhoto";
import DownloadIcon from "@material-ui/icons/PublishRounded";
import RedoIcon from "@material-ui/icons/RedoRounded";
import TextIcon from "@material-ui/icons/TextFields";
import UndoIcon from "@material-ui/icons/UndoRounded";
import React, {
  FunctionComponent,
  useState,
  CSSProperties,
  Fragment,
} from "react";
import { ColorPicker } from 'material-ui-color';
import { FileUploadModal } from "../../../shared/components/FileUploadModal";
import { canvasManager, CANVAS_MODE } from "../services/CanvasManager";
import { useToolbarState } from "../services/ToolbarInteractor";
import { GraphCreatorModal } from "./GraphCreatorModal";

// import PictureInsert from "../PictureInsert/PictureInsert";
// import GraphInsert from "../Sketch/GraphInsert/GraphInsert";

const colorOptions = [
  "#000",
  "#95a5a6",
  "#e74c3c",
  "#00bd9d",
  "#2c97df",
  "#9c56b8",
  "#e9c81d",
];

const styles = {
  toolbarIcon: {
    fontSize: "1.2rem",
    color: "#323e49",
  },
  toolbarIconFigure: {
    fontSize: "1.2rem",
    color: "#323e49",
  },
  toolbarIconRect: {
    width: "16px",
    height: "8px",
    border: "1.2px solid #323e49",
  },
  toolbarIconCircle: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "1.2px solid #323e49",
  },
  toolbarIconLine: {
    width: "16px",
    height: "2px",
    backgroundColor: "#323e49",
  },
};

const getToolIcon = (tool: string) => {
  switch (tool) {
    case CANVAS_MODE.FREEDRAW:
      return <PencilIcon style={styles.toolbarIcon} />;
    case CANVAS_MODE.PICKER:
      return (
        <img
          src="https://img.icons8.com/metro/344/cursor.png"
          alt=""
          style={{ ...styles.toolbarIcon, width: "16px", height: "16px" }}
        />
      );
    // return <SelectIcon style={styles.toolbarIcon} />;
    case CANVAS_MODE.LINE:
      return (
        <img
          src="https://img.icons8.com/metro/344/line.png"
          alt=""
          style={{ ...styles.toolbarIcon, width: "16px", height: "16px" }}
        />
      );
    case CANVAS_MODE.RECT:
      return (
        <div
          style={{ ...styles.toolbarIconFigure, ...styles.toolbarIconRect }}
        ></div>
      );
    case CANVAS_MODE.CIRCLE:
      return (
        <div
          style={{ ...styles.toolbarIconFigure, ...styles.toolbarIconCircle }}
        ></div>
      );
    case CANVAS_MODE.TEXT:
      return <TextIcon style={styles.toolbarIcon} />;
    case CANVAS_MODE.ERASER:
      return (
        <img
          src="https://img.icons8.com/ios-glyphs/344/erase.png"
          alt=""
          style={{ ...styles.toolbarIcon, width: "16px", height: "16px" }}
        />
      );
    case "clear":
      return <ClearIcon style={styles.toolbarIcon} />;
    default:
      return <PencilIcon style={styles.toolbarIcon} />;
  }
};

const useStyles = makeStyles((theme) => ({
  toolbarBtn: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "3px",
    boxSizing: "border-box",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#eee",
    },
  },
  active: {
    borderRadius: "3px",
    backgroundColor: "#eee",
  },
  colorOptionContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
    cursor: "pointer",
  },
  colorOption: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    overflow: "hidden",
  },
  line: {
    width: "140px",
    backgroundColor: "#323e49",
    height: "1px",
  },
}));

interface Props {}

const BoxCenter: FunctionComponent<any> = (props: {
  style?: CSSProperties;
  children: any;
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={props.style}
    >
      {props.children}
    </Box>
  );
};

export const CanvasToolbar = (props: Props) => {
  const [onGraphInserter, setOnGraphInserter] = useState(false);
  const [onPictureInserter, setOnPictureInserter] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { mode, color, brushWidth, selectedObject } = useToolbarState();

  const classes = useStyles();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const canSelectColor = [
    CANVAS_MODE.FREEDRAW,
    CANVAS_MODE.LINE,
    CANVAS_MODE.RECT,
    CANVAS_MODE.CIRCLE,
  ].includes(mode as CANVAS_MODE);

  return (
    <Toolbar variant="dense">
      <div className={classes.toolbarBtn} onClick={() => canvasManager.undo()}>
        <UndoIcon style={styles.toolbarIcon} />
      </div>
      <div className={classes.toolbarBtn} onClick={() => canvasManager.redo()}>
        <RedoIcon style={styles.toolbarIcon} />
      </div>
      <BoxCenter>
        {[
          { tool: CANVAS_MODE.FREEDRAW },
          { tool: CANVAS_MODE.PICKER },
          { tool: CANVAS_MODE.ERASER },
          { tool: CANVAS_MODE.LINE },
          { tool: CANVAS_MODE.RECT },
          { tool: CANVAS_MODE.CIRCLE },
          // { tool: "text" },
          { tool: "clear" },
        ].map((tool) => (
          <div
            key={tool.tool}
            onClick={() =>
              tool.tool === "clear"
                ? canvasManager.clear()
                : canvasManager.setMode(tool.tool)
            }
            className={
              mode === tool.tool
                ? [classes.toolbarBtn, classes.active].join(" ")
                : classes.toolbarBtn
            }
          >
            {getToolIcon(tool.tool)}
          </div>
        ))}
      </BoxCenter>
      {canSelectColor && (
        <Fragment>
          <BoxCenter style={{ margin: "0 10px" }}>
            <ColorPicker
            defaultValue="#000"
            onChange={c => canvasManager.setColor('#' + c.hex)}
            value={color}
            palette={colorOptions} />
          </BoxCenter>
          <BoxCenter style={{ margin: "0 10px" }}>
            <div style={{color: "black", marginRight: "10px"}}>
              Brush Width:
            </div>
            <Slider
              style={{width: "150px"}}
              defaultValue={5}
              value={brushWidth}
              onChange={(e, newValue) => (canvasManager.setBrushWidth(newValue as number))}
              aria-labelledby="brush-width"
              min={3}
              max={16}
              step={1}
              valueLabelDisplay="auto"
            />
          </BoxCenter>
        </Fragment>
      )}
      {selectedObject && (
        <div className="flex-center">
          <button onClick={() => canvasManager.setSelectedObjectZPos(0)}>
            Back
          </button>
          <button onClick={() => canvasManager.setSelectedObjectZPos(1)}>
            Backwards
          </button>
          <button onClick={() => canvasManager.setSelectedObjectZPos(2)}>
            Forwards
          </button>
          <button onClick={() => canvasManager.setSelectedObjectZPos(3)}>
            Front
          </button>
        </div>
      )}

      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        style={{ marginLeft: "auto", color: "#323e49" }}
      >
        <InsertGraphIcon
          style={{
            color: "#323e49",
            marginRight: "6px",
            fontSize: "1.2rem",
          }}
        />
        Insert
      </Button>
      <Button
        onClick={() => canvasManager.downloadCanvas()}
        style={{ marginLeft: "15px", color: "#323e49" }}
      >
        <DownloadIcon
          style={{
            color: "#323e49",
            WebkitTransform: "rotateX(180deg)",
            transform: "rotateX(180deg)",
            marginRight: "6px",
            fontSize: "1.2rem",
          }}
        />
        Download
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            setOnGraphInserter(true);
            handleClose();
          }}
        >
          <InsertGraphIcon
            style={{ color: "#323e49", marginRight: "6px", fontSize: "1.2rem" }}
          />
          Graph
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOnPictureInserter(true);
            handleClose();
          }}
        >
          <InsertPictureIcon
            style={{ color: "#323e49", marginRight: "6px", fontSize: "1.2rem" }}
          />
          Picture
        </MenuItem>
      </Menu>
      {onGraphInserter ? (
        <GraphCreatorModal
          open={true}
          onClose={() => setOnGraphInserter(false)}
          onDone={async (resource) => {
            canvasManager.insertImage(resource.publicURL, resource.id);
            setOnGraphInserter(false);
          }}
        />
      ) : null}
      {onPictureInserter ? (
        <FileUploadModal
          open={true}
          accept="image/*"
          onClose={() => setOnPictureInserter(false)}
          onDone={async ({ uploadedResources }) => {
            for (const r of uploadedResources) {
              canvasManager.insertImage(r.publicURL, r.id);
            }
            setOnPictureInserter(false);
          }}
          toCanvas={true}
        />
      ) : null}
    </Toolbar>
  );
};

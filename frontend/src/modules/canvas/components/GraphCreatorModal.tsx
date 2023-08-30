import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  IconButton,
  makeStyles,
  Paper,
  Tooltip,
} from "@material-ui/core";
import functionPlot from "function-plot";

import SettingsIcon from "@material-ui/icons/Settings";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import { Fragment, useEffect, useRef, useState } from "react";
import { meetingInteractor } from "../../meeting/interactors";
import { meetingState } from "../../meeting/state/meeting";
import { Resource } from "../../meeting/domain/resource";
import { logger } from "../../../logger";

const colorOptions = [
  "#e74c3c",
  "#00bd9d",
  "#2c97df",
  "#9c56b8",
  "#e9c81d",
  "#95a5a6",
  "#000",
];

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: "100%",
      height: "600px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "flex-start",
      borderTop: `4px solid ${theme.palette.primary.main}`,
    },
    main: {
      flex: 1,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    sidebar: {
      width: "350px",
      height: "100%",
      boxSizing: "border-box",
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    sidebarHeader: {
      padding: "0 16px",
      height: "50px",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    title: {
      fontSize: "1.2rem",
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      fontWeight: 500,
      letterSpacing: "0.00735em",
      color: "#323e49",
      margin: 0,
      whiteSpace: "nowrap",
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    graphToConfigureHeader: {
      padding: "0 16px",
      height: "50px",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    configRow: {
      height: "50px",
      width: "100%",
      padding: "0 16px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    configLabel: {
      fontSize: "0.9rem",
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      fontWeight: 500,
      letterSpacing: "0.00735em",
      color: "#323e49",
      margin: 0,
      whiteSpace: "nowrap",
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    colors: {
      margin: "0 10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    colorOptionWrapper: {
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      overflow: "hidden",
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
    graphs: {
      height: "490px",
      overflowY: "auto",
    },
    graphInputWrapper: {
      width: "100%",
      height: "55px",
      backgroundColor: "#fff",
      borderBottom: `1px solid ${theme.palette.divider}`,
      boxSizing: "border-box",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "&:hover div": {
        display: "flex",
      },
      "&:hover input": {
        width: "215px",
      },
      "&:hover": {
        paddingRight: "0px",
      },
    },
    graphInput: {
      width: "280px",
      height: "100%",
      border: "none",
      fontFamily: "Roboto",
      color: "#323e49",
      fontSize: "1.1rem",
      fontWeight: 500,
      outline: "none",
      padding: 0,
      margin: 0,
    },
    graphPrefix: {
      fontSize: "1.1rem",
      fontWeight: 500,
      fontFamily: "Roboto",
      display: "block",
      whiteSpace: "nowrap",
      width: "50px",
    },
    graphOptions: {
      width: "80px",
      alignItems: "center",
      justifyContent: "flex-end",
      display: "none",
    },
    sidebarFooter: {
      padding: "0 16px",
      width: "100%",
      boxSizing: "border-box",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  })
);

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: (resource: Resource) => void;
}

export const GraphCreatorModal = (props: Props) => {
  const classes = useStyles();

  const meeting = meetingState();

  const [graphs, setGraphs] = useState<any[]>([]);
  const titleRef = useRef();
  const [gridConfig, setGridConfig] = useState({
    target: "." + classes.main,
    grid: true,
    width: 700,
    height: 570,
    title: "",
  });
  const [graphToConfigure, setGraphToConfigure] = useState<any>(null);
  const [onSettings, setOnSettings] = useState(false);

  useEffect(() => {
    try {
      functionPlot({
        ...gridConfig,
        data: graphs,
      });
    } catch (error) {
      logger.error({error: error, graphs : graphs}, "error");
    }
  }, [graphs, gridConfig]);

  useEffect(() => {
    addNewGraph();
  }, []);

  const updateGraphData = (data: any, i: number) => {
    const newGraphs = [...graphs];
    newGraphs[i] = {
      ...graphs[i],
      ...data,
    };
    setGraphs(newGraphs);
  };

  const addNewGraph = () => {
    const newGraph = {
      id: Math.random(),
      fn: "x",
      label: "Hello world",
      // range: [0, 10],
      color: colorOptions[graphs.length % colorOptions.length],
      // closed: true
    };
    setGraphs([...graphs, newGraph]);
  };

  const onDeleteGraph = (index: number) => {
    const newGraphs = [...graphs];
    newGraphs.splice(index, 1);
    const container = document.getElementById(classes.main);
    if (!container) return;
    const plot = container.firstChild;
    if (!plot) return;
    plot.remove();
    setTimeout(() => {
      setGraphs(newGraphs);
    }, 0);
  };

  const onInsert = async () => {
    //get svg element.
    const container = document.getElementsByClassName(classes.main)[0]!;
    const svg = container.childNodes[0];

    //get svg source.
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const res = await meetingInteractor.createResource(
      {
        file: source,
        name: "graph",
        type: "image/svg+xml",
      },
      meeting.meeting!.id,
      meeting.meeting!.activeCanvasId
    );
    if (res.isFailure) {
      alert("Failed to upload graph. Please check your network.");
      return;
    }
    const { resource } = res.getValue();
    props.onDone(resource);
  };

  const onGraphUpdate = (graph: any) => {
    const newGraphs = [...graphs];
    for (let i = 0; i < newGraphs.length; i++) {
      if (newGraphs[i].id === graph.id) {
        newGraphs[i] = graph;
        break;
      }
    }
    setGraphs(newGraphs);
  };

  const getGraphConfigucationContents = () => {
    return (
      <Fragment>
        <div className={classes.graphToConfigureHeader}>
          <input
            value={graphToConfigure!.fn}
            className={classes.graphInput}
            style={{ color: graphToConfigure!.color }}
            onChange={(e) => {
              setGraphToConfigure({ ...graphToConfigure!, fn: e.target.value });
              updateGraphData({ fn: e.target.value }, graphToConfigure!.i);
            }}
          />
          <Tooltip
            placement="bottom"
            title="Close"
            onClick={() => setGraphToConfigure(null)}
          >
            <IconButton>
              <CloseIcon
                style={{ color: "rgba(0, 0, 0, 0.54)", fontSize: "1rem" }}
              />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.configRow}>
          <p className={classes.configLabel}>Areal</p>
          <Checkbox
            checked={graphToConfigure.closed}
            onChange={(e) => {
              const updatedGraph = {
                ...graphToConfigure!,
                closed: e.target.checked,
              };
              setGraphToConfigure(updatedGraph);
              onGraphUpdate(updatedGraph);
            }}
          />
        </div>
        <div className={classes.configRow}>
          <p className={classes.configLabel}>Color</p>
          <div className={classes.colors}>
            {colorOptions.map((colorOption) => (
              <div
                className={classes.colorOptionWrapper}
                key={colorOption}
                onClick={() => {
                  const updatedGraph = {
                    ...graphToConfigure!,
                    color: colorOption,
                  };
                  setGraphToConfigure(updatedGraph);
                  onGraphUpdate(updatedGraph);
                }}
                style={
                  colorOption === graphToConfigure.color
                    ? { borderColor: colorOption }
                    : undefined
                }
              >
                <div
                  className={classes.colorOption}
                  style={{
                    backgroundColor: colorOption,
                    border:
                      colorOption === "#fff" ? "1px solid #ddd" : undefined,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </Fragment>
    );
  };

  const getGraphsList = () => {
    return (
      <Fragment>
        <div className={classes.graphs}>
          {graphs.map((data, i) => (
            <div className={classes.graphInputWrapper}>
              <span
                className={classes.graphPrefix}
                style={{ opacity: 0.5, color: data.color }}
              >
                f(x) ={" "}
              </span>
              <input
                value={data.fn}
                className={classes.graphInput}
                key={data.id}
                style={{ color: data.color }}
                onChange={(e) => updateGraphData({ fn: e.target.value }, i)}
              />
              <div className={classes.graphOptions}>
                <Tooltip placement="bottom" title="Configure">
                  <IconButton
                    onClick={() => setGraphToConfigure({ ...data, i })}
                  >
                    <SettingsIcon
                      style={{
                        color: "rgba(0, 0, 0, 0.54)",
                        fontSize: "0.8rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip placement="bottom" title="Slett">
                  <IconButton onClick={() => onDeleteGraph(i)}>
                    <DeleteIcon
                      style={{
                        color: "red",
                        fontSize: "0.8rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
          <Button
            color="primary"
            onClick={() => addNewGraph()}
            fullWidth
            size="large"
          >
            Add graph
          </Button>
        </div>
        <div className={classes.sidebarFooter}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            disabled={graphs.length === 0}
            fullWidth
            onClick={() => onInsert()}
          >
            Insert
          </Button>
        </div>
      </Fragment>
    );
  };

  const getPageContents = () => {
    if (graphToConfigure !== null) {
      return getGraphConfigucationContents();
    } else {
      return getGraphsList();
    }
  };

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      open={props.open}
      onClose={() => props.onClose()}
    >
      <Paper className={classes.container}>
        <div className={classes.sidebar}>
          <div className={classes.sidebarHeader}>
            <h3 className={classes.title}>Graphs</h3>
          </div>
          {getPageContents()}
        </div>
        <div className={classes.main} id={classes.main}></div>
      </Paper>
    </Dialog>
  );
};

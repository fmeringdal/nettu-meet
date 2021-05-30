import { createStyles, makeStyles, Typography } from "@material-ui/core";
import { Fragment } from "react";
import clsx from "clsx";

interface Props {
  pages: { id: string; active: boolean }[];
  onChange: (onChange: string) => void;
  onCreate: () => void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    page: {
      width: "30px",
      height: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgb(41, 56, 69)",
      "&:hover": {
        background:
          "linear-gradient(rgb(143, 43, 224) 0%, rgb(156, 66, 228) 100%)",
        cursor: "pointer",
      },
    },
    active: {
      background:
        "linear-gradient(rgb(143, 43, 224) 0%, rgb(156, 66, 228) 100%)",
      cursor: "pointer",
    },
    label: {
      color: theme.palette.common.white,
      fontWeight: 400,
      fontSize: "0.9rem",
    },
  })
);

export const PageMenu = (props: Props) => {
  const classes = useStyles();

  return (
    <Fragment>
      {props.pages.map((page, i) => (
        <div
          key={page.id}
          onClick={() => (page.active ? null : props.onChange(page.id))}
          className={clsx(classes.page, {
            [classes.active]: page.active,
          })}
        >
          <Typography className={classes.label}>{i + 1}</Typography>
        </div>
      ))}
      {props.pages.length < 15 && (
        <div className={classes.page} onClick={() => props.onCreate()}>
          <Typography className={classes.label}>+</Typography>
        </div>
      )}
    </Fragment>
  );
};

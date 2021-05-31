import { makeStyles } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "28px",
    display: "flex",
    borderRadius: ".25em",
    overflow: "hiddem",
    cursor: "pointer",
    border: "1px solid rgba(27,31,35,.15)",
    textDecoration: "none",
    color: "#24292e",
  },
  left: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    backgroundRepeat: "repeat-x",
    backgroundPosition: "-1px -1px",
    backgroundSize: "110% 110%",
    borderRight: "1px solid rgba(27,31,35,.15)",
    backgroundColor: "#eff3f6",
    backgroundImage: "linear-gradient(180deg, #fafbfc, #eff3f6 90%)",
    padding: "3px 10px",
    boxSizing: "border-box",
    lineHeight: "20px",
    "& span": {
      fontWeight: 600,
      fontSize: "12px",
    },
    "&:hover": {
      backgroundColor: "#e9ebef",
      backgroundPosition: "0 -0.5em",
      borderColor: "rgba(27,31,35,.15)",
      backgroundImage: "linear-gradient(180deg, #f3f4f6, #e9ebef 90%)",
    },
  },
  right: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    fontWeight: 600,
    borderLeft: 0,
    backgroundColor: "#fff",
    padding: "3px 10px",
    fontSize: "12px",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

interface Props {}

export const GithubRepoBadge = (props: Props) => {
  const classes = useStyles();
  const [stars, setStars] = useState("...");

  useEffect(() => {
    const getStars = async () => {
      const res = await axios.get(
        "https://api.github.com/repos/fmeringdal/nettu-meet"
      );
      if (res.status !== 200) return;
      setStars(res.data.stargazers_count + "");
    };
    getStars();
  }, []);

  return (
    <a
      className={classes.container}
      href="https://github.com/fmeringdal/nettu-meet"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={classes.left}>
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          className="octicon octicon-star"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
          ></path>
        </svg>
        <span style={{ marginLeft: "2px" }}>Star</span>
      </div>
      <div className={classes.right}>{stars}</div>
    </a>
  );
};

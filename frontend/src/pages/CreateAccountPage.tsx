import {
  Button,
  createStyles,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Fragment, useRef, useState } from "react";
import { VerificationCodeInput } from "../shared/components/VerificationCode/VerificationCode";
import clsx from "clsx";
import CopyIcon from "../assets/icons/copy.svg";
import { copyTextToClipboard } from "../shared/utils/clipboard";
import CloseIcon from "@material-ui/icons/Close";
import { green, red } from "@material-ui/core/colors";
import { userService } from "../modules/user/services";
import { accountService } from "../modules/account/services";
import { NettuProgress } from "../shared/components/NettuProgress";
import { apiConfig } from "../config/api";

interface Props
  extends RouteComponentProps<{ emailVerificationCode?: string }> {}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dialog: {
      padding: "24px 20px",
      borderTop: "4px solid " + theme.palette.primary.main,
      width: "490px",
      boxSizing: "border-box",
      maxWidth: "95%",
    },
    loadingdialog: {
      width: "490px",
      height: "500px",
      maxWidth: "95%",
    },
    paperSuccess: {
      width: "490px",
      maxWidth: "95%",
      padding: "24px 20px",
      boxSizing: "border-box",
      borderTop: "4px solid " + theme.palette.success.main,
    },
    errorText: {
      fontWeight: 400,
      color: theme.palette.error.main,
      fontSize: "0.75rem",
    },
    snackbar: {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      padding: "16px",
      color: "#fff",
      boxShadow: theme.shadows[5],
      borderRadius: "4px",
      overflow: "hidden",
    },
    snackbarError: {
      backgroundColor: red[900],
    },
    snackbarSuccess: {
      backgroundColor: green["A700"],
    },
  })
);

const CreateAccountPage = (props: Props) => {
  const classes = useStyles();
  const codeRef = useRef<any>();

  const [values, setValues] = useState({
    email: "",
    code: "",
  });
  const [account, setAccount] = useState({
    name: "",
    secretKey: "",
  });
  const [page, setPage] = useState("email");
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    success: true,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCloseSnackbar = (event: any, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarState({
      ...snackbarState,
      open: false,
    });
  };

  const [error, setError] = useState(false);

  const handleCodeVerification = async (values: {
    email: string;
    code: string;
  }) => {
    setLoading(true);
    if (error) {
      setError(false);
    }
    const res = await userService.validateEmailVerification(
      values.email,
      values.code
    );
    if (res.isFailure) {
      setValues({
        ...values,
        code: "",
      });
      setError(true);
    } else {
      setPage("form");
    }
    setLoading(false);
  };

  const tryPerformStep = async () => {
    setLoading(true);
    if (error) {
      setError(false);
    }
    if (page === "email") {
      const res = await userService.createEmailVerification(values.email);
      if (res.isFailure) {
        setError(true);
      } else {
        setPage("code");
      }
    } else if (page === "code") {
    } else if (page === "form") {
      const res = await accountService.createAccount({
        emailToken: {
          email: values.email,
          code: values.code,
        },
        name: account.name,
      });
      if (res.isFailure) {
        setError(true);
      } else {
        setAccount({
          ...account,
          secretKey: res.getValue().secretKey,
        });
        setPage("success");
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const displayCurrentPage = () => {
    switch (page) {
      case "email":
        return (
          <Fragment>
            <Typography variant="h5" component="h2" gutterBottom>
              Contact email
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              This is the only personal information we will need from you before
              you can create your own nettu meet account.
            </Typography>
            <TextField
              required
              variant="filled"
              fullWidth
              label="Email"
              error={error}
              helperText={
                error
                  ? "Invalid email. Might be malformed or a disposable email."
                  : ""
              }
              margin="normal"
              autoFocus
              onKeyPress={(e) => {
                const code = e.keyCode ? e.keyCode : e.which;
                if (code !== 13) return;
                tryPerformStep();
              }}
              value={values.email}
              onChange={(e) => {
                if (error) {
                  setError(false);
                }
                setValues({ ...values, email: e.target.value });
              }}
            />
            <Button
              onClick={() => tryPerformStep()}
              variant="contained"
              color="primary"
              size="large"
              disabled={
                values.email.length < 3 ||
                !values.email.includes("@") ||
                values.email.endsWith("@") ||
                values.email.startsWith("@")
              }
              style={{ marginTop: "14px" }}
              fullWidth
            >
              SEND VERIFICATION CODE
            </Button>
          </Fragment>
        );
      case "code":
        return (
          <Fragment>
            <div
              style={{
                margin: "0 auto",
                width: "370.4px",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Check your email!
              </Typography>
              <Typography variant="body2" component="p" gutterBottom>
                We have sent you a 6-digit code to your inbox. Remember to check
                you spam folder.
              </Typography>
            </div>
            <VerificationCodeInput
              ref={codeRef}
              error={error}
              onChange={(val) => {
                // setValues({ ...values, code: val });
              }}
              onComplete={(val) => {
                setValues({ ...values, code: val });
                handleCodeVerification({
                  email: values.email,
                  code: val,
                });
              }}
            />
            {error ? (
              <Typography
                className={classes.errorText}
                align="center"
                component="p"
                style={{ margin: "12px", fontSize: "0.85rem" }}
              >
                Invalid code
              </Typography>
            ) : null}
          </Fragment>
        );
      case "form":
        return (
          <Fragment>
            <Typography variant="h5" component="h2" gutterBottom>
              Create your meeting app
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ marginBottom: "16px" }}
            >
              Give a name to your Nettu meeting app. This can be changed later.
            </Typography>
            <form noValidate autoComplete="off">
              <TextField
                variant="filled"
                fullWidth
                error={error}
                label="Name"
                helperText={
                  error ? "This name is already in use by someone else." : null
                }
                required
                onChange={(e) => {
                  setAccount((comp) => ({
                    ...comp,
                    name: e.target.value,
                  }));
                  if (error) {
                    setError(false);
                  }
                }}
                value={account.name}
                margin="normal"
              />
              <Button
                color="primary"
                variant="contained"
                size="large"
                fullWidth
                disabled={account.name.length < 2}
                onClick={() => tryPerformStep()}
                style={{ marginTop: "16px" }}
              >
                CREATE
              </Button>
            </form>
          </Fragment>
        );
      case "success":
        return (
          <Fragment>
            <Typography variant="h5" component="h2" gutterBottom>
              Success!
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ marginBottom: "16px" }}
            >
              You have succefully created a Nettu Meet account! Copy and store
              your api-key securely and check out the documentation of how to
              get started.
            </Typography>
            <TextField
              variant="filled"
              fullWidth
              multiline
              InputProps={{
                readOnly: true,
                disabled: true,
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip placement="top" title="Copy to clipboard">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={async () => {
                          const res = await copyTextToClipboard(
                            account.secretKey
                          );
                          setSnackbarState({
                            open: true,
                            message: res.isSuccess
                              ? "Copied to clipboard"
                              : "Unable to copy to clipboard",
                            success: res.isSuccess,
                          });
                        }}
                      >
                        <img src={CopyIcon} alt="" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              error={error}
              label="Your secret API key"
              value={account.secretKey}
              margin="normal"
            />
            <Button
              color="primary"
              variant="outlined"
              size="large"
              fullWidth
              style={{ marginTop: "16px" }}
              onClick={() => {
                const res = window.confirm(
                  "Are you sure you have saved your api key? This is the only time you will be able to see it."
                );
                if (res) {
                  window.location.href = apiConfig.docsUrl;
                }
              }}
            >
              SEE DOCUMENTATION
            </Button>
          </Fragment>
        );
    }
  };

  return (
    <div className={classes.container}>
      {loading ? (
        <Paper elevation={5} className={classes.loadingdialog}>
          <NettuProgress duration={2} onDone={() => console.log("")} />
        </Paper>
      ) : (
        <Paper
          elevation={5}
          className={clsx(classes.dialog, {
            [classes.paperSuccess]: page === "success",
          })}
        >
          {displayCurrentPage()}
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            open={snackbarState.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSnackbar}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <div
              className={clsx(classes.snackbar, {
                [classes.snackbarError]: !snackbarState.success,
                [classes.snackbarSuccess]: snackbarState.success,
              })}
            >
              <Typography>{snackbarState.message}</Typography>
            </div>
          </Snackbar>
        </Paper>
      )}
    </div>
  );
};

export default withRouter(CreateAccountPage);

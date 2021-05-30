import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateAccountPage from "./CreateAccountPage";
import LandingPage from "./LandingPage";
import { MeetingFlowPage } from "./MeetingFlow";

export const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          render={(cProps) => <MeetingFlowPage {...cProps} />}
          path="/meeting/:meetingId"
        />
        <Route path="/create" component={CreateAccountPage} />
        <Route path="/" component={LandingPage} />
      </Switch>
    </BrowserRouter>
  );
};

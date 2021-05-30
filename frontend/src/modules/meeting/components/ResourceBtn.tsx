import { Badge, IconButton } from "@material-ui/core";
import { FileCopyOutlined } from "@material-ui/icons";
import { useResourceDrawer } from "../state/resourceDrawer";

interface Props {}

export const ResourceBtn = (props: Props) => {
  const { toggle, unseenCount } = useResourceDrawer();

  return (
    <IconButton onClick={() => toggle()}>
      <Badge badgeContent={unseenCount} color="primary">
        <FileCopyOutlined />
      </Badge>
    </IconButton>
  );
};

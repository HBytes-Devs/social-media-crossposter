import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { PRODUCT_VERSION, getVersionLabel } from "../../lib/productVersion";

type Props = {
  compact?: boolean;
};

const channelColor: Record<string, "warning" | "info" | "success" | "default"> = {
  alpha: "warning",
  beta: "warning",
  rc: "info",
  stable: "success",
};

export function VersionBadge({ compact = false }: Props) {
  const tooltip = [
    PRODUCT_VERSION.product,
    `Release: ${PRODUCT_VERSION.releaseDate}`,
    `Codename: ${PRODUCT_VERSION.codename}`,
    `API: ${PRODUCT_VERSION.apiVersion}`,
    `Status: ${PRODUCT_VERSION.status}`,
  ].join(" · ");

  if (compact) {
    return (
      <Tooltip title={tooltip} arrow>
        <Chip
          size="small"
          label={getVersionLabel()}
          color={channelColor[PRODUCT_VERSION.channel] ?? "default"}
          variant="outlined"
          sx={{ fontSize: 10, height: 22 }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip} arrow>
      <Typography variant="caption" color="text.secondary" component="span">
        {getVersionLabel()}
      </Typography>
    </Tooltip>
  );
}

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Card } from "./Card";
import { PageState, type PageStateVariant } from "./PageState";

type Props = {
  variant: PageStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  cardTitle?: string;
  cardDescription?: string;
};

export function PageStateScreen({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  cardTitle,
  cardDescription,
}: Props) {
  return (
    <Box sx={{ mx: "auto", maxWidth: 720 }}>
      {(cardTitle || cardDescription) && (
        <Box sx={{ mb: 3 }}>
          {cardTitle && (
            <Typography variant="h4" fontWeight={800}>
              {cardTitle}
            </Typography>
          )}
          {cardDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {cardDescription}
            </Typography>
          )}
        </Box>
      )}

      <Card>
        <PageState
          variant={variant}
          title={title}
          description={description}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </Card>
    </Box>
  );
}

import { useNavigate } from "react-router-dom";
import { PageStateScreen } from "../components/ui/PageStateScreen";

export function WorkingOnItPage() {
  const navigate = useNavigate();

  return (
    <PageStateScreen
      variant="working-on-it"
      cardTitle="Working on it"
      cardDescription="Development in progress"
      title="We're building this"
      description="Engineering team is actively working on this section. Check back soon for updates."
      actionLabel="Go to posts"
      onAction={() => navigate("/posts")}
    />
  );
}

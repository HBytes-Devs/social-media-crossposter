import { useNavigate } from "react-router-dom";
import { PageStateScreen } from "../components/ui/PageStateScreen";

export function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <PageStateScreen
      variant="coming-soon"
      cardTitle="Coming soon"
      cardDescription="Naya feature jald launch hoga"
      title="Feature coming soon"
      description="Hum is feature par kaam kar rahe hain. Jab ready hoga, yahan se use kar paoge."
      actionLabel="Back to compose"
      onAction={() => navigate("/")}
    />
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { AppThemeProvider } from "./theme/AppThemeProvider";
import { UiLanguageProvider } from "./i18n/UiLanguageProvider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <UiLanguageProvider>
          <App />
        </UiLanguageProvider>
      </AppThemeProvider>
    </Provider>
  </StrictMode>,
);

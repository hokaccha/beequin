import type { FC } from "react";
import { Main } from "./Main";
import { AppContext, useAppState } from "~/lib/useAppState";

export const App: FC = () => {
  const appContextValue = useAppState();

  return (
    <AppContext.Provider value={appContextValue}>
      <Main />
    </AppContext.Provider>
  );
};

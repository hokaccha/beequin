import produce from "immer";
import type { Dispatch } from "react";
import { useCallback, useContext, createContext, useReducer } from "react";
import type { Query } from "./query";
import { createQuery } from "./query";
import type { Project } from "~/../main/project/project";

type ProjectWithQuery = Project & {
  queries: Query[];
  currentQueryId: string | null;
};

type AppState = {
  projects: ProjectWithQuery[];
  currentProjectId: string | null;
};

type Action =
  | { type: "restoreProject"; projects: ProjectWithQuery[]; currentProjectUuid: string | null }
  | { type: "createProject"; project: Project }
  | { type: "updateProject"; project: Project }
  | { type: "deleteProject"; projectUuid: string }
  | { type: "selectProject"; projectUuid: string | null }
  | { type: "createQuery" }
  | { type: "updateQuery"; queryId: string; query: Partial<Query> }
  | { type: "deleteQuery"; queryId: string }
  | { type: "selectQuery"; queryId: string };

const initialState: AppState = {
  projects: [],
  currentProjectId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "restoreProject": {
      return produce(state, (draft) => {
        draft.projects = action.projects;
        draft.currentProjectId = action.currentProjectUuid;
      });
    }
    case "createProject": {
      return produce(state, (draft) => {
        draft.projects.push({ queries: [], currentQueryId: null, ...action.project });
      });
    }
    case "updateProject": {
      return produce(state, (draft) => {
        const project = draft.projects.find((p) => p.uuid === action.project.uuid);
        if (project == null) return;
        Object.assign(project, action.project);
      });
    }
    case "deleteProject": {
      return produce(state, (draft) => {
        draft.projects = draft.projects.filter((p) => p.uuid !== action.projectUuid);
      });
    }
    case "selectProject": {
      return produce(state, (draft) => {
        draft.currentProjectId = action.projectUuid;
      });
    }
    case "createQuery": {
      return produce(state, (draft) => {
        const currentProject = draft.projects.find((p) => p.uuid === state.currentProjectId);
        if (currentProject == null) return;

        const newQuery = createQuery();
        currentProject.queries.push(newQuery);
        currentProject.currentQueryId = newQuery.id;
      });
    }
    case "updateQuery": {
      return produce(state, (draft) => {
        const currentProject = draft.projects.find((p) => p.uuid === state.currentProjectId);
        const query = currentProject?.queries.find((q) => q.id === action.queryId);
        if (query == null) return;

        Object.assign(query.state, action.query);
      });
    }
    case "deleteQuery": {
      return produce(state, (draft) => {
        const currentProject = draft.projects.find((p) => p.uuid === state.currentProjectId);
        if (currentProject == null) return;

        currentProject.queries = currentProject.queries.filter((q) => q.id !== action.queryId);
      });
    }
    case "selectQuery": {
      return produce(state, (draft) => {
        const currentProject = draft.projects.find((p) => p.uuid === state.currentProjectId);
        if (currentProject == null) return;

        currentProject.currentQueryId = action.queryId;
      });
    }
    default: {
      return state;
    }
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}

type AppContextType = {
  state: AppState;
  dispatch: Dispatch<Action>;
};

export const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {
    throw new Error("AppContext is not initialized");
  },
});

export function useAppContext() {
  const { state, dispatch } = useContext(AppContext);

  const restoreProject = useCallback(
    (projects: ProjectWithQuery[], currentProjectUuid: string | null) => {
      dispatch({ type: "restoreProject", projects, currentProjectUuid });
    },
    [dispatch]
  );

  const getCurrentProject = useCallback(() => {
    const project = state.projects.find((p) => p.uuid === state.currentProjectId) || null;
    return project;
  }, [state.projects, state.currentProjectId]);

  const setCurrentProject = useCallback(
    (id: string | null) => {
      dispatch({ type: "selectProject", projectUuid: id });
    },
    [dispatch]
  );

  const getCurrentProjectQueries = useCallback((): Query[] => {
    const project = getCurrentProject();
    return project?.queries ?? [];
  }, [getCurrentProject]);

  const getCurrentQuery = useCallback(() => {
    const project = getCurrentProject();
    const queries = getCurrentProjectQueries();

    if (project === null) {
      return queries[0] ?? null;
    }

    return queries.find((q) => q.id === project.currentQueryId) ?? null;
  }, [getCurrentProject, getCurrentProjectQueries]);

  const setCurrentQuery = useCallback(
    (id: string) => {
      dispatch({ type: "selectQuery", queryId: id });
    },
    [dispatch]
  );

  const createQuery = useCallback(() => {
    dispatch({ type: "createQuery" });
  }, [dispatch]);

  return {
    restoreProject,
    getCurrentProject,
    setCurrentProject,
    getCurrentProjectQueries,
    getCurrentQuery,
    setCurrentQuery,
    createQuery,
  };
}

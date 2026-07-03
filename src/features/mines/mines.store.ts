import { createIdbStore } from "#/shared/createIdbStore";
import { patchUp } from "#/shared/minesBus";
import type { Mine } from "#/shared/minesBus";

type Store = {
  history: Mine[][];
  historyIDX: number;
};

type Action = {
  addMine: (mine: Mine) => void;
  setHistoryIDX: (idx: number) => void;
  reset: () => void;
};

export const useMinesStore = createIdbStore<Store & Action>("mines", (set) => ({
  history: [],
  historyIDX: 0,

  addMine: (mine) => {
    set((state) => {
      const history = structuredClone(state.history);
      history[state.historyIDX] ??= [];
      history[state.historyIDX].push(mine);
      return { history };
    });
  },

  setHistoryIDX: (historyIDX) => set({ historyIDX }),

  reset: () => set({ history: [] }),
}));

useMinesStore.subscribe((state, prev) => {
  if (state.history !== prev.history) patchUp({ history: state.history });
});

useMinesStore.persist.onFinishHydration((state) => {
  patchUp({ history: state.history });
});

import { create } from "zustand";
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

export const useMinesStore = create<Store & Action>((set) => ({
  history: [],
  historyIDX: 0,

  addMine: (mine) => {
    set((state) => {
      const history = structuredClone(state.history);
      history[state.historyIDX] ??= [];
      history[state.historyIDX].push(mine);
      patchUp({ history });
      return { history };
    });
  },

  setHistoryIDX: (historyIDX) => set({ historyIDX }),

  reset: () => {
    set({ history: [] });
    patchUp({ history: [] });
  },
}));

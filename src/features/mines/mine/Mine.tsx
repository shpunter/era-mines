import type { Mine as TMine } from "#/shared/minesBus";
import { useMinesStore } from "../mines.store";
import css from "./mine.module.css";

const BASE = import.meta.env.BASE_URL;

const MINE_ASSET_PATHS: Record<TMine, string> = {
  gold: `${BASE}img/mines/gold_mine.webp`,
  wood: `${BASE}img/mines/wood_mine.webp`,
  ore: `${BASE}img/mines/ore_mine.webp`,
  gem: `${BASE}img/mines/gem_mine.webp`,
  crystals: `${BASE}img/mines/crystal_mine.webp`,
  mercury: `${BASE}img/mines/mercury_mine.webp`,
};

const MULTIPLIER_MAP = {
  gold: 1000,
  ore: 2,
  wood: 2,
  crystals: 1,
  gem: 1,
  mercury: 1,
} as const;

const Mine = ({ type, onClick }: { type: TMine; onClick: () => void }) => {
  const historyIDX = useMinesStore((state) => state.historyIDX);
  const currentMines = useMinesStore((state) => {
    const currentMinesList = state.history[historyIDX] ?? [];
    let mineCount = 0;

    for (let i = 0; i < currentMinesList.length; i++) {
      if (currentMinesList[i] === type) {
        mineCount++;
      }
    }

    return mineCount * MULTIPLIER_MAP[type];
  });

  return (
    <div
      onClick={onClick}
      className={css.container}
      data-testid={`mine-${type}`}
    >
      <img
        alt={type}
        src={MINE_ASSET_PATHS[type]}
        draggable={false}
        className={css.image}
      />
      <div className={css.text}>
        {type}: {currentMines > 0 ? `+${currentMines}` : 0}
      </div>
    </div>
  );
};

export default Mine;

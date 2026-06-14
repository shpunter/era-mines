import { useEffect } from "react";
import Mines from "#/features/mines/Mines";
import { emit, events$, state$ } from "#/shared/minesBus";
import { useObservable } from "#/shared/useObservable";
import { useMinesStore } from "#/features/mines/mines.store";
import "./index.css";

export default function App() {
  const setHistoryIDX = useMinesStore((state) => state.setHistoryIDX);
  const reset = useMinesStore((state) => state.reset);
  const { down } = useObservable(state$, state$.getValue());

  useEffect(() => {
    setHistoryIDX(down.historyIDX);
  }, [down.historyIDX, setHistoryIDX]);

  useEffect(() => {
    emit({ type: "mines:ready" });
  }, []);

  useEffect(() => {
    const sub = events$.subscribe((e) => {
      if (e.type === "mines:reset-all") reset();
    });
    return () => sub.unsubscribe();
  }, [reset]);

  return <Mines />;
}

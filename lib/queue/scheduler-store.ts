import { create } from "zustand";

type SchedulerState = {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
};

export const useSchedulerStore = create<SchedulerState>((set) => ({
  selectedPlatform: "tiktok",
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
}));

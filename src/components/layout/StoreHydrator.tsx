"use client";

import { useEffect } from "react";
import { useGraveyard } from "@/lib/store";

export function StoreHydrator() {
  useEffect(() => {
    useGraveyard.persist.rehydrate();
  }, []);
  return null;
}

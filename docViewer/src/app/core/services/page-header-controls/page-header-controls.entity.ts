import { Signal, WritableSignal } from "@angular/core";

export interface IPageHeaderControl {
  type: "button" | "span";
  content: WritableSignal<string> | Signal<string>;
  onClick?: (event: Event) => void;
}

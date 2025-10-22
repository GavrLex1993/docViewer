import { Signal } from "@angular/core";

export interface IPageHeaderControl {
  type: "button" | "span";
  content: Signal<string>;
  onClick?: (event: Event) => void;
}

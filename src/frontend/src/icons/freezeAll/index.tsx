import React, { forwardRef } from "react";
import SvgFreezeAll from "./freezeAll";
("./freezeAll.jsx");

export const freezeAllIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{ className?: string }>
>((props, ref) => {
  return <SvgFreezeAll ref={ref} className={props.className || ""} {...props} />;
});

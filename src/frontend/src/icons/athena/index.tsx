import React, { forwardRef } from "react";
//@ts-ignore
import { AthenaComponent } from "./athena";

export const AthenaIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{ className?: string }>
>((props, ref) => {
  return <AthenaComponent ref={ref} className={props.className || ""} {...props} />;
});

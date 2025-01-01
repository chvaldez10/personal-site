declare module "react-bubble-ui" {
  import { ComponentType, ReactNode } from "react";

  interface BubbleUIOptions {
    size?: number;
    minSize?: number;
    gutter?: number;
    numCols?: number;
    yRadius?: number;
    xRadius?: number;
    cornerRadius?: number;
    fringeWidth?: number;
    gravitation?: number;
    showGuides?: boolean;
    compact?: boolean;
    provideProps?: boolean;
  }

  interface BubbleUIProps {
    options: BubbleUIOptions;
    className?: string;
    children?: ReactNode;
  }

  const BubbleUI: ComponentType<BubbleUIProps>;

  export default BubbleUI;
}

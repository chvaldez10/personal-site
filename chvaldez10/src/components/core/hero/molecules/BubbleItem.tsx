import { FC } from "react";
import Image from "next/image";

interface BubbleItemProps {
  data: {
    key: string;
    src: string;
    alt: string;
  };
}

const BubbleItem: FC<BubbleItemProps> = ({ data }) => {
  return (
    <div className="bubbleItem">
      <Image src={data.src} alt={data.alt} width={100} height={100} />
      <p>{data.alt}</p>
    </div>
  );
};

export default BubbleItem;

import React from "react";
import Image from "next/image";

interface ChildComponentProps {
  data: {
    key: string;
    src: string;
    alt: string;
  };
}

const ChildComponent: React.FC<ChildComponentProps> = ({ data }) => {
  return (
    <div className="childComponent">
      <Image src={data.src} alt={data.alt} width={100} height={100} />
      <p>{data.alt}</p>
    </div>
  );
};

export default ChildComponent;

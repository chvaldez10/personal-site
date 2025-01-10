"use client";

/* 
  This is a layout component that switches between different containers using breadcrumbs.
  This is a component that you need to copy and paste into your project if you need to switch between different containers using breadcrumbs.
  TODO: Make this more reusable if needed.
*/

import { useState } from "react";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadCrumbWithChangingContainers() {
  const [activeContainer, setActiveContainer] = useState(0);
  const containers = [
    <div key={1} className="bg-white shadow rounded-lg p-6">
      Container 1
    </div>,
    <div key={2} className="bg-white shadow rounded-lg p-6">
      Container 2
    </div>,
    <div key={3} className="bg-white shadow rounded-lg p-6">
      Container 3
    </div>,
  ];

  return (
    <div className="min-h-screen p-4">
      <BreadcrumbWithCustomSeparator setActiveContainer={setActiveContainer} />
      <div className="mt-4">{containers[activeContainer]}</div>
    </div>
  );
}

function BreadcrumbWithCustomSeparator({
  setActiveContainer,
}: {
  setActiveContainer: (index: number) => void;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Container 1 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(0)}>
            Container 1
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>

        {/* Container 2 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(1)}>
            Container 2
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>

        {/* Container 3 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(2)}>
            Container 3
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

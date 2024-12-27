// chvaldez10/src/components/core/hero/JapaneseStoreFront.tsx
import React from "react";

const JapaneseStoreFront: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--brand-secondary-100)] p-8">
      {/* Roof */}
      <div className="w-full h-16 bg-gray-700 mb-4"></div>

      {/* Main Store */}

      <div className="w-full  grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vending Machine */}
        <div className="md:block hidden col-span-1 bg-blue-500"></div>

        {/* Inside of the store */}
        <div className="col-span-2 w-full bg-white shadow-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Row 1 */}
            <div className="bg-red-300 h-24"></div>
            <div className="bg-green-300 h-24"></div>
            <div className="bg-yellow-300 h-24"></div>

            {/* Row 2 */}
            <div className="bg-purple-300 h-24"></div>
            <div className="bg-pink-300 h-24"></div>
            <div className="bg-indigo-300 h-24"></div>

            {/* Row 3 */}
            <div className="bg-teal-300 h-24"></div>
            <div className="bg-orange-300 h-24"></div>
            <div className="bg-gray-300 h-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JapaneseStoreFront;

import React from "react";
import styles from "./JapaneseStoreFront.module.css";

const JapaneseStoreFront: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center bg-[var(--brand-secondary-100)]">
      <div className="w-10/12 py-8">
        <StoreRoof />

        {/* Main Store */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vending Machine */}
          <div className="md:block hidden col-span-1 bg-blue-500 p-2">
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-red-300 h-8"></div>
              <div className="bg-green-300 h-8"></div>
              <div className="bg-yellow-300 h-8"></div>
              <div className="bg-purple-300 h-8"></div>
              <div className="bg-pink-300 h-8"></div>
              <div className="bg-indigo-300 h-8"></div>
            </div>
            <div className="bg-gray-800 h-4 mt-2"></div>
            <div className="bg-gray-600 h-4 mt-1"></div>
          </div>

          {/* Inside of the store */}
          <div className="col-span-2 w-full bg-white shadow-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-300 h-24"></div>
              <div className="bg-gray-400 h-24"></div>
              <div className="bg-gray-500 h-24"></div>
              <div className="bg-gray-300 h-24"></div>
              <div className="bg-gray-400 h-24"></div>
              <div className="bg-gray-500 h-24"></div>
              <div className="bg-gray-300 h-24"></div>
              <div className="bg-gray-400 h-24"></div>
              <div className="bg-gray-500 h-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JapaneseStoreFront;

const StoreRoof = () => {
  return (
    // 7 / 11 Roof
    <div className={`w-full h-24 mb-4 bg-white rounded-sm relative`}>
      <div className={`flex flex-col gap-1 ${styles.storeBanner}`}>
        <div className="h-8 bg-orange-500 rounded-sm"></div>
        <div className="h-8 bg-red-500 rounded-sm"></div>
        <div className="h-8 bg-green-500 rounded-sm"></div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 -mb-2 bg-black opacity-20 rounded-sm"></div>
    </div>
  );
};

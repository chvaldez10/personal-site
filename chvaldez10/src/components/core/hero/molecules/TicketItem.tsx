import { FC } from "react";

const TicketItem: FC = () => {
  return (
    <div className="flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden h-48 w-full bg-gradient-to-b from-gray-200 to-gray-400">
      {/* Barcode */}

      {/* Logo */}
      <div className="flex flex-col justify-center items-center bg-red-500 w-full md:w-1/4 text-center text-white p-2">
        <div className="w-full transform -rotate-90 font-bold text-xs md:text-base">
          {" "}
          Showpass{" "}
        </div>
      </div>

      {/* event details */}
      <div className="flex flex-col justify-center items-start p-4 w-full md:w-3/4 bg-white text-gray-800">
        <div className="text-left">
          <h2 className="text-lg font-bold">Super Cool Event</h2>
          <p className="text-sm">Date: 01/01/2025</p>
          <p className="text-sm">Location: Super Cool Venue</p>
        </div>
      </div>
    </div>
  );
};

export default TicketItem;

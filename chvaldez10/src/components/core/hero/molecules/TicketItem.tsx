import { FC } from "react";
import { FaBarcode } from "react-icons/fa";

// Calculate the date 7 days from today
const getDateSevenDaysFromNow = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);
  return futureDate.toLocaleDateString();
};

const TicketItem: FC = () => {
  return (
    <div className="flex flex-row rounded-lg shadow-lg overflow-hidden h-48 w-full">
      {/* Barcode */}
      <div className="flex flex-col justify-center items-center text-center text-gray-800 px-2">
        <div className="w-full transform -rotate-90">
          <FaBarcode className="text-7xl" />
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-col justify-center items-center bg-red-500 text-center text-white">
        <div className="-rotate-90 font-bold text-base md:text-xl">
          Showpass
        </div>
      </div>

      {/* Event details */}
      <div className="flex flex-col justify-center items-start p-4 bg-white text-gray-800">
        <div className="text-left">
          <h2 className="text-lg font-bold">Super Cool Event</h2>
          <p className="text-sm">Date: {getDateSevenDaysFromNow()}</p>
          <p className="text-sm">Location: Super Cool Venue</p>
        </div>
      </div>
    </div>
  );
};

export default TicketItem;

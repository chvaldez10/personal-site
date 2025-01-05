import { FC } from "react";
import Image from "next/image";
import { FaBarcode } from "react-icons/fa";
import "./thermal-ticket.css";

// Calculate the date 7 days from today
const getDateSevenDaysFromNow = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);
  return futureDate.toLocaleDateString();
};

const TicketItem: FC = () => {
  return (
    <div className="flex flex-row rounded-lg shadow-lg overflow-hidden h-48 w-full relative">
      {/* Barcode */}
      <div className="flex-items-center text-gray-800 px-2">
        <div className="w-full transform -rotate-90">
          <FaBarcode className="text-4xl md:text-6xl" />
        </div>
      </div>

      {/* Scan line */}
      <div className="scan-line"></div>

      {/* Logo */}
      <div className="flex-items-center bg-red-500">
        <div className="w-full transform -rotate-90">
          <Image
            src="/logos/showpass-white.svg"
            alt="Showpass Logo"
            width={75}
            height={75}
          />
        </div>
      </div>

      {/* Event details */}
      <div className="flex-items-center p-4 w-3/4 bg-white text-gray-800">
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

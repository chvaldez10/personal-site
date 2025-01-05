import { FC } from "react";
import Image from "next/image";
import { FaBarcode } from "react-icons/fa";
import "./thermal-ticket.css";

// Calculate the date 7 days from today
const getDateSevenDaysFromNow = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);
  return futureDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const TicketItem: FC = () => {
  return (
    <div className="flex flex-row rounded-lg shadow-lg overflow-hidden h-36 md:h-48 w-full relative">
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
      <div className="flex flex-col justify-between p-4 w-full md:w-3/4 bg-white text-gray-800">
        <div>
          <p className="text-xs md:text-sm">Super Cool Venue</p>
          <h2 className="text-lg md:text-xl font-bold">Super Cool Event</h2>
          <p className="text-xs md:text-sm">
            {getDateSevenDaysFromNow()} @ 9:00 PM
          </p>
        </div>
        <div>
          <p className="text-xs md:text-sm">Super Cool Location</p>
        </div>
      </div>
    </div>
  );
};

export default TicketItem;

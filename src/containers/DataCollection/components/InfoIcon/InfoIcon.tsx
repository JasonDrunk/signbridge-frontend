import React from "react";
import { BiSolidInfoSquare } from "react-icons/bi";
import { IconContext } from "react-icons";
import "./InfoIcon.css";

interface InfoIconProps {
  onClick: () => void;
}

const InfoIcon: React.FC<InfoIconProps> = ({ onClick }) => {
  // Destructure onClick
  return (
    <IconContext.Provider value={{ color: "#000" }}>
      <BiSolidInfoSquare className="dataForm-info" onClick={onClick} />
    </IconContext.Provider>
  );
};

export default InfoIcon;

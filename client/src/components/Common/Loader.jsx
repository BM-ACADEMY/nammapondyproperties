import React from "react";
import { Spin } from "antd";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-white bg-opacity-80 z-50">
      <Spin size="large" />
    </div>
  );
};

export default Loader;

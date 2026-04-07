import React, { useState } from "react";
import { Modal } from "antd";
import { ListTodo, ArrowRight, ClipboardPlus } from "lucide-react";
import PostRequirementForm from "./PostRequirementForm";

const PostRequirementCard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div 
        onClick={showModal}
        className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200"
      >
        {/* Decorative elements */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-150 group-hover:bg-blue-100/50" />
        
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-[#166aa8] rounded-lg group-hover:bg-[#166aa8] group-hover:text-white transition-colors duration-300">
            <ClipboardPlus size={22} />
          </div>
          
          <div>
            <h3 className="text-[17px] font-bold text-slate-800 mb-1 group-hover:text-[#166aa8] transition-colors">
              Can't Find Your Property?
            </h3>
            <p className="text-[13px] text-slate-500 leading-snug pr-4">
              Post your requirement and let our experts find the perfect match for you.
            </p>
          </div>
          
          <div className="flex items-center text-[13px] font-semibold text-[#166aa8] mt-1 group-hover:gap-2 transition-all">
            <span>Post Requirement</span>
            <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#166aa8] flex items-center justify-center">
              <ClipboardPlus size={18} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 m-0">Post Your Requirement</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Fill in the details below and we'll help you find your dream property.</p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={720}
        centered
        className="requirement-modal"
        destroyOnClose
      >
        <PostRequirementForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Modal>
    </>
  );
};

export default PostRequirementCard;

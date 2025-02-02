import React, { useState, useEffect } from 'react';
import { XIcon, UserPlusIcon, CheckIcon, LoaderIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadModal = ({ isOpen, onClose, onSubmit, lead }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    status: 'cold'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form when lead changes or modal opens/closes
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        companyName: lead.companyName || '',
        status: lead.status || 'cold'
      });
    } else {
      // Reset form when creating a new lead
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        status: 'cold'
      });
    }
    // Reset submission states
    setIsSubmitting(false);
    setSubmitSuccess(false);
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate async submission
      await onSubmit(formData);
      
      // Show success state
      setSubmitSuccess(true);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      // Handle error (you might want to add error state management)
      setIsSubmitting(false);
      console.log('Submission failed', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="bg-gray-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <UserPlusIcon className="w-8 h-8" />
            <h2 className="text-2xl font-bold">
              {lead ? 'Update Lead' : 'Create New Lead'}
            </h2>
          </div>
        </div>

        {/* Submission Success Overlay */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500 rounded-2xl flex flex-col justify-center items-center z-20"
            >
              <CheckIcon className="w-24 h-24 text-white" />
              <p className="text-xl text-white mt-4">Lead Saved Successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className={`p-6 space-y-4 ${isSubmitting || submitSuccess ? 'opacity-30' : 'opacity-100'}`}
        >
          {/* Input Fields with Creative Styling */}
          <div className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text' },
              { name: 'email', label: 'Email Address', type: 'email' },
              { name: 'phone', label: 'Phone Number', type: 'tel' },
              { name: 'companyName', label: 'Company Name', type: 'text' }
            ].map(({ name, label, type }) => (
              <div key={name} className="relative">
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  placeholder={label}
                  className="peer w-full border-b-2 border-gray-300 focus:border-blue-500 
                    transition-colors duration-300 bg-transparent 
                    px-2 py-3 text-gray-800 outline-none"
                />
                <div 
                  className="absolute bottom-0 left-0 h-0.5 w-full 
                    bg-black 
                    scale-x-0 peer-focus:scale-x-100 
                    transition-transform duration-300"
                ></div>
              </div>
            ))}

            {/* Status Dropdown with Creative Styling */}
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full appearance-none border-b-2 border-gray-300 
                  focus:border-blue-500 transition-colors duration-300 
                  bg-transparent px-2 py-3 text-gray-800 outline-none"
              >
                <option value="cold">Cold Lead</option>
                <option value="hot">Hot Lead</option>
                <option value="closed">Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button with Loading State */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-800 
                text-white py-3 rounded-lg hover:opacity-90 
                transition-all duration-300 flex items-center 
                justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{lead ? 'Update Lead' : 'Create Lead'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LeadModal;
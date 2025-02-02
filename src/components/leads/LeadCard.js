'use client'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import React from 'react'

const LeadCard = ({ lead, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 block md:hidden">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{lead.name}</h3>
                <span className={`
            px-2 py-1 rounded-full text-xs
            ${lead.status === 'cold' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                            lead.status === 'closed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'}
          `}>
                    {lead.status}
                </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
                <p>{lead.email}</p>
                <p>{lead.phone}</p>
                <p>Owner: {lead.leadOwner?.name || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <button onClick={() => onView(lead)} className="text-blue-500 hover:text-blue-700">
                        <Eye size={20} />
                    </button>
                    <button onClick={() => onEdit(lead)} className="text-green-500 hover:text-green-700">
                        <Edit2 size={20} />
                    </button>
                    <button onClick={() => onDelete(lead._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
export default LeadCard
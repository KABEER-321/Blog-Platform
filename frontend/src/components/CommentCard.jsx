import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Check, X, User } from 'lucide-react';

const CommentCard = ({ comment, onEdit, onDelete }) => {
  const { user: currentUser, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comment);
  const [saving, setSaving] = useState(false);

  const isOwner = currentUser && currentUser.user.id === comment.user;
  const isAdmin = role === 'Admin';
  const canDelete = isOwner || isAdmin;

  const handleSave = async () => {
    if (!editedText.trim() || editedText === comment.comment) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    const success = await onEdit(comment.id, editedText.trim());
    setSaving(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedText(comment.comment);
    setIsEditing(false);
  };

  const formattedDate = new Date(comment.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const placeholderImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';

  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 last:border-b-0 animate-fade-in items-start">
      
      {/* Profile image */}
      <img
        src={comment.user_image_url || placeholderImage}
        alt={comment.user_name}
        className="h-10 w-10 rounded-full object-cover border border-gray-100 shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholderImage;
        }}
      />

      <div className="flex-1 min-w-0">
        
        {/* Comment Header info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-black text-gray-950">{comment.user_name}</span>
            <span className="text-[11px] text-gray-400 font-semibold">{formattedDate}</span>
            {comment.is_edited && (
              <span className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-black text-indigo-700 uppercase tracking-wide">
                Edited
              </span>
            )}
          </div>

          {/* Action buttons (Edit/Delete) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Edit comment"
                className="p-1 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-650 transition-colors btn-active-press"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && !isEditing && (
              <button
                onClick={() => onDelete(comment.id)}
                aria-label="Delete comment"
                className="p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-650 transition-colors btn-active-press"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Content / Edit mode */}
        <div className="mt-1.5 text-sm text-gray-650 font-medium leading-relaxed break-words">
          {isEditing ? (
            <div className="mt-2 space-y-2.5">
              <textarea
                value={editedText}
                disabled={saving}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium"
                rows="2"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editedText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          ) : (
            <p>{comment.comment}</p>
          )}
        </div>

      </div>

    </div>
  );
};

export default CommentCard;

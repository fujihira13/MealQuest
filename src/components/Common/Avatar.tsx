import React from 'react';

export const Avatar: React.FC = () => {
  return (
    <div className="avatar">
      <div className="avatar-character">
        <div className="avatar-head">
          <div className="avatar-hair"></div>
          <div className="avatar-face">
            <div className="avatar-eyes">
              <div className="eye left-eye"></div>
              <div className="eye right-eye"></div>
            </div>
            <div className="avatar-mouth"></div>
          </div>
        </div>
        <div className="avatar-body">
          <div className="avatar-shirt"></div>
          <div className="avatar-arms">
            <div className="arm left-arm"></div>
            <div className="arm right-arm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useRef } from "react";

export default function ImageUpload({ onFileSelect, disabled }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className={`upload-box ${disabled ? "upload-box-disabled" : ""}`} onClick={handleClick}>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="upload-input-hidden"
        onChange={handleChange}
      />
      <p>Click to upload an image (JPEG/PNG, &lt; 5MB)</p>
    </div>
  );
}

import React from 'react';
import { FileViewer } from 'react-file-viewer';

const FloatingDocumentViewer = ({ documentUrl, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black">
      <div className="relative w-[30%] h-[70%] bg-white shadow-md rounded-lg">
        <div className="absolute top-2 right-2 cursor-pointer" onClick={onClose}></div>
        <div className="p-4">
          <FileViewer fileType="docx" filePath={documentUrl} errorComponent={<div>Unable to view this document</div>} />
        </div>
      </div>
    </div>
  );
};

export default FloatingDocumentViewer;

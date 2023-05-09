import React from 'react';
import { MuxUploaderDrop } from '@mux/mux-uploader-react';

type Props = {
  dragActive?: boolean | undefined,
};

const DragOverlay: React.FC<Props> = ({ children, dragActive }) => {
  if (!dragActive) {
    return <>{children}</>;
  }

  return (
    <>
      <MuxUploaderDrop overlay overlayText="Upload to stream.new" mux-uploader="uploader">
        {children}
      </MuxUploaderDrop>
      <style jsx global>{`
        mux-uploader-drop {
          padding: 0;
          border: 0;
          position: absolute;
          inset: 0;
        }
        mux-uploader-drop::part(heading),
        mux-uploader-drop::part(separator) {
          display: none;
        }
      `}
      </style>
    </>
  );
};

export default DragOverlay;

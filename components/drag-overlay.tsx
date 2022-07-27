import React from 'react';
import { MuxUploaderDrop } from '@mux/mux-uploader-react';
import { breakpoints } from '../style-vars';

type Props = {
  dragActive?: boolean | undefined,
};

const DragOverlay: React.FC<Props> = ({ children, dragActive }) => {
  if (!dragActive) {
    return <>{children}</>;
  }

  return (
    <>
      {/* TO-DO: Allow adjusting text styles with overlay. CSS vars? Bake into package CSS styles? (TD). */}
      <MuxUploaderDrop className="drag-overlay" overlay overlayText="Upload to stream.new" mux-uploader="uploader" style={{ position: 'static', 
          display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
      </MuxUploaderDrop>
      <style jsx>{`
        .drag-overlay {
          height: 100%;
          width: 100%;
          position: absolute;
          z-index: 1;
          background-color:  rgba(226, 253, 255, 0.95);
          transition: 0.5s;
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .drag-overlay h1 {
          font-size: 46px;
          line-height: 46px;
          text-align: center;
        }

        .drag-overlay.active {
          display: flex;
        }

        @media only screen and (min-width: ${breakpoints.md}px) {
          .drag-overlay h1 {
            font-size: 96px;
            line-height: 120px;
          }
        }
      `}
      </style>
    </>
  );
};

export default DragOverlay;

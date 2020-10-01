import Button from './button';

type Props = {
  onClick: () => void
  text: string
};

const AccessSkeletonFrame: React.FC<Props> = ({ onClick, text }) => {
  return (
    <div>
      <div className='video-box' />
      <div className='button'><Button type="button" fullW onClick={onClick}>{text}</Button></div>
      <style jsx>{`
        .video-box {
          background-color: white;
          width: 400px;
          height: 261px;
          border: 2px solid #CCC;
          margin: 0 auto;
          border-radius: 30px;
        }
        .button {
          top: -160px;
          position: relative;
          min-width: 440px;
        }
      `}
      </style>
    </div>
  );
};

export default AccessSkeletonFrame;

import Button from './button';

type Props = {
  onClick: () => void
  text: string
};

const AccessSkeletonFrame: React.FC<Props> = ({ onClick, text }) => {
  return (
    <div className='skeleton-frame'>
      <div className='video-box' />
      <div className='button'><Button type="button" onClick={onClick}>{text}</Button></div>
      <style jsx>{`
        .skeleton-frame {
          position: absolute;
          margin-top: 180px;
        }
        .video-box {
          background-color: white;
          width: 400px;
          height: 261px;
          border: 2px solid #CCC;
          margin: 0 auto;
        }
        .button {
          top: -160px;
          position: relative;
        }
      `}
      </style>
    </div>
  );
}

export default AccessSkeletonFrame;

import Spinner from './spinner';

/*
 *  Use this as a direct child of a <Layout /> component
 */
const FullpageSpinner: React.FC<NoProps> = () => {
  return (
    <div className="wrapper">
      <Spinner />
      <style jsx>{`
        .wrapper {
          justify-content: center;
          flex-direction: column;
          display: flex;
          flex-grow: 1;
        }
      `}
      </style>
    </div>
  );
};

export default FullpageSpinner;

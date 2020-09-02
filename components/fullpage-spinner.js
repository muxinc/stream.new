import Spinner from './spinner';

/*
 *  Use this as a direct child of a <Layout /> component
 */
export default function FullpageSpinner () {
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
}

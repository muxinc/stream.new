import { forwardRef } from 'react';

export default forwardRef(function Button ({ buttonLink, children, onClick, href, ...otherProps }, ref) { // eslint-disable-line prefer-arrow-callback
  return (
    <>
      {buttonLink ? <a {...otherProps} href={href} ref={ref} onClick={onClick}>{children}</a> : <button type="button" onClick={onClick} ref={ref} {...otherProps}>{children}</button>}
      <style jsx>{`
        button {
          cursor: pointer;
        }
        a {
          text-decoration: none;
          display: inline-block;
        }
        a, button {
          font-size: 26px;
          line-height: 33px;
          background: #fff;
          border: 2px solid #222222;
          padding: 10px 20px;
          border-radius: 50px;
        }
      `}
      </style>
    </>
  );
});

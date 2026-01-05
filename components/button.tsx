import { ReactNode, forwardRef, Ref } from 'react';

type Props = {
  buttonLink?: boolean;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  slot?: string;
  otherProps?: unknown;
  fullW?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  children: string | ReactNode;
};

type ButtonOrAnchor = Ref<HTMLButtonElement | HTMLAnchorElement>;

const Button = forwardRef<ButtonOrAnchor, Props>(
  function Button (props, ref) {
    const { buttonLink, type, children, onClick, href, fullW, disabled, ...otherProps } = props;
    return (
      <>
        {buttonLink
          ? <a {...otherProps} href={href} ref={ref as Ref<HTMLAnchorElement>} onClick={onClick}>{children}</a>
          : <button type={type || 'button'} onClick={onClick} ref={ref as Ref<HTMLButtonElement>} {...otherProps}>{children}</button>}
        <style jsx>{`
          button {
            cursor: pointer;
            width: ${fullW ? '100%' : 'auto'};
          }
          a {
            text-decoration: none;
            display: inline-block;
            mix-blend-mode: normal !important;
          }
          a, button {
            font-size: 26px;
            font-family: Akkurat;
            line-height: 33px;
            background: #fff !important;
            border: 2px solid ${disabled ? '#b0b0b0' : '#222222'};
            color: ${disabled ? '#b0b0b0' : '#222222'} !important;
            padding: 10px 20px;
            border-radius: 50px;
            transition: all 0.2s ease;
          }
          a:hover, button:hover {
            background: ${disabled ? '#fff' : '#222'} !important;
            color: ${disabled ? '#b0b0b0' : '#fff'} !important;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
          }
        `}
        </style>
      </>
    );
});

export default Button;

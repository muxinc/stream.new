interface Props {
  size?: number;
}

const Asterisk: React.FC<Props> = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28.1765 3.68164L17.8238 42.3187M3.68164 17.8238L42.3187 28.1765M17.8185 3.70145L28.1818 42.2989M8.87783 8.86333L37.1225 37.137M3.70145 28.1818L42.2989 17.8185M8.86333 37.1225L37.137 8.87783" stroke="#f8f8f8" strokeWidth="3" strokeMiterlimit="10" />
  </svg>
);

export default Asterisk;

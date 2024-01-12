import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import dotenv from 'dotenv';
import '@mux/mux-node/shims/node'

dotenv.config({ path: '.env.test' });

Enzyme.configure({ adapter: new Adapter() });

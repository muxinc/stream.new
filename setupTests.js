import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

Enzyme.configure({ adapter: new Adapter() });

import { Admin, Resource } from 'react-admin';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';
import { Dashboard } from './dashboard/Dashboard';
import { UserList } from './users/UserList';
import { UserShow } from './users/UserShow';
import { UserCreate } from './users/UserCreate';
import { OrderList } from './orders/OrderList';
import { OrderShow } from './orders/OrderShow';
import { OrderCreate } from './orders/OrderCreate';
import { OrderEdit } from './orders/OrderEdit';
import { ServiceList } from './services/ServiceList';
import { ServiceShow } from './services/ServiceShow';
import { ServiceCreate } from './services/ServiceCreate';
import { ServiceEdit } from './services/ServiceEdit';

export const App = () => (
  <Admin authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard}>
    <Resource
      name="admin/users"
      options={{ label: 'Users' }}
      icon={PeopleIcon}
      list={UserList}
      show={UserShow}
      create={UserCreate}
    />
    <Resource
      name="admin/orders"
      options={{ label: 'Orders' }}
      icon={ShoppingCartIcon}
      list={OrderList}
      show={OrderShow}
      create={OrderCreate}
      edit={OrderEdit}
    />
    <Resource
      name="admin/services"
      options={{ label: 'Services' }}
      icon={BuildIcon}
      list={ServiceList}
      show={ServiceShow}
      create={ServiceCreate}
      edit={ServiceEdit}
    />
  </Admin>
);

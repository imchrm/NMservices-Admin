import { Admin, Resource } from 'react-admin';
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

export const App = () => (
  <Admin authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard}>
    <Resource
      name="admin/users"
      list={UserList}
      show={UserShow}
      create={UserCreate}
    />
    <Resource
      name="admin/orders"
      list={OrderList}
      show={OrderShow}
      create={OrderCreate}
      edit={OrderEdit}
    />
  </Admin>
);

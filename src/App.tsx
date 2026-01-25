import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from '@arco-design/web-react';
import enUS from '@arco-design/web-react/es/locale/en-US';
import Page from '@demo/components/Page';
import store from '@demo/store';
import '@demo/styles/common.scss';
import { history } from './utils/history';
import Home from '@demo/pages/Home';
import Login from '@demo/pages/Login';
import Signup from '@demo/pages/Signup';
import Dashboard from '@demo/pages/Dashboard';
import CreateMagazine from '@demo/pages/CreateMagazine';
import DashboardLayout from '@demo/pages/Dashboard/Layout';
import AdminSettingsPage from '@demo/pages/Dashboard/AdminSettings';
import ContentPage from '@demo/pages/Content';
import ApprovalsPage from '@demo/pages/Approvals';

function App() {
  return (
    <ConfigProvider locale={enUS}>
      <Provider store={store}>
        <Page>
          <Suspense
            fallback={
              <div
                style={{
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  width='200px'
                  src='/loading'
                  alt=''
                />
                <p
                  style={{
                    fontSize: 24,
                    color: 'rgba(0, 0, 0, 0.65)',
                  }}
                >
                  Please wait a moment.
                </p>
              </div>
            }
          >
            <Router history={history}>
              <Switch>
                <Route
                  path='/'
                  exact
                  component={Login}
                />
                <Route
                  path='/signup'
                  exact
                  component={Signup}
                />
                <Route
                  path='/dashboard'
                  component={Dashboard}
                />
                <Route
                  path='/content'
                  component={ContentPage}
                />
                <Route
                  path='/approvals'
                  component={ApprovalsPage}
                />
                <Route
                  path='/admin-settings'
                  component={AdminSettingsPage}
                />
                <Route
                  path='/editor'
                  exact
                  component={Home}
                />
                <Route
                  path='/create-magazine'
                  exact
                  component={CreateMagazine}
                />
              </Switch>
            </Router>
          </Suspense>
        </Page>
      </Provider>
    </ConfigProvider>
  );
}

export default App;

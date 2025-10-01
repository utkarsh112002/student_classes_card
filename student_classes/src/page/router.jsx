import React from 'react';
import PropTypes from 'prop-types';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import Home from './Home';
import ClassesPage from './ClassPage';

// for more information on react router: https://v5.reactrouter.com/web/guides/quick-start

const RouterPage = (props) => {
    return (
        <Router basename={props.pageInfo.basePath}>
            <Switch>
                <Route path='/' exact>
                    <Home {...props} />
                </Route>
              <Route path='/class-page'>
                    <ClassesPage {...props} />
                </Route>
            </Switch>
        </Router>
    );
};

RouterPage.propTypes = {
    pageInfo: PropTypes.object
};

export default RouterPage;
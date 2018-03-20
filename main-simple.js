import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware, combineReducers } from 'redux'
import { connect } from 'react-redux';
import thunk from 'redux-thunk';
import { reducer as api, readEndpoint } from 'redux-json-api';
import { setAxiosConfig } from 'redux-json-api';
import { Button, ButtonToolbar } from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Badge from 'react-bootstrap/lib/Badge';



/*
    Configuration parameters
*/

var baseUrl = 'http://thomaxxl.pythonanywhere.com';
var collection_name = 'Users';
var collection_endpoint = collection_name + '/?page[limit]=100'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const reducer = combineReducers({
    api
});

const store = createStore(reducer, applyMiddleware(thunk))

store.dispatch(setAxiosConfig({
    baseURL: baseUrl,
    headers: {
        'Authorization': 'bearer' + Math.random(),
    }
}));

class ObjectList extends React.Component {
    componentWillMount() {
        store.dispatch(readEndpoint(collection_endpoint));
    }

    render() {
        return (
            <div>
            
            <Alert bsStyle="warning">
              <strong>Warning</strong> Alert
            </Alert>
            
            <Alert bsStyle="info">
                Info Alert
            </Alert>
            
            <Badge>Badge</Badge>

            <ul>
                {this.props.api_objects.data.map(api_object => (
                    <li key={api_object.id} ><pre>{JSON.stringify(api_object.attributes,null, 2)}</pre></li>
                ))}
            </ul>
            </div>
        );
    }
};

const mapStateToProps = (state) => {
    console.log(state) // Check the console to see how the state object changes as we read the API
    const api_objects = state.api[collection_name] || { data: [] };
    return {
        api_objects
    }
};

const ApiResults = connect(
    mapStateToProps
)(ObjectList)

ReactDOM.render(
    <ApiResults store={store} />,
    document.getElementById('api_objects')
);
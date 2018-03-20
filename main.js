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
import Table from 'react-bootstrap/lib/Table';

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


class ObjectTable extends React.Component {

    componentWillMount() {
        store.dispatch(readEndpoint(collection_endpoint));
    }

    render() {
        let column_names = [];
        let objects = this.props.api_objects.data;
        if(objects){
            /*
                We use the first object from the collection as a sample object so we can render 
                the attribute keys as column names
            */
            let sample_object = objects[0];
            if(sample_object && sample_object.attributes){
               column_names = Object.keys(sample_object.attributes) ;
            }
        }

        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                        <tr>
                            {column_names.map(col_name => 
                                <th key={col_name}>{ col_name }</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {this.props.api_objects.data.map(api_object => (
                            <ObjectRow api_object={api_object} key={api_object.id} />
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }
};


class ObjectRow extends React.Component {

    render() {
        return(
            <tr>
                {Object.keys(this.props.api_object.attributes).map(attr =>
                    <ObjectCol attribute={this.props.api_object.attributes[attr]} key={attr}/>
                    )}
            </tr>
        )
    }
}


class ObjectCol extends React.Component {

    render() {
        return(
            <td>{this.props.attribute}</td>
        )
    }
}


const mapStateToProps = (state) => {
    console.log(state) // Check the console to see how the state object changes as we read the API
    const api_objects = state.api[collection_name] || { data: [] };
    return {
        api_objects
    }
};

const ApiResults = connect(
    mapStateToProps
)(ObjectTable)

ReactDOM.render(
    <ApiResults store={store} />,
    document.getElementById('api_objects')
);

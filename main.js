import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { connect } from 'react-redux'
import thunk from 'redux-thunk'
import { reducer as api, readEndpoint } from 'redux-json-api'
import { setAxiosConfig } from 'redux-json-api'
import { Button, ButtonToolbar } from 'react-bootstrap/lib/Button'
import Alert from 'react-bootstrap/lib/Alert'
import Badge from 'react-bootstrap/lib/Badge'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Table from 'react-bootstrap/lib/Table'

const queryString = require('query-string')

/*
    Configuration parameters
*/


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const reducer = combineReducers({
    api
})

const store = createStore(reducer, applyMiddleware(thunk))

store.dispatch(setAxiosConfig({
    baseURL: baseUrl,
    headers: {
        'Authorization': 'bearer' + Math.random(),
    }
}))


class ObjectAction extends React.Component {

    render_action(object_id){
        return null
    }

    render(){
        return <span className="object-action"> {this.render_action(this.props.object_id)} </span>
    }
}


class DeleteAction extends ObjectAction {

    render_action(object_id){
        return <Glyphicon glyph="trash" />
    }   
}


class CreateAction extends ObjectAction {

    render_action(object_id){
        return <Glyphicon glyph="pencil" />
    }   
}


class ObjectTable extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            column_names : column_names,
            actions : [CreateAction, DeleteAction]
        }
    }

    componentWillMount() {
        store.dispatch(readEndpoint(collection_endpoint))   
    }

    componentDidUpdate(prevProps, prevState) {
        /*
            If the column_names have been set that means we don't need to set them again
            (otherwise we may run into recursion issues through setState<>componentDidUpdate)
        */
        if(!this.state.column_names.length){
            this.getColumnNames()
        }
    }

    getColumnNames(){
        let column_names = []
        let objects = this.props.api_objects.data
        if(objects){
            /*
                We use the first object from the collection as a sample object so we can render 
                the attribute keys as column names
            */
            let sample_object = objects[0]
            if(sample_object && sample_object.attributes){
               column_names = Object.keys(sample_object.attributes)
            }
        }
        if(column_names.length){
            this.setState({'column_names' : column_names})
        }
    }

    render_header(){
        return this.state.column_names.map(col_name => 
                                <th key={col_name}>{ col_name }</th>
               )
    }

    render_rows(){
        return this.props.api_objects.data.map(api_object =>
                            <ObjectRow api_object={api_object} 
                                       key={api_object.id} 
                                       parent={this} />
               )
    }

    render_action(action, object_id){
        const Action = action
        return <Action object_id={object_id} key={action}/>
    }

    render_actions(object_id){

        if(!this.state.actions){
            return null
        }

        let actions_col = <td>
                            {this.state.actions.map(action => 
                                this.render_action(action, object_id)
                            )}
                        </td>

        return actions_col
    }

    render() {

        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                        <tr>
                            {this.render_header()}
                        </tr>
                    </thead>

                    <tbody>
                        {this.render_rows()}
                    </tbody>
                </Table>
            </div>
        )
    }
}


class ObjectRow extends React.Component {

    render() {
        let column_names = this.props.parent.state.column_names
        return(
            <tr>
                {this.props.parent.render_actions(this.props.api_object.id)}
                {column_names.map(col_name => 
                    <ObjectCol attribute={this.props.api_object.attributes[col_name]} key={col_name}/>
                )}
            </tr>
        )
    }
}


class ObjectCol extends React.Component {

    render() {
        if (typeof this.props.attribute !== 'undefined' ) {
            return <td>{this.props.attribute}</td>
        }
        return null
    }
}


const mapStateToProps = (state) => {
    console.log(state) // Check the console to see how the state object changes as we read the API
    const api_objects = state.api[collection_name] || { data: [] }
    return {
        api_objects
    }
}

const ApiResults = connect(
    mapStateToProps
)(ObjectTable)

ReactDOM.render(
    <ApiResults store={store} />,
    document.getElementById('api_objects')
)

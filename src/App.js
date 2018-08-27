import React, { Component } from 'react';
import gql from 'graphql-tag';                                      // Necessary for parsing GraphQL queries
import { graphql, compose } from 'react-apollo';                    // View layer integration for React - helps to bind
import Paper from '@material-ui/core/Paper';                        // L4-11 - Styling libraries
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Form from './Form.js';

// graphql-tag parses this string so it can be read on front-end

// Types

const TodosQuery = gql`
    {
        todos {
            id
            text
            complete
        }
    }
`;

const UpdateMutation = gql`
    mutation($id: ID!, $complete: Boolean!) {
        updateTodo(id: $id, complete: $complete)
    }
`;

const RemoveMutation = gql`
    mutation($id: ID!) {
        removeTodo(id: $id)
    }
`;

const CreateTodoMutation = gql`
    mutation($text: String!) {
        createTodo(text: $text) {
            id
            text
            complete
        }
    }
`;

class App extends Component {

    updateTodo = async todo => {                                                // Update - this updates the db
        await this.props.updateTodo({
            variables: {
                id: todo.id,
                complete: !todo.complete
            },
            update: store => {                                                  // Updating checkbox (cache) - website
                // Read the data from our cache for this query.
                const data = store.readQuery({ query: TodosQuery });            // Read
                // Add our comment from the mutation to the end.
                data.todos = data.todos.map(
                    x =>
                        x.id === todo.id
                            ? {
                                ...todo,
                                complete: !todo.complete,
                            }
                            : x
                );
                // Write our data back to the cache.
                store.writeQuery({ query: TodosQuery, data });
            }
        });
    };

    removeTodo = async todo => {                                                // Delete
        await this.props.removeTodo({
            variables: {
                id: todo.id,
            },
            update: store => {
                // Read the data from our cache for this query.
                const data = store.readQuery({ query: TodosQuery });
                // Add our comment from the mutation to the end.
                data.todos = data.todos.filter(x => x.id !== todo.id)
                // Write our data back to the cache.
                store.writeQuery({ query: TodosQuery, data });
            }
        });
    }

    createTodo  = async text => {                                               // Create
        await this.props.createTodo({
            variables: {
                text,
            },
            update: (store, { data: { createTodo } })  => {                     // Updates page without refresh
                // Read the data from our cache for this query.
                const data = store.readQuery({ query: TodosQuery });
                // Add our comment from the mutation to the end.
                data.todos.unshift(createTodo);
                // Write our data back to the cache.
                store.writeQuery({ query: TodosQuery, data });
            }
        });
    }

    render() {
    const {
        data: {loading, todos}
    } = this.props;
    if (loading) {
        return null;
    }

      return <div style={{ display: 'flex'}}>
                <div style={{ margin: "auto", width: 400 }}>
                    <Paper elevation={1}>
                        <Form submit={this.createTodo} />
                        <List>
                            {todos.map(todo => (
                                <ListItem
                                    key={todo.id}
                                    role={undefined}
                                    dense
                                    button
                                    onClick={() => this.updateTodo(todo)}
                                >
                                    <Checkbox
                                        checked={todo.complete}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                    <ListItemText primary={todo.text} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => this.removeTodo(todo)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </div>
            </div>;
  }
}

export default compose(
    graphql(CreateTodoMutation, { name: "createTodo" }),
    graphql(RemoveMutation, { name: "removeTodo" }),
    graphql(UpdateMutation, { name: "updateTodo" }),
    graphql(TodosQuery)
)(App);

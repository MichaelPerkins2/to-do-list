import React from 'react';
import TextField from '@material-ui/core/TextField';
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

export default class Form extends React.Component {

    state = {
        text: '',
    }

    handleChange = e => {
        const newText = e.target.value;
        this.setState({
            text: newText
        });
    };

    handleKeyDown = e => {
        if (e.key === "Enter") {
            this.props.submit(this.state.text)
            this.setState({ text: "" });
        }
    };

    render() {
        const { text } = this.state;
        return (
            <Query
                query={TodosQuery}
                pollInterval={500}>
                {({ loading, error, data, networkStatus }) => {
                    if (networkStatus === 4) return "Refetching!";
                    if (loading) return null;
                    if (error) return `Error!: ${error}`;
                   return (
                    <TextField
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        label="To Do List..."
                        margin="normal"
                        value={text}
                        fullWidth/>

                   )
                }}
            </Query>

        );
    }
}


const TodosQuery = gql`
    {
        todos {
            id
            text
            complete
        }
    }
`;
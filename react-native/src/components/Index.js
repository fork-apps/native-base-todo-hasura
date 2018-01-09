import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {AsyncStorage, Alert} from 'react-native';
import {Text } from 'native-base';
import { fetchSession } from '../action';
import { fetchTodos } from '../hasuraApi';
import AuthScreen from './AuthScreen';
import Todo from './Todo';

export class Index extends React.Component {
  async componentDidMount() {
    try {
      var sessionJson = await AsyncStorage.getItem("@Todo:session")
      var session = await JSON.parse(sessionJson)
      console.log("Found Session")
      console.log(session);
      this.props.dispatch({type:'SET_SESSION', session})
      var resp = await fetchTodos(session.userId, session.token);
      console.log(resp);
      if (resp.status !== 200){
        if (resp.status === 503){
          Alert.alert("Network Error", "Please check your internet connection");
        } else {
          Alert.alert("Unauthorized", "Please login again");
        }
      } else {
        var respBody = await resp.json();
        console.log(respBody)
        this.props.dispatch({type:'SET_FETCHED_TODOS', todos: respBody});
      }
    }
    catch(err) {
      console.error(err);
      return err;
    }
  }

  render() {
    if (Object.keys(this.props.session).length === 0) {
      return (
        <AuthScreen />
      )
    }
    else {
      return (<Todo />)
    }
  }

}

Index.propTypes = {
  session: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    session: state.session,
    todos: state.todos
  };
}

export default connect(mapStateToProps)(Index);
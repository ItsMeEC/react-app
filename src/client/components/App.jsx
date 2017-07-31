import React, { Component } from 'react';
import { connect } from 'react-redux';
import shortid from 'shortid';
import { getBars, addGoing, authCheck } from '../actions';

import Bar from './Bar';

class App extends Component {
  constructor() {
    super();
    this.state = {
      search: '',
    };
  }

  componentDidMount() {
    if (!this.props.user) { this.props.authCheck(); }
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) { this.props.getBars(lastSearch); }
  }

  handleInput(event) {
    this.setState({
      search: event.target.value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    localStorage.setItem('lastSearch', this.state.search);
    this.props.getBars(this.state.search || 'London');
  }

  handleGoing(event) {
    const idx = event.target.name;
    const googleId = this.props.user.googleId;
    const check = this.props.bars[idx].going.indexOf(googleId);
    const bar = Object.assign({}, this.props.bars[idx]);

    if (check > -1) {
      bar.going.splice(check, 1);
    } else {
      bar.going.push(googleId);
    }

    this.props.addGoing(bar.id, bar.going);
  }

  render() {
    let bars = [];
    if (this.props.bars) {
      bars = this.props.bars.map((bar, idx) => (
        <Bar
          key={shortid.generate()}
          bar={bar}
          idx={idx}
          user={this.props.user}
          handleGoing={(e) => { this.handleGoing(e); }}
        />
      ));
    }

    return (
      <div>

        <header className="header">
          <h1 className="header__title">Nightlife</h1>
          <nav>
            <div className="header__controls">
              {!this.props.user && <a href="/auth/google"><button className="header__btn">LOG IN</button></a>}
              {this.props.user && <h3 className="header__username">{this.props.user.name.split(' ')[0]}</h3>}
              {this.props.user && <a href="/logout" onClick={() => localStorage.clear()}><button className="header__btn">LOG OUT</button></a>}
            </div>
          </nav>
        </header>

        <div className="search">
          <h1 className="search__title">Where do you want to go out?</h1>
          <form className="search__from">
            <input
              className="search__input"
              onChange={e => this.handleInput(e)}
              placeholder="London"
              value={this.state.search}
            />
            <button
              className="search__btn"
              onClick={e => this.handleSubmit(e)}
            >SEARCH</button>
          </form>
        </div>

        <main className="main">
          {this.props.fetching && <p>searching...</p>}
          <ul>
            {bars}
          </ul>
        </main>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  bars: state.bars,
  user: state.user,
  fetching: state.fetching,
});

const mapDispatchToProps = dispatch => ({
  addGoing: (bar, user) => dispatch(addGoing(bar, user)),
  authCheck: () => dispatch(authCheck()),
  getBars: location => dispatch(getBars(location)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

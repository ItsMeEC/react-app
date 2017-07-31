import React from 'react';

const Bar = props => (
  <li className="bar-li">
    <div className="bar-li__img" style={{ backgroundImage: `url(${props.bar.image_url})` }} />
    <div className="bar-li__info">
      <a className="bar-li__name" href={props.bar.url}><h3>{props.bar.name}</h3></a>
      <div className="bar-li__data">
        <div>Rating {props.bar.rating}/5</div>
        <div>Revews {props.bar.review_count}</div>
        <div>Price {props.bar.price}</div>
      </div>
    </div>

    {!props.user &&
      <a href="/auth/google">
        <button className="bar-li__btn">GOING <div className="bar__btn-going">{props.bar.going.length}</div></button>
      </a>}

    {props.user &&
      <button
        className="bar-li__btn"
        onClick={e => props.handleGoing(e)}
        name={props.idx}
      >GOING {props.bar.going.length}
      </button>}

  </li>
);

export default Bar;

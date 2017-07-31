import axios from 'axios';

export const getBars = location => (dispatch) => {
  dispatch({ type: 'FETCHING' });
  axios.get(`/getbars/${location}`)
    .then((res) => {
      const newBusinesses = res.data;

      axios.get('/api/bar')
        .then((savedResults) => {
          newBusinesses.forEach((newBiz, idx) => {
            newBusinesses[idx].going = [];
            savedResults.data.forEach((savedBiz) => {
              if (newBiz.id === savedBiz.id) {
                newBusinesses[idx].going = savedBiz.going;
              }
            });
          });

          dispatch({ type: 'GET_BARS', payload: newBusinesses });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
};

export const addGoing = (id, going) => (dispatch) => {
  axios.post(`/addGoing/${id}`, going)
    .then((res) => {
      dispatch({ type: 'ADD_GOING', payload: res.data });
    })
    .catch((err) => {
      throw err;
    });
};

export const authCheck = () => (dispatch) => {
  axios.get('/authcheck')
    .then((res) => {
      if (res.data) {
        dispatch({ type: 'ADD_AUTH', payload: res.data });
      }
    })
    .catch((err) => {
      throw err;
    });
};

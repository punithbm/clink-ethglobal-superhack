import { getStore } from '../store/GlobalStore';
import { ACTIONS, GlobalContext } from '../context/GlobalContext';

export const toastFlashMessage = (message: string | React.ReactElement, type: string, delay = 3000) => {
  const { dispatch } = getStore();
  dispatch({
    type: ACTIONS.CLEAR_TOAST,
    payload: {
      message: '',
      toastType: '',
    },
  });
  setTimeout(function () {
    dispatch({
      type: ACTIONS.SHOW_TOAST,
      payload: {
        message: message,
        toastType: type,
      },
    });
    setTimeout(function () {
      dispatch({
        type: ACTIONS.HIDE_TOAST,
        payload: {},
      });
    }, delay);
  }, 200);
};

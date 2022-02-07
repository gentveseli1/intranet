import {toast} from "react-toastify";

toast.configure();
const SuccessAlert = (props) => toast.success(`${props}!`, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
});

export default SuccessAlert;
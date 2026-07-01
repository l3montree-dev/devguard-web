import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

const TOASTER_ID = "devguard";

type ToastMessage = string | React.ReactNode;

function withId(data?: ExternalToast): ExternalToast {
  return { ...data, toasterId: TOASTER_ID };
}

const toast = Object.assign(
  (message: ToastMessage, data?: ExternalToast) =>
    sonnerToast(message, withId(data)),
  {
    success: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.success(message, withId(data)),
    error: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.error(message, withId(data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.warning(message, withId(data)),
    info: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.info(message, withId(data)),
    message: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.message(message, withId(data)),
    loading: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.loading(message, withId(data)),
    promise: sonnerToast.promise.bind(sonnerToast),
    custom: sonnerToast.custom.bind(sonnerToast),
    dismiss: sonnerToast.dismiss.bind(sonnerToast),
  },
);

export { toast, TOASTER_ID };

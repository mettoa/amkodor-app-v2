export const showBlockAlert = (message) => {
  Alert.alert(
    "Доступ запрещен",
    message ||
      "Ваш аккаунт заблокирован администратором. Для разблокировки обратитесь в службу поддержки.",
    [
      {
        text: "Понятно",
        style: "default",
      },
    ],
    { cancelable: false }
  );
};

export const isBlockError = (error) => {
  return (
    error.isBlockError ||
    error.response?.data?.is_blocked ||
    error.response?.data?.message?.includes("заблокирован") ||
    error.response?.data?.message?.includes("blocked") ||
    error.response?.data?.error === "User is blocked" ||
    error.response?.status === 403
  );
};

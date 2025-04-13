import { useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";

const useProfile = () => {
  const { user, token, updateUserProfile } = useContext(AuthContext);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        newPassword: "",
        confirmPassword: "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    } else if (profileData.username.length < 3) {
      newErrors.username = "Имя пользователя должно быть не менее 3 символов";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Некорректный email";
    }

    if (profileData.newPassword) {
      if (profileData.newPassword.length < 6) {
        newErrors.newPassword = "Пароль должен быть не менее 6 символов";
      }

      if (!profileData.confirmPassword) {
        newErrors.confirmPassword = "Подтвердите новый пароль";
      } else if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают";
      }

      if (!profileData.password) {
        newErrors.password =
          "Введите текущий пароль для подтверждения изменений";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        address: profileData.address,
      };

      if (profileData.newPassword) {
        updateData.currentPassword = profileData.password;
        updateData.newPassword = profileData.newPassword;
      }

      await api.put("/users/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (typeof updateUserProfile === "function") {
        updateUserProfile({
          ...user,
          username: profileData.username,
          email: profileData.email,
          address: profileData.address,
        });
      }

      Alert.alert("Успех", "Профиль успешно обновлен");
      setIsEditingProfile(false);

      setProfileData({
        ...profileData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(
        "Ошибка при обновлении профиля:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Ошибка",
        error.response?.data?.message || "Не удалось обновить профиль"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    profileData,
    errors,
    isSubmitting,
    isEditingProfile,
    setIsEditingProfile,
    handleInputChange,
    handleSubmitProfile,
  };
};

export default useProfile;

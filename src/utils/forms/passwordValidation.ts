export function validatePassword(value: string): true | string {
  const password = value.trim();

  if (!password) {
    return 'Введите пароль';
  }

  if (password.length < 8) {
    return 'Пароль должен содержать минимум 8 символов';
  }

  if (password.length > 128) {
    return 'Пароль должен содержать не более 128 символов';
  }

  if (!/[A-Za-zА-Яа-яЁё]/u.test(password)) {
    return 'Пароль должен содержать хотя бы одну букву';
  }

  if (!/\d/.test(password)) {
    return 'Пароль должен содержать хотя бы одну цифру';
  }

  if (/\s/.test(password)) {
    return 'Пароль не должен содержать пробелы';
  }

  return true;
}

export function validatePasswordConfirmation(password: string, confirmation: string): true | string {
  const confirmationValue = confirmation.trim();

  if (!confirmationValue) {
    return 'Подтвердите пароль';
  }

  if (password !== confirmationValue) {
    return 'Пароли не совпадают';
  }

  return true;
}
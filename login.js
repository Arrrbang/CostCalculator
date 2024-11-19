if (result.success) {
  window.location.href = 'MAPS.html';  // 새로운 페이지로 이동
} else {
  messageDiv.textContent = 'Invalid username or password.';
}

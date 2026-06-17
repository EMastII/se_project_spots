export function setButtonText(
  btn,
  isLoading,
  loadingText = "Saving...",
  defaultText = "Save",
) {
  if (isLoading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = defaultText;
  }
}

export function setDeleteButtonText(
  btn,
  isDeleting,
  deletingText = "Deleting...",
  defaultText = "Delete",
) {
  if (isDeleting) {
    btn.textContent = deletingText;
  } else {
    btn.textContent = defaultText;
  }
}
